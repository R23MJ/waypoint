"use client";

import { useState } from "react";
import { TrackableType } from "@/lib/types";

export default function AddTrackableForm({
  onSave,
  onCancel,
}: {
  onSave: (name: string, type: TrackableType, target: number | null, unit: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TrackableType>("boolean");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");

  function submit() {
    if (!name.trim()) return;
    onSave(name, type, type === "counter" ? Number(target) || 0 : null, unit);
  }

  return (
    <div className="bg-surface border border-border-soft rounded-2xl p-3.5 mt-1.5">
      <input
        type="text"
        autoFocus
        placeholder="e.g. Took Creatine, or Calories"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && type === "boolean" && submit()}
        className="w-full bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13.5px] mb-2.5"
      />
      <div className="flex gap-1.5 mb-2.5">
        <button
          type="button"
          onClick={() => setType("boolean")}
          className={`flex-1 text-[12px] rounded-lg px-2.5 py-1.5 border ${
            type === "boolean" ? "bg-amber-dim border-amber text-amber" : "bg-bg-2 border-border text-text-dim"
          }`}
        >
          Yes / no each day
        </button>
        <button
          type="button"
          onClick={() => setType("counter")}
          className={`flex-1 text-[12px] rounded-lg px-2.5 py-1.5 border ${
            type === "counter" ? "bg-amber-dim border-amber text-amber" : "bg-bg-2 border-border text-text-dim"
          }`}
        >
          Running total
        </button>
      </div>
      {type === "counter" && (
        <div className="flex gap-2 mb-2.5">
          <input
            type="number"
            placeholder="Target (e.g. 4000)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13px]"
          />
          <input
            type="text"
            placeholder="Unit (e.g. kcal)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13px]"
          />
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={submit} className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform">
          Add trackable
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-text-faint">
          Cancel
        </button>
      </div>
    </div>
  );
}
