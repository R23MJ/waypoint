"use client";

import { useState } from "react";
import { Task, Context } from "@/lib/types";
import { isBlockedBy, isWaiting, isDeferred, isOverdue, isDueToday, daysSince, describeRecurrence } from "@/lib/gtd";
import { useAppStore } from "@/lib/store";
import { Check, X, Clock, Repeat, Flag, ChevronDown, ChevronRight, Plus, Pencil } from "lucide-react";
import SwipeableRow from "@/components/SwipeableRow";

export default function TaskItem({
  task,
  allTasks,
  contexts,
  projectLabel,
  onToggle,
  onDelete,
  onSetWaiting,
  onEdit,
  dragHandle,
  children,
}: {
  task: Task;
  allTasks: Task[];
  contexts: Context[];
  projectLabel?: string;
  onToggle: () => void;
  onDelete: () => void;
  onSetWaiting?: () => void;
  onEdit?: () => void;
  dragHandle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const addChecklistItem = useAppStore((s) => s.addChecklistItem);
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
  const deleteChecklistItem = useAppStore((s) => s.deleteChecklistItem);

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const blockedBy = isBlockedBy(task, allTasks);
  const blocked = blockedBy.length > 0 && !task.done;
  const waiting = isWaiting(task);
  const deferred = isDeferred(task) && !task.done && !waiting;
  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);
  const taskContexts = contexts.filter((c) => task.contextIds.includes(c.id));
  const checklistDone = task.checklist.filter((c) => c.done).length;

  function submitChecklistItem() {
    if (!newItemText.trim()) return;
    addChecklistItem(task.id, newItemText);
    setNewItemText("");
  }

  return (
    <SwipeableRow onDelete={onDelete} className="mb-2">
      <div
        className={`bg-surface border px-3.5 py-3 ${
          task.priority === "high" && !task.done ? "border-rust/50" : "border-border-soft"
        }`}
      >
        <div className={task.done || blocked || waiting || deferred ? "opacity-70" : ""}>
        <div className="flex items-start gap-2.5">
          <button
            onClick={onToggle}
            disabled={blocked || waiting}
            className={`w-[18px] h-[18px] rounded-[6px] border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              task.done ? "bg-sage border-sage" : "border-slate"
            } ${blocked || waiting ? "cursor-not-allowed" : "cursor-pointer hover:border-amber"}`}
          >
            {task.done && <Check size={12} color="#17191c" strokeWidth={3} />}
          </button>
          <div className="flex-1 min-w-0">
            {projectLabel && (
              <div className="text-[11px] text-text-faint mb-0.5">{projectLabel}</div>
            )}
            <div className="flex items-start gap-1.5">
              {task.priority === "high" && !task.done && (
                <Flag size={12} className="text-rust flex-shrink-0 mt-1" fill="currentColor" />
              )}
              {task.priority === "low" && !task.done && (
                <Flag size={12} className="text-slate flex-shrink-0 mt-1" />
              )}
              <div className={`text-[14.5px] ${task.done ? "line-through text-text-faint" : ""}`}>
                {task.title}
              </div>
              {task.recurrence && (
                <span className="flex-shrink-0 mt-1" title={describeRecurrence(task.recurrence)}>
                  <Repeat size={12} className="text-text-faint" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {taskContexts.map((c) => (
                <span
                  key={c.id}
                  className="text-[10.5px] bg-surface-2 border border-border-soft rounded-md px-1.5 py-0.5 text-text-dim"
                >
                  {c.icon} {c.name}
                </span>
              ))}
              {task.dueDate && !task.done && (
                <span
                  className={`text-[10.5px] rounded-md px-1.5 py-0.5 border ${
                    overdue
                      ? "bg-rust/15 border-rust/40 text-rust"
                      : dueToday
                      ? "bg-amber-dim border-amber text-amber"
                      : "bg-surface-2 border-border-soft text-text-faint"
                  }`}
                >
                  {overdue ? "overdue" : dueToday ? "due today" : `due ${task.dueDate}`}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                title="Edit step"
                className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-text-dim transition-colors"
              >
                <Pencil size={13} />
              </button>
            )}
            {onSetWaiting && !task.done && (
              <button
                onClick={onSetWaiting}
                title="Mark as waiting for someone/something"
                className={`p-1.5 rounded-md hover:bg-surface-2 transition-colors ${waiting ? "text-amber" : "text-text-faint"}`}
              >
                <Clock size={14} />
              </button>
            )}
            <button onClick={onDelete} className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-rust transition-colors hidden sm:inline-flex">
              <X size={14} />
            </button>
            {dragHandle}
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

        {/* Checklist */}
        <div className="ml-[26px] mt-2">
          {(task.checklist.length > 0 || checklistOpen) && (
            <button
              onClick={() => setChecklistOpen((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-text-faint hover:text-text-dim mb-1"
            >
              {checklistOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              checklist {task.checklist.length > 0 && `(${checklistDone}/${task.checklist.length})`}
            </button>
          )}
          {checklistOpen && (
            <div className="flex flex-col gap-1 mb-1.5">
              {task.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleChecklistItem(task.id, item.id)}
                    className={`w-[14px] h-[14px] rounded-[4px] border flex-shrink-0 flex items-center justify-center ${
                      item.done ? "bg-sage border-sage" : "border-slate"
                    }`}
                  >
                    {item.done && <Check size={9} color="#17191c" strokeWidth={3} />}
                  </button>
                  <span className={`text-[12.5px] flex-1 ${item.done ? "line-through text-text-faint" : "text-text-dim"}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteChecklistItem(task.id, item.id)}
                    className="text-text-faint hover:text-rust opacity-0 group-hover:opacity-100"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitChecklistItem()}
                  placeholder="Add checklist item"
                  className="flex-1 bg-bg-2 border border-border rounded-md px-2 py-1 text-[12px]"
                />
                <button onClick={submitChecklistItem} className="text-text-faint hover:text-amber">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}
          {!checklistOpen && task.checklist.length === 0 && (
            <button
              onClick={() => setChecklistOpen(true)}
              className="text-[11px] text-text-faint hover:text-amber"
            >
              + checklist
            </button>
          )}
        </div>

        {children}
        </div>
      </div>
    </SwipeableRow>
  );
}
