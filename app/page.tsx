"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { isAvailable, tasksForProject, sortByPriorityThenOrder, isOverdue, isDueToday, waitingTasks } from "@/lib/gtd";
import TaskItem from "@/components/TaskItem";
import AddTaskForm from "@/components/AddTaskForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import WaitingPrompt from "@/components/WaitingPrompt";
import { ChevronRight, Compass, Flame } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function NextActionsPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const contexts = useAppStore((s) => s.contexts);
  const displayName = useAppStore((s) => s.displayName);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const addTask = useAppStore((s) => s.addTask);

  const [activeContext, setActiveContext] = useState<string | null>(null);
  const [addingStandalone, setAddingStandalone] = useState(false);
  const [waitingPromptFor, setWaitingPromptFor] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => p.status === "active");
  const activeProjectIds = new Set(activeProjects.map((p) => p.id));

  const filterByContext = (list: typeof tasks) =>
    activeContext ? list.filter((t) => t.contextIds.includes(activeContext)) : list;

  const projectGroups = useMemo(() => {
    return activeProjects
      .map((p) => {
        const projTasks = tasksForProject(tasks, p.id);
        const available = sortByPriorityThenOrder(filterByContext(projTasks.filter((t) => isAvailable(t, tasks))));
        return { project: p, available, hasAnyOpen: projTasks.some((t) => !t.done) };
      })
      .filter((g) => g.hasAnyOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjects, tasks, activeContext]);

  const standaloneAvailable = sortByPriorityThenOrder(
    filterByContext(tasks.filter((t) => t.projectId === null && isAvailable(t, tasks)))
  );
  const standaloneTasks = tasks.filter((t) => t.projectId === null);

  const withSteps = projectGroups.filter((g) => g.available.length > 0);
  const withoutSteps = projectGroups.filter((g) => g.available.length === 0);

  const nothingAtAll = withSteps.length === 0 && standaloneAvailable.length === 0;

  // Dashboard strip — computed across everything, ignoring the context filter.
  const allAvailable = tasks.filter(
    (t) => isAvailable(t, tasks) && (t.projectId === null || activeProjectIds.has(t.projectId))
  );
  const dueCount = tasks.filter((t) => !t.done && (isOverdue(t) || isDueToday(t))).length;
  const waitingCount = waitingTasks(tasks).length;
  const focusTasks = sortByPriorityThenOrder(allAvailable.filter((t) => t.priority === "high")).slice(0, 3);

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8 pb-28 md:pb-16">
      <h1 className="font-display text-[26px] font-bold mb-1.5 tracking-[-0.01em]">
        {greeting()}
        {displayName ? `, ${displayName}` : ""}
      </h1>
      <p className="text-text-dim text-[14px] mb-5">
        Every unblocked next step, across every active project — nothing you can&apos;t start yet.
      </p>

      {(dueCount > 0 || allAvailable.length > 0 || waitingCount > 0) && (
        <div className="flex gap-2 mb-6">
          <StatChip value={dueCount} label={dueCount === 1 ? "due today" : "due today"} tone={dueCount > 0 ? "rust" : "faint"} />
          <StatChip value={allAvailable.length} label="available" tone="amber" />
          <Link href="/waiting" className="flex-1">
            <StatChip value={waitingCount} label="waiting" tone="faint" />
          </Link>
        </div>
      )}

      {focusTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2 px-0.5">
            <Flame size={13} className="text-rust" />
            <h3 className="text-[13px] font-semibold text-text-faint">Focus first</h3>
          </div>
          {focusTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              allTasks={tasks}
              contexts={contexts}
              projectLabel={projects.find((p) => p.id === t.projectId)?.name}
              onToggle={() => toggleTask(t.id)}
              onDelete={() => setConfirmDeleteId(t.id)}
              onSetWaiting={() => setWaitingPromptFor(t.id)}
            />
          ))}
        </div>
      )}

      {contexts.length > 0 && (activeProjects.length > 0 || standaloneTasks.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-6 -mx-0.5">
          <button
            onClick={() => setActiveContext(null)}
            className={`text-[12px] rounded-full px-3 py-1.5 border transition-colors ${
              activeContext === null ? "bg-amber/12 border-amber text-amber" : "bg-surface border-border-soft text-text-dim hover:border-border"
            }`}
          >
            All contexts
          </button>
          {contexts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveContext(c.id)}
              className={`text-[12px] rounded-full px-3 py-1.5 border transition-colors ${
                activeContext === c.id ? "bg-amber/12 border-amber text-amber" : "bg-surface border-border-soft text-text-dim hover:border-border"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      )}

      {nothingAtAll && activeProjects.length === 0 && standaloneTasks.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <Compass size={28} strokeWidth={1.5} className="text-text-faint" />
          <p className="text-text-faint text-[13.5px] max-w-[280px]">
            Nothing set up yet.{" "}
            <Link href="/projects" className="text-amber hover:underline">
              Start a project
            </Link>{" "}
            or capture something in your{" "}
            <Link href="/inbox" className="text-amber hover:underline">
              inbox
            </Link>
            .
          </p>
        </div>
      )}

      {standaloneAvailable.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[13px] font-semibold text-text-faint mb-2 px-0.5">Standalone actions</h3>
          {standaloneAvailable.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              allTasks={tasks}
              contexts={contexts}
              onToggle={() => toggleTask(t.id)}
              onDelete={() => setConfirmDeleteId(t.id)}
              onSetWaiting={() => setWaitingPromptFor(t.id)}
            />
          ))}
        </div>
      )}

      {withSteps.map(({ project, available }) => (
        <div key={project.id} className="bg-surface border border-border-soft rounded-2xl px-4 py-4 mb-3">
          <Link href={`/projects/${project.id}`} className="flex items-center justify-between mb-3 group">
            <h3 className="text-[15px] font-semibold group-hover:text-amber transition-colors">{project.name}</h3>
            <span className="text-[12px] text-text-faint group-hover:text-amber transition-colors flex items-center gap-0.5">
              open <ChevronRight size={13} />
            </span>
          </Link>
          {available.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              allTasks={tasks}
              contexts={contexts}
              onToggle={() => toggleTask(t.id)}
              onDelete={() => setConfirmDeleteId(t.id)}
              onSetWaiting={() => setWaitingPromptFor(t.id)}
            />
          ))}
        </div>
      ))}

      {withoutSteps.length > 0 && (
        <div className="bg-surface/50 border border-border-soft rounded-2xl px-4 py-4 mb-3">
          <h3 className="text-[13px] font-medium text-text-faint mb-1.5">No steps ready</h3>
          {withoutSteps.map(({ project }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block text-[13.5px] text-text-dim py-1.5 hover:text-amber transition-colors"
            >
              {project.name} — add or unblock a step →
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        {addingStandalone ? (
          <AddTaskForm
            candidates={standaloneTasks}
            contexts={contexts}
            autoFocus
            onSave={(title, opts) => {
              addTask(null, title, opts);
              setAddingStandalone(false);
            }}
            onCancel={() => setAddingStandalone(false)}
          />
        ) : (
          <button
            onClick={() => setAddingStandalone(true)}
            className="w-full text-left border border-dashed border-border rounded-2xl px-4 py-3 text-[13.5px] text-text-faint hover:text-text-dim hover:border-text-faint transition-colors"
          >
            + Add a standalone next action
          </button>
        )}
      </div>

      <WaitingPrompt taskId={waitingPromptFor} onClose={() => setWaitingPromptFor(null)} />

      <ConfirmDialog
        open={!!confirmDeleteId}
        message="Remove this step? This can't be undone."
        onConfirm={() => {
          if (confirmDeleteId) deleteTask(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

function StatChip({ value, label, tone }: { value: number; label: string; tone: "rust" | "amber" | "faint" }) {
  const toneClasses =
    tone === "rust" && value > 0
      ? "border-rust/40 bg-rust/10 text-rust"
      : tone === "amber" && value > 0
      ? "border-amber/40 bg-amber/10 text-amber"
      : "border-border-soft bg-surface text-text-faint";
  return (
    <div className={`flex-1 rounded-xl border px-3 py-2.5 text-center ${toneClasses}`}>
      <div className="text-[17px] font-bold font-display leading-none">{value}</div>
      <div className="text-[10.5px] mt-1 opacity-80">{label}</div>
    </div>
  );
}
