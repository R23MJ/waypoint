"use client";

import { useState } from "react";
import { Task, Context } from "@/lib/types";

export default function AddTaskForm({
  candidates,
  contexts,
  onSave,
  onCancel,
  autoFocus,
}: {
  candidates: Task[];
  contexts: Context[];
  onSave: (title: string, opts: { dependsOn: string[]; contextIds: string[]; deferUntil: string | null }) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [deps, setDeps] = useState<string[]>([]);
  const [ctxIds, setCtxIds] = useState<string[]>([]);
  const [defer, setDefer] = useState("");

  function toggleDep(id: string) {
    setDeps((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }
  function toggleCtx(id: string) {
    setCtxIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }
  function submit() {
    if (!title.trim()) return;
    onSave(title, { dependsOn: deps, contextIds: ctxIds, deferUntil: defer || null });
  }

  return (
    <div className="bg-surface border border-border-soft rounded-[9px] p-3 mt-1.5">
      <input
        type="text"
        autoFocus={autoFocus}
        placeholder="What's the next step?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13.5px] mb-2.5"
      />

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

      <div className="mb-2.5">
        <div className="text-[11px] text-text-faint mb-1.5">don&apos;t show until (optional)</div>
        <input
          type="date"
          value={defer}
          onChange={(e) => setDefer(e.target.value)}
          className="bg-bg-2 border border-border rounded-md px-2.5 py-1.5 text-[12.5px] text-text-dim"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={submit} className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]">
          Add step
        </button>
        <button onClick={onCancel} className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold text-text-faint">
          Cancel
        </button>
      </div>
    </div>
  );
}
