"use client";

import { Task, Context } from "@/lib/types";
import { isBlockedBy, isWaiting, isDeferred, daysSince } from "@/lib/gtd";
import { Check, X, Clock } from "lucide-react";

export default function TaskItem({
  task,
  allTasks,
  contexts,
  projectLabel,
  onToggle,
  onDelete,
  onSetWaiting,
  children,
}: {
  task: Task;
  allTasks: Task[];
  contexts: Context[];
  projectLabel?: string;
  onToggle: () => void;
  onDelete: () => void;
  onSetWaiting?: () => void;
  children?: React.ReactNode;
}) {
  const blockedBy = isBlockedBy(task, allTasks);
  const blocked = blockedBy.length > 0 && !task.done;
  const waiting = isWaiting(task);
  const deferred = isDeferred(task) && !task.done && !waiting;
  const taskContexts = contexts.filter((c) => task.contextIds.includes(c.id));

  return (
    <div
      className={`bg-surface border border-border-soft rounded-[9px] px-3.5 py-3 mb-2 ${
        task.done || blocked || waiting || deferred ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          onClick={onToggle}
          disabled={blocked || waiting}
          className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center ${
            task.done ? "bg-sage border-sage" : "border-slate"
          } ${blocked || waiting ? "cursor-not-allowed" : "cursor-pointer hover:border-amber"}`}
        >
          {task.done && <Check size={12} color="#21262c" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          {projectLabel && (
            <div className="text-[11px] text-text-faint mb-0.5">{projectLabel}</div>
          )}
          <div className={`text-[14.5px] ${task.done ? "line-through text-text-faint" : ""}`}>
            {task.title}
          </div>
          {taskContexts.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {taskContexts.map((c) => (
                <span
                  key={c.id}
                  className="text-[10.5px] bg-surface-2 border border-border-soft rounded-md px-1.5 py-0.5 text-text-dim"
                >
                  {c.icon} {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {onSetWaiting && !task.done && (
            <button
              onClick={onSetWaiting}
              title="Mark as waiting for someone/something"
              className={`p-1.5 rounded-md hover:bg-surface-2 ${waiting ? "text-amber" : "text-text-faint"}`}
            >
              <Clock size={14} />
            </button>
          )}
          <button onClick={onDelete} className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-rust">
            <X size={14} />
          </button>
        </div>
      </div>

      {blocked && (
        <div className="text-[11.5px] text-text-faint mt-2 ml-[26px]">
          waiting on <b className="text-slate font-semibold">{blockedBy.map((t) => t.title).join(", ")}</b>
        </div>
      )}
      {waiting && (
        <div className="text-[11.5px] text-amber mt-2 ml-[26px]">
          waiting on <b className="font-semibold">{task.waitingOn}</b>
          {task.waitingSince && <span className="text-text-faint"> · {daysSince(task.waitingSince)}d</span>}
        </div>
      )}
      {deferred && (
        <div className="text-[11.5px] text-text-faint mt-2 ml-[26px]">
          deferred until <b>{task.deferUntil}</b>
        </div>
      )}
      {children}
    </div>
  );
}
