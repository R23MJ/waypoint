"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Trackable } from "@/lib/types";
import { todayISO, trackableValueOn } from "@/lib/gtd";
import { Check, X, Pencil, Plus, Minus } from "lucide-react";

export default function TrackableRow({
  trackable,
  projectLabel,
  onEdit,
  onDelete,
}: {
  trackable: Trackable;
  projectLabel?: string;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  const entries = useAppStore((s) => s.trackableEntries);
  const setTrackableToday = useAppStore((s) => s.setTrackableToday);
  const addTrackableAmount = useAppStore((s) => s.addTrackableAmount);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");

  const today = todayISO();
  const value = trackableValueOn(entries, trackable.id, today);

  if (trackable.type === "boolean") {
    const done = value >= 1;
    return (
      <div className="flex items-center justify-between gap-2 bg-surface border border-border-soft rounded-2xl px-3.5 py-3 mb-2">
        <button
          onClick={() => setTrackableToday(trackable.id, today, done ? 0 : 1)}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
        >
          <span
            className={`w-[18px] h-[18px] rounded-[6px] border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors ${
              done ? "bg-sage border-sage" : "border-slate"
            }`}
          >
            {done && <Check size={12} color="#17191c" strokeWidth={3} />}
          </span>
          <span className="min-w-0">
            {projectLabel && <span className="block text-[11px] text-text-faint">{projectLabel}</span>}
            <span className={`text-[14px] truncate ${done ? "text-text-dim" : ""}`}>{trackable.name}</span>
          </span>
        </button>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-text-dim transition-colors">
              <Pencil size={13} />
            </button>
          )}
          <button onClick={onDelete} className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-rust transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  const target = trackable.target ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

  return (
    <div className="bg-surface border border-border-soft rounded-2xl px-3.5 py-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0">
          {projectLabel && <span className="block text-[11px] text-text-faint">{projectLabel}</span>}
          <span className="text-[14px]">{trackable.name}</span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-text-dim transition-colors">
              <Pencil size={13} />
            </button>
          )}
          <button onClick={onDelete} className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-rust transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11.5px] text-text-faint flex-shrink-0 whitespace-nowrap">
          {value}/{target} {trackable.unit}
        </span>
      </div>

      {showAdd ? (
        <div className="flex gap-1.5">
          <input
            type="number"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTrackableAmount(trackable.id, today, Number(amount) || 0);
                setAmount("");
                setShowAdd(false);
              }
            }}
            placeholder={`amount (${trackable.unit})`}
            className="flex-1 bg-bg-2 border border-border rounded-lg px-2.5 py-1.5 text-[12.5px]"
          />
          <button
            onClick={() => {
              addTrackableAmount(trackable.id, today, Number(amount) || 0);
              setAmount("");
              setShowAdd(false);
            }}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-amber text-[#241d12]"
          >
            <Plus size={13} />
          </button>
          {value > 0 && (
            <button
              onClick={() => {
                addTrackableAmount(trackable.id, today, -(Number(amount) || 0));
                setAmount("");
                setShowAdd(false);
              }}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-surface-2 text-text-dim"
              title="Subtract instead"
            >
              <Minus size={13} />
            </button>
          )}
          <button onClick={() => setShowAdd(false)} className="px-2.5 py-1.5 rounded-lg text-[12px] text-text-faint">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="text-[11.5px] text-amber hover:opacity-80 transition-opacity">
          + add {trackable.unit || "amount"}
        </button>
      )}
    </div>
  );
}
