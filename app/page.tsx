"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { isAvailable, tasksForProject, sortByPriorityThenOrder } from "@/lib/gtd";
import TaskItem from "@/components/TaskItem";
import AddTaskForm from "@/components/AddTaskForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ChevronRight } from "lucide-react";

export default function NextActionsPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const contexts = useAppStore((s) => s.contexts);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const setWaiting = useAppStore((s) => s.setWaiting);
  const addTask = useAppStore((s) => s.addTask);

  const [activeContext, setActiveContext] = useState<string | null>(null);
  const [addingStandalone, setAddingStandalone] = useState(false);
  const [waitingPromptFor, setWaitingPromptFor] = useState<string | null>(null);
  const [waitingText, setWaitingText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => p.status === "active");

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

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-8 py-7 pb-24 md:pb-16">
      <h1 className="font-display text-[24px] font-bold mb-1">What do you want to work on?</h1>
      <p className="text-text-dim text-[14px] mb-5">
        Every unblocked next step, across every active project — nothing you can&apos;t start yet.
      </p>

      {contexts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setActiveContext(null)}
            className={`text-[12px] rounded-full px-3 py-1.5 border ${
              activeContext === null ? "bg-amber-dim border-amber text-amber" : "bg-surface border-border-soft text-text-dim"
            }`}
          >
            All contexts
          </button>
          {contexts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveContext(c.id)}
              className={`text-[12px] rounded-full px-3 py-1.5 border ${
                activeContext === c.id ? "bg-amber-dim border-amber text-amber" : "bg-surface border-border-soft text-text-dim"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      )}

      {nothingAtAll && activeProjects.length === 0 && standaloneTasks.length === 0 && (
        <div className="text-center py-16 text-text-faint">
          Nothing set up yet.{" "}
          <Link href="/projects" className="text-amber hover:underline">
            Start a project
          </Link>{" "}
          or capture something in your{" "}
          <Link href="/inbox" className="text-amber hover:underline">
            inbox
          </Link>
          .
        </div>
      )}

      {standaloneAvailable.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-[15px] font-semibold">Standalone actions</h3>
          </div>
          {standaloneAvailable.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              allTasks={tasks}
              contexts={contexts}
              onToggle={() => toggleTask(t.id)}
              onDelete={() => setConfirmDeleteId(t.id)}
              onSetWaiting={() => {
                setWaitingPromptFor(t.id);
                setWaitingText(t.waitingOn ?? "");
              }}
            />
          ))}
        </div>
      )}

      {withSteps.map(({ project, available }) => (
        <div key={project.id} className="bg-surface border border-border-soft rounded-[10px] px-4 py-3.5 mb-3">
          <Link href={`/projects/${project.id}`} className="flex items-center justify-between mb-2.5 group">
            <h3 className="text-[15px] font-semibold group-hover:text-amber">{project.name}</h3>
            <span className="text-[12px] text-text-faint group-hover:text-amber flex items-center gap-0.5">
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
              onSetWaiting={() => {
                setWaitingPromptFor(t.id);
                setWaitingText(t.waitingOn ?? "");
              }}
            />
          ))}
        </div>
      ))}

      {withoutSteps.length > 0 && (
        <div className="bg-surface/60 border border-border-soft rounded-[10px] px-4 py-3.5 mb-3 opacity-60">
          <h3 className="text-[14px] font-medium mb-2">No steps ready</h3>
          {withoutSteps.map(({ project }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block text-[13.5px] py-1.5 hover:text-amber"
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
            className="w-full text-left border border-dashed border-border rounded-[9px] px-4 py-2.5 text-[13.5px] text-text-faint hover:text-text-dim hover:border-text-faint"
          >
            + Add a standalone next action
          </button>
        )}
      </div>

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
