"use client";

import { useState } from "react";
import { Task, Context, Priority, RecurrenceRule, RecurrenceFreq } from "@/lib/types";

export default function AddTaskForm({
  candidates,
  contexts,
  onSave,
  onCancel,
  autoFocus,
}: {
  candidates: Task[];
  contexts: Context[];
  onSave: (
    title: string,
    opts: {
      dependsOn: string[];
      contextIds: string[];
      deferUntil: string | null;
      dueDate: string | null;
      priority: Priority;
      recurrence: RecurrenceRule | null;
    }
  ) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [deps, setDeps] = useState<string[]>([]);
  const [ctxIds, setCtxIds] = useState<string[]>([]);
  const [defer, setDefer] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [recurFreq, setRecurFreq] = useState<RecurrenceFreq | "none">("none");
  const [recurInterval, setRecurInterval] = useState(1);

  function toggleDep(id: string) {
    setDeps((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }
  function toggleCtx(id: string) {
    setCtxIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }
  function submit() {
    if (!title.trim()) return;
    onSave(title, {
      dependsOn: deps,
      contextIds: ctxIds,
      deferUntil: defer || null,
      dueDate: dueDate || null,
      priority,
      recurrence: recurFreq === "none" ? null : { freq: recurFreq, interval: recurInterval },
    });
  }

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-3.5 mt-1.5">
      <input
        type="text"
        autoFocus={autoFocus}
        placeholder="What's the next step?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="w-full bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13.5px] mb-2.5 focus:outline-none focus:border-text-faint transition-colors"
      />

      <div className="mb-2.5">
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
        <div className="mb-2.5">
          <div className="text-[11px] text-text-faint mb-1.5">context (optional)</div>
          <div className="flex flex-wrap gap-1.5">
            {contexts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCtx(c.id)}
                className={`text-[11.5px] rounded-md px-2 py-1 border ${
                  ctxIds.includes(c.id)
                    ? "bg-amber-dim border-amber text-amber"
                    : "bg-bg-2 border-border text-text-dim"
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="mb-2.5">
          <div className="text-[11px] text-text-faint mb-1.5">blocked by (optional)</div>
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

      <div className="flex gap-3 mb-2.5">
        <div className="flex-1">
          <div className="text-[11px] text-text-faint mb-1.5">due date (optional)</div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
          />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-text-faint mb-1.5">don&apos;t show until (optional)</div>
          <input
            type="date"
            value={defer}
            onChange={(e) => setDefer(e.target.value)}
            className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[11px] text-text-faint mb-1.5">repeats (optional)</div>
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
                className="w-14 bg-bg-2 border border-border rounded-md px-2 py-1.5 text-[12.5px] text-text-dim"
              />
              <span className="text-[11.5px] text-text-faint">
                {recurFreq === "daily" ? "day(s)" : recurFreq === "weekly" ? "week(s)" : "month(s)"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={submit} className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform">
          Add step
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-text-faint">
          Cancel
        </button>
      </div>
    </div>
  );
}
