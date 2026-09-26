"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

const OPEN_X = -76;

export default function SwipeableRow({
  onDelete,
  children,
  className = "",
}: {
  onDelete: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(0);
  const openRef = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    startRef.current = e.touches[0].clientX - x;
    setDragging(true);
  }
  function onTouchMove(e: React.TouchEvent) {
    const next = Math.min(0, Math.max(e.touches[0].clientX - startRef.current, OPEN_X - 24));
    setX(next);
  }
  function onTouchEnd() {
    setDragging(false);
    const open = x < OPEN_X / 2;
    openRef.current = open;
    setX(open ? OPEN_X : 0);
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => {
            setX(0);
            onDelete();
          }}
          className="w-[76px] bg-rust text-white flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          if (openRef.current) {
            openRef.current = false;
            setX(0);
          }
        }}
        style={{ transform: `translateX(${x}px)`, transition: dragging ? "none" : "transform 0.2s cubic-bezier(0.16,1,0.3,1)" }}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}
