"use client";

import { useState } from "react";
import Sheet from "@/components/Sheet";
import { useAppStore } from "@/lib/store";

export default function EditTrackableSheet({ trackableId, onClose }: { trackableId: string | null; onClose: () => void }) {
  return (
    <Sheet open={!!trackableId} onClose={onClose}>
      {trackableId && <EditTrackableBody key={trackableId} trackableId={trackableId} onClose={onClose} />}
    </Sheet>
  );
}

function EditTrackableBody({ trackableId, onClose }: { trackableId: string; onClose: () => void }) {
  const trackable = useAppStore((s) => s.trackables.find((t) => t.id === trackableId));
  const updateTrackable = useAppStore((s) => s.updateTrackable);

  const [name, setName] = useState(trackable?.name ?? "");
  const [target, setTarget] = useState(trackable?.target != null ? String(trackable.target) : "");
  const [unit, setUnit] = useState(trackable?.unit ?? "");

  if (!trackable) return null;

  function save() {
    if (!name.trim()) return;
    updateTrackable(trackableId, {
      name: name.trim(),
      target: trackable!.type === "counter" ? Number(target) || 0 : null,
      unit: trackable!.type === "counter" ? unit.trim() : "",
    });
    onClose();
  }

  return (
    <div>
      <h3 className="font-display text-[16px] font-semibold mb-3">Edit trackable</h3>
      <input
        type="text"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && trackable.type === "boolean" && save()}
        className="w-full bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13.5px] mb-3"
      />
      {trackable.type === "counter" && (
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            placeholder="Target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13px]"
          />
          <input
            type="text"
            placeholder="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="flex-1 bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13px]"
          />
        </div>
      )}
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
