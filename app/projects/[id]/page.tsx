"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  tasksForProject,
  isAvailable,
  isBlocked,
  isWaiting,
} from "@/lib/gtd";
import { ProjectStatus } from "@/lib/types";
import TaskItem from "@/components/TaskItem";
import AddTaskForm from "@/components/AddTaskForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ResourceChip, ResourceCard, ResourceForm } from "@/components/Resources";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const pid = params.id;
  const router = useRouter();

  const project = useAppStore((s) => s.projects.find((p) => p.id === pid));
  const tasks = useAppStore((s) => s.tasks);
  const resources = useAppStore((s) => s.resources);
  const contexts = useAppStore((s) => s.contexts);

  const updateProject = useAppStore((s) => s.updateProject);
  const deleteProject = useAppStore((s) => s.deleteProject);
  const addTask = useAppStore((s) => s.addTask);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const setWaiting = useAppStore((s) => s.setWaiting);
  const addResource = useAppStore((s) => s.addResource);
  const deleteResource = useAppStore((s) => s.deleteResource);

  const [addingTask, setAddingTask] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [addingGeneralRes, setAddingGeneralRes] = useState(false);
  const [resFormForTask, setResFormForTask] = useState<string | null>(null);
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [waitingPromptFor, setWaitingPromptFor] = useState<string | null>(null);
  const [waitingText, setWaitingText] = useState("");

  if (!project) {
    return (
      <div className="max-w-[680px] mx-auto px-5 py-10 text-text-faint">
        Project not found. <button onClick={() => router.push("/projects")} className="text-amber underline">Back to projects</button>
      </div>
    );
  }

  const projectId = project.id;
  const projTasks = tasksForProject(tasks, project.id);
  const openTasks = projTasks.filter((t) => !t.done);
  const next = openTasks.filter((t) => isAvailable(t, tasks));
  const blocked = openTasks.filter((t) => !isWaiting(t) && isBlocked(t, tasks));
  const waiting = openTasks.filter((t) => isWaiting(t));
  const done = projTasks.filter((t) => t.done);
  const generalResources = resources.filter((r) => r.projectId === project.id && !r.taskId);

  function resourcesFor(taskId: string) {
    return resources.filter((r) => r.taskId === taskId);
  }

  function renderTask(t: (typeof projTasks)[number]) {
    const tRes = resourcesFor(t.id);
    return (
      <TaskItem
        key={t.id}
        task={t}
        allTasks={tasks}
        contexts={contexts}
        onToggle={() => toggleTask(t.id)}
        onDelete={() => setConfirmDeleteTaskId(t.id)}
        onSetWaiting={() => {
          setWaitingPromptFor(t.id);
          setWaitingText(t.waitingOn ?? "");
        }}
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
            className="text-[11.5px] text-text-faint hover:text-amber mt-2 ml-[26px]"
          >
            + attach resource
          </button>
        )}
      </TaskItem>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-8 py-7 pb-24 md:pb-16">
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
        className="font-display text-[24px] font-bold bg-transparent border border-transparent hover:border-border-soft focus:border-border rounded-lg px-1.5 py-0.5 -ml-1.5 w-full outline-none mb-2"
      />
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select
          value={project.status}
          onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
          className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
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
            className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
          />
        )}
        <button
          onClick={() => setConfirmDeleteProject(true)}
          className="ml-auto text-[12px] text-text-faint hover:text-rust px-2 py-1.5"
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
        className="w-full bg-surface border border-border-soft rounded-lg px-3 py-2.5 text-[13.5px] text-text-dim min-h-[44px] resize-y mb-6"
      />

      {/* Next steps */}
      <Section title="NEXT STEPS" count={next.length}>
        {next.length === 0 && <EmptyNote>nothing ready — add a step below</EmptyNote>}
        {next.map(renderTask)}
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
            className="w-full text-left border border-dashed border-border rounded-[9px] px-4 py-2.5 text-[13.5px] text-text-faint hover:text-text-dim mt-1.5"
          >
            + Add a step
          </button>
        )}
      </Section>

      {/* Blocked */}
      {blocked.length > 0 && (
        <Section title="BLOCKED" count={blocked.length}>
          {blocked.map(renderTask)}
        </Section>
      )}

      {/* Waiting */}
      {waiting.length > 0 && (
        <Section title="WAITING FOR" count={waiting.length}>
          {waiting.map(renderTask)}
        </Section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <Section
          title="DONE"
          count={done.length}
          collapsible
          collapsed={!showDone}
          onToggle={() => setShowDone((v) => !v)}
        >
          {showDone && done.map(renderTask)}
        </Section>
      )}

      {/* Resources */}
      <Section title="RESOURCES" count={generalResources.length}>
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
            className="w-full text-left border border-dashed border-border rounded-[9px] px-4 py-2.5 text-[13.5px] text-text-faint hover:text-text-dim mt-1.5"
          >
            + Save an article, link, note, video...
          </button>
        )}
      </Section>

      {/* Waiting-on prompt modal */}
      {waitingPromptFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5" onClick={() => setWaitingPromptFor(null)}>
          <div className="bg-surface border border-border rounded-xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-3">Waiting on whom or what?</h3>
            <input
              type="text"
              autoFocus
              value={waitingText}
              onChange={(e) => setWaitingText(e.target.value)}
              placeholder="e.g. Paul to send the logo files"
              className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13.5px] mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setWaiting(waitingPromptFor, waitingText.trim() || "someone");
                  setWaitingPromptFor(null);
                }}
                className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]"
              >
                Mark waiting
              </button>
              {tasks.find((t) => t.id === waitingPromptFor)?.waitingOn && (
                <button
                  onClick={() => {
                    setWaiting(waitingPromptFor, null);
                    setWaitingPromptFor(null);
                  }}
                  className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold text-rust"
                >
                  Clear
                </button>
              )}
              <button onClick={() => setWaitingPromptFor(null)} className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold text-text-faint">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
          router.push("/projects");
        }}
        onCancel={() => setConfirmDeleteProject(false)}
      />
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
    <div className="mt-7">
      <div
        className={`flex items-center gap-2 mb-2.5 ${collapsible ? "cursor-pointer" : ""}`}
        onClick={collapsible ? onToggle : undefined}
      >
        <h2 className="text-[12px] font-semibold text-text-faint tracking-wide">{title}</h2>
        <span className="text-[11.5px] text-text-faint">{count}</span>
        {collapsible && <span className="text-[10px] text-text-faint">{collapsed ? "▸ show" : "▾ hide"}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] text-text-faint italic py-1 mb-1">{children}</div>;
}
