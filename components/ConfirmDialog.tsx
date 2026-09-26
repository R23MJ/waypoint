"use client";

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
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
      onClick={onCancel}
    >
      <div
        className="bg-surface border border-border rounded-xl p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-semibold mb-2">Are you sure?</h3>
        <p className="text-[13.5px] text-text-dim mb-4">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-rust text-white"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-lg text-[13px] font-semibold text-text-faint hover:text-text-dim"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
