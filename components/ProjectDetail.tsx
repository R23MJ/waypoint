"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { tasksForProject, isAvailable, isBlocked, isWaiting } from "@/lib/gtd";
import { ProjectStatus } from "@/lib/types";
import TaskItem from "@/components/TaskItem";
import AddTaskForm from "@/components/AddTaskForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import WaitingPrompt from "@/components/WaitingPrompt";
import EditTaskSheet from "@/components/EditTaskSheet";
import TrackableRow from "@/components/TrackableRow";
import AddTrackableForm from "@/components/AddTrackableForm";
import EditTrackableSheet from "@/components/EditTrackableSheet";
import { ResourceChip, ResourceCard, ResourceForm } from "@/components/Resources";
import { ChevronDown, ChevronRight, GripVertical, ArrowLeft } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ProjectDetail({
  projectId,
  onBack,
  onDeleted,
}: {
  projectId: string;
  onBack?: () => void;
  onDeleted?: () => void;
}) {
  const project = useAppStore((s) => s.projects.find((p) => p.id === projectId));
  const tasks = useAppStore((s) => s.tasks);
  const resources = useAppStore((s) => s.resources);
  const contexts = useAppStore((s) => s.contexts);
  const allTrackables = useAppStore((s) => s.trackables);
  const trackables = allTrackables.filter((t) => t.projectId === projectId).sort((a, b) => a.order - b.order);

  const updateProject = useAppStore((s) => s.updateProject);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const addTask = useAppStore((s) => s.addTask);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const addResource = useAppStore((s) => s.addResource);
  const deleteResource = useAppStore((s) => s.deleteResource);
  const reorderTasks = useAppStore((s) => s.reorderTasks);
  const addTrackable = useAppStore((s) => s.addTrackable);
  const deleteTrackable = useAppStore((s) => s.deleteTrackable);

  const [addingTask, setAddingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [addingGeneralRes, setAddingGeneralRes] = useState(false);
  const [addingTrackable, setAddingTrackable] = useState(false);
  const [resFormForTask, setResFormForTask] = useState<string | null>(null);
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [confirmDeleteTrackableId, setConfirmDeleteTrackableId] = useState<string | null>(null);
  const [waitingPromptFor, setWaitingPromptFor] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTrackableId, setEditingTrackableId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  if (!project) {
    return (
      <div className="px-5 py-10 text-text-faint text-[13.5px]">
        Project not found.
        {onBack && (
          <button onClick={onBack} className="text-amber underline ml-1">
            Go back
          </button>
        )}
      </div>
    );
  }

  const projTasks = tasksForProject(tasks, project.id);
  const openTasks = projTasks.filter((t) => !t.done);
  // Manual order, not priority-forced — this list is exactly where sequencing
  // by hand matters most, so priority stays a badge here rather than a sort key.
  const next = openTasks.filter((t) => isAvailable(t, tasks)).sort((a, b) => a.order - b.order);
  const blocked = openTasks.filter((t) => !isWaiting(t) && isBlocked(t, tasks));
  const waiting = openTasks.filter((t) => isWaiting(t));
  const done = projTasks.filter((t) => t.done);
  const generalResources = resources.filter((r) => r.projectId === project.id && !r.taskId);

  function resourcesFor(taskId: string) {
    return resources.filter((r) => r.taskId === taskId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = next.map((t) => t.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...ids];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, String(active.id));
    reorderTasks(reordered);
  }

  function renderTask(t: (typeof projTasks)[number], dragHandle?: React.ReactNode) {
    const tRes = resourcesFor(t.id);
    return (
      <TaskItem
        key={t.id}
        task={t}
        allTasks={tasks}
        contexts={contexts}
        dragHandle={dragHandle}
        onToggle={() => toggleTask(t.id)}
        onDelete={() => setConfirmDeleteTaskId(t.id)}
        onSetWaiting={() => setWaitingPromptFor(t.id)}
        onEdit={() => setEditingTaskId(t.id)}
      >
        {tRes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 ml-[26px]">
            {tRes.map((r) => (
              <ResourceChip key={r.id} resource={r} onDelete={() => deleteResource(r.id)} />
            ))}
          </div>
        )}
        {resFormForTask === t.id ? (
          <div className="ml-[26px]">
            <ResourceForm
              onSave={(data) => {
                addResource({ projectId, taskId: t.id, ...data });
                setResFormForTask(null);
              }}
              onCancel={() => setResFormForTask(null)}
            />
          </div>
        ) : (
          <button
            onClick={() => setResFormForTask(t.id)}
            className="text-[11.5px] text-text-faint hover:text-amber mt-2 ml-[26px] transition-colors"
          >
            + attach resource
          </button>
        )}
      </TaskItem>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8 pb-28 md:pb-16">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[12.5px] text-text-faint hover:text-text-dim mb-4 -ml-1"
        >
          <ArrowLeft size={14} /> All projects
        </button>
      )}

      {/* Header */}
      <input
        defaultValue={project.name}
        key={project.id}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== project.name) updateProject(project.id, { name: v });
          else e.target.value = project.name;
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="font-display text-[26px] font-bold bg-transparent border border-transparent hover:border-border-soft focus:border-border rounded-xl px-2 py-1 -ml-2 w-full outline-none mb-2.5 tracking-[-0.01em] transition-colors"
      />
      <div className="flex flex-wrap items-center gap-2 mb-3.5">
        <select
          value={project.status}
          onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
          className="bg-surface border border-border-soft rounded-lg px-2.5 py-1.5 text-[12.5px] text-text-dim"
        >
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="someday">Someday / maybe</option>
        </select>
        {project.status === "scheduled" && (
          <input
            type="date"
            value={project.scheduledDate ?? ""}
            onChange={(e) => updateProject(project.id, { scheduledDate: e.target.value })}
            className="bg-surface border border-border-soft rounded-lg px-2.5 py-1.5 text-[12.5px] text-text-dim"
          />
        )}
        <button
          onClick={() => setConfirmDeleteProject(true)}
          className="ml-auto text-[12px] text-text-faint hover:text-rust px-2 py-1.5 transition-colors"
        >
          Delete project
        </button>
      </div>
      <textarea
        defaultValue={project.notes}
        key={project.id + "-notes"}
        placeholder="Notes about this project..."
        onBlur={(e) => {
          if (e.target.value !== project.notes) updateProject(project.id, { notes: e.target.value });
        }}
        className="w-full bg-surface border border-border-soft rounded-xl px-3.5 py-3 text-[13.5px] text-text-dim min-h-[46px] resize-y mb-7 focus:outline-none focus:border-border transition-colors"
      />

      {/* Trackables — daily habits and running totals, e.g. "Took Creatine" or "0/4000 kcal" */}
      {(trackables.length > 0 || addingTrackable) && (
        <Section title="Today" count={trackables.length}>
          {trackables.map((tr) => (
            <TrackableRow
              key={tr.id}
              trackable={tr}
              onEdit={() => setEditingTrackableId(tr.id)}
              onDelete={() => setConfirmDeleteTrackableId(tr.id)}
            />
          ))}
          {addingTrackable ? (
            <AddTrackableForm
              onSave={(name, type, target, unit) => {
                addTrackable(project.id, name, type, target, unit);
                setAddingTrackable(false);
              }}
              onCancel={() => setAddingTrackable(false)}
            />
          ) : (
            <button
              onClick={() => setAddingTrackable(true)}
              className="w-full text-left border border-dashed border-border rounded-2xl px-4 py-3 text-[13.5px] text-text-faint hover:text-text-dim hover:border-text-faint mt-1.5 transition-colors"
            >
              + Track something daily
            </button>
          )}
        </Section>
      )}
      {trackables.length === 0 && !addingTrackable && (
        <button
          onClick={() => setAddingTrackable(true)}
          className="w-full text-left border border-dashed border-border rounded-2xl px-4 py-3 text-[13.5px] text-text-faint hover:text-text-dim hover:border-text-faint mb-1 transition-colors"
        >
          + Track something daily (a habit, or a running total like calories)
        </button>
      )}

      {/* Next steps — drag to reorder */}
      <Section title="Next steps" count={next.length}>
        {next.length === 0 && <EmptyNote>nothing ready — add a step below</EmptyNote>}
        {next.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={next.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {next.map((t) => (
                <SortableTaskRow key={t.id} id={t.id}>
                  {(handle) => renderTask(t, handle)}
                </SortableTaskRow>
              ))}
            </SortableContext>
          </DndContext>
        )}
        {addingTask ? (
          <AddTaskForm
            candidates={projTasks}
            contexts={contexts}
            autoFocus
            onSave={(title, opts) => {
              addTask(project.id, title, opts);
              setAddingTask(false);
            }}
            onCancel={() => setAddingTask(false)}
          />
        ) : (
          <button
            onClick={() => setAddingTask(true)}
            className="w-full text-left border border-dashed border-border rounded-2xl px-4 py-3 text-[13.5px] text-text-faint hover:text-text-dim hover:border-text-faint mt-1.5 transition-colors"
          >
            + Add a step
          </button>
        )}
      </Section>

      {/* Blocked */}
      {blocked.length > 0 && (
        <Section title="Blocked" count={blocked.length}>
          {blocked.map((t) => renderTask(t))}
        </Section>
      )}

      {/* Waiting */}
      {waiting.length > 0 && (
        <Section title="Waiting for" count={waiting.length}>
          {waiting.map((t) => renderTask(t))}
        </Section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <Section
          title="Done"
          count={done.length}
          collapsible
          collapsed={!showDone}
          onToggle={() => setShowDone((v) => !v)}
        >
          {showDone && done.map((t) => renderTask(t))}
        </Section>
      )}

      {/* Resources */}
      <Section title="Resources" count={generalResources.length}>
        <div className="flex flex-col gap-1.5">
          {generalResources.map((r) => (
            <ResourceCard key={r.id} resource={r} onDelete={() => deleteResource(r.id)} />
          ))}
        </div>
        {addingGeneralRes ? (
          <ResourceForm
            onSave={(data) => {
              addResource({ projectId: project.id, taskId: null, ...data });
              setAddingGeneralRes(false);
            }}
            onCancel={() => setAddingGeneralRes(false)}
          />
        ) : (
          <button
            onClick={() => setAddingGeneralRes(true)}
            className="w-full text-left border border-dashed border-border rounded-2xl px-4 py-3 text-[13.5px] text-text-faint hover:text-text-dim mt-1.5 transition-colors"
          >
            + Save an article, link, note, video...
          </button>
        )}
      </Section>

      <WaitingPrompt taskId={waitingPromptFor} onClose={() => setWaitingPromptFor(null)} />
      <EditTaskSheet taskId={editingTaskId} onClose={() => setEditingTaskId(null)} />
      <EditTrackableSheet trackableId={editingTrackableId} onClose={() => setEditingTrackableId(null)} />
      <ConfirmDialog
        open={!!confirmDeleteTrackableId}
        message="Remove this trackable? Its logged history goes with it."
        onConfirm={() => {
          if (confirmDeleteTrackableId) deleteTrackable(confirmDeleteTrackableId);
          setConfirmDeleteTrackableId(null);
        }}
        onCancel={() => setConfirmDeleteTrackableId(null)}
      />

      <ConfirmDialog
        open={!!confirmDeleteTaskId}
        message="Remove this step? This can't be undone."
        onConfirm={() => {
          if (confirmDeleteTaskId) deleteTask(confirmDeleteTaskId);
          setConfirmDeleteTaskId(null);
        }}
        onCancel={() => setConfirmDeleteTaskId(null)}
      />
      <ConfirmDialog
        open={confirmDeleteProject}
        message={`Delete "${project.name}"? This removes its steps and resources too.`}
        onConfirm={() => {
          deleteProject(project.id);
          if (onDeleted) onDeleted();
        }}
        onCancel={() => setConfirmDeleteProject(false)}
      />
    </div>
  );
}

function SortableTaskRow({ id, children }: { id: string; children: (handle: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const handle = (
    <button
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      className="p-1.5 text-text-faint hover:text-text-dim cursor-grab active:cursor-grabbing touch-none"
      aria-label="Drag to reorder"
    >
      <GripVertical size={14} />
    </button>
  );
  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  );
}

function Section({
  title,
  count,
  children,
  collapsible,
  collapsed,
  onToggle,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="mt-8">
      <div
        className={`flex items-center gap-1.5 mb-2.5 ${collapsible ? "cursor-pointer" : ""}`}
        onClick={collapsible ? onToggle : undefined}
      >
        <h2 className="text-[14px] font-semibold">{title}</h2>
        <span className="text-[12px] text-text-faint">{count}</span>
        {collapsible &&
          (collapsed ? (
            <ChevronRight size={13} className="text-text-faint" />
          ) : (
            <ChevronDown size={13} className="text-text-faint" />
          ))}
      </div>
      {children}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] text-text-faint italic py-1 mb-1">{children}</div>;
}
