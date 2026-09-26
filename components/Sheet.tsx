"use client";

import { useEffect } from "react";

export default function Sheet({
  open,
  onClose,
  children,
  maxWidth = "max-w-sm",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed left-0 right-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ top: "var(--vv-top, 0px)", height: "var(--vv-height, 100dvh)" }}
      onClick={onClose}
    >
      <div
        data-surface
        className={`bg-surface border border-border-soft w-full ${maxWidth} sm:rounded-2xl rounded-t-2xl shadow-lg p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-5 animate-sheet-up sm:animate-pop-in max-h-full overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-9 h-1 rounded-full bg-border mx-auto -mt-1.5 mb-3.5" />
        {children}
      </div>
    </div>
  );
}
