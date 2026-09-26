"use client";

import Sheet from "@/components/Sheet";

export default function ConfirmDialog({
  open,
  message,
  confirmLabel = "Yes, remove it",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet open={open} onClose={onCancel}>
      <h3 className="font-display text-[16px] font-semibold mb-2">Are you sure?</h3>
      <p className="text-[13.5px] text-text-dim mb-5 leading-relaxed">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[13.5px] font-semibold bg-rust text-white active:scale-[0.97] transition-transform"
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-text-dim bg-surface-2 active:scale-[0.97] transition-transform"
        >
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
