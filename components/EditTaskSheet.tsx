"use client";

import { useState } from "react";
import Sheet from "@/components/Sheet";
import { useAppStore } from "@/lib/store";
import { Priority, RecurrenceFreq } from "@/lib/types";

export default function EditTaskSheet({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  return (
    <Sheet open={!!taskId} onClose={onClose} maxWidth="max-w-md">
      {taskId && <EditTaskBody key={taskId} taskId={taskId} onClose={onClose} />}
    </Sheet>
  );
}

function EditTaskBody({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = useAppStore((s) => s.tasks.find((t) => t.id === taskId));
  const allTasks = useAppStore((s) => s.tasks);
  const contexts = useAppStore((s) => s.contexts);
  const updateTask = useAppStore((s) => s.updateTask);

  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "normal");
  const [ctxIds, setCtxIds] = useState<string[]>(task?.contextIds ?? []);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [defer, setDefer] = useState(task?.deferUntil ?? "");
  const [deps, setDeps] = useState<string[]>(task?.dependsOn ?? []);
  const [recurFreq, setRecurFreq] = useState<RecurrenceFreq | "none">(task?.recurrence?.freq ?? "none");
  const [recurInterval, setRecurInterval] = useState(task?.recurrence?.interval ?? 1);
  const [tracking, setTracking] = useState(task?.trackTarget !== null && task?.trackTarget !== undefined);
  const [trackTarget, setTrackTarget] = useState(task?.trackTarget != null ? String(task.trackTarget) : "");
  const [trackUnit, setTrackUnit] = useState(task?.trackUnit ?? "");

  if (!task) return null;

  const candidates = allTasks.filter((t) => t.id !== taskId && t.projectId === task.projectId);

  function toggleCtx(id: string) {
    setCtxIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }
  function toggleDep(id: string) {
    setDeps((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }
  function save() {
    if (!title.trim()) return;
    updateTask(taskId, {
      title: title.trim(),
      priority,
      contextIds: ctxIds,
      dueDate: dueDate || null,
      deferUntil: defer || null,
      dependsOn: deps,
      recurrence: recurFreq === "none" ? null : { freq: recurFreq, interval: recurInterval },
      trackTarget: tracking ? Number(trackTarget) || 0 : null,
      trackUnit: tracking ? trackUnit.trim() : "",
    });
    onClose();
  }

  return (
    <div>
      <h3 className="font-display text-[16px] font-semibold mb-3">Edit step</h3>

      <input
        type="text"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="w-full bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13.5px] mb-3"
      />

      <div className="mb-3">
        <div className="text-[11px] text-text-faint mb-1.5">priority</div>
        <div className="flex gap-1.5">
          {(["low", "normal", "high"] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`text-[11.5px] rounded-md px-2.5 py-1 border capitalize ${
                priority === p
                  ? p === "high"
                    ? "bg-rust/20 border-rust text-rust"
                    : p === "low"
                    ? "bg-surface-2 border-slate text-slate"
                    : "bg-amber-dim border-amber text-amber"
                  : "bg-bg-2 border-border text-text-dim"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {contexts.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] text-text-faint mb-1.5">context</div>
          <div className="flex flex-wrap gap-1.5">
            {contexts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCtx(c.id)}
                className={`text-[11.5px] rounded-md px-2 py-1 border ${
                  ctxIds.includes(c.id) ? "bg-amber-dim border-amber text-amber" : "bg-bg-2 border-border text-text-dim"
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] text-text-faint mb-1.5">blocked by</div>
          <div className="border border-border-soft rounded-md p-2 max-h-[110px] overflow-y-auto bg-bg-2">
            {candidates.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-[12.5px] text-text-dim py-1 cursor-pointer">
                <input type="checkbox" checked={deps.includes(t.id)} onChange={() => toggleDep(t.id)} />
                {t.title}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-text-faint mb-1.5">due date</div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full min-w-0 bg-bg-2 border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-text-faint mb-1.5">don&apos;t show until</div>
          <input
            type="date"
            value={defer}
            onChange={(e) => setDefer(e.target.value)}
            className="w-full min-w-0 bg-bg-2 border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[11px] text-text-faint mb-1.5">repeats</div>
        <div className="flex items-center gap-1.5">
          <select
            value={recurFreq}
            onChange={(e) => setRecurFreq(e.target.value as RecurrenceFreq | "none")}
            className="bg-bg-2 border border-border rounded-md px-2 py-1.5 text-[12.5px] text-text-dim"
          >
            <option value="none">Doesn&apos;t repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {recurFreq !== "none" && (
            <>
              <span className="text-[11.5px] text-text-faint">every</span>
              <input
                type="number"
                min={1}
                max={365}
                value={recurInterval}
                onChange={(e) => setRecurInterval(Math.max(1, Number(e.target.value) || 1))}
                className="w-14 flex-shrink-0 bg-bg-2 border border-border rounded-md px-2 py-1.5 text-[12.5px] text-text-dim"
              />
              <span className="text-[11.5px] text-text-faint">
                {recurFreq === "daily" ? "day(s)" : recurFreq === "weekly" ? "week(s)" : "month(s)"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[11px] text-text-faint mb-1.5">type</div>
        <div className="flex gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => setTracking(false)}
            className={`text-[11.5px] rounded-md px-2.5 py-1 border ${
              !tracking ? "bg-amber-dim border-amber text-amber" : "bg-bg-2 border-border text-text-dim"
            }`}
          >
            ✓ Simple
          </button>
          <button
            type="button"
            onClick={() => setTracking(true)}
            className={`text-[11.5px] rounded-md px-2.5 py-1 border ${
              tracking ? "bg-amber-dim border-amber text-amber" : "bg-bg-2 border-border text-text-dim"
            }`}
          >
            # Numeric
          </button>
        </div>
        {tracking && (
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-text-faint flex-shrink-0">Goal:</span>
            <input
              type="number"
              placeholder="4000"
              value={trackTarget}
              onChange={(e) => setTrackTarget(e.target.value)}
              className="w-20 min-w-0 flex-shrink-0 bg-bg-2 border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
            />
            <input
              type="text"
              placeholder="unit (kcal)"
              value={trackUnit}
              onChange={(e) => setTrackUnit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="flex-1 min-w-0 bg-bg-2 border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
        >
          Save changes
        </button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-text-faint">
          Cancel
        </button>
      </div>
    </div>
  );
}
