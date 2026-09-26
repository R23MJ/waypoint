"use client";

import { useAppStore } from "@/lib/store";

export default function ProjectProgress({ projectId }: { projectId: string }) {
  const total = useAppStore((s) => s.tasks.filter((t) => t.projectId === projectId).length);
  const done = useAppStore((s) => s.tasks.filter((t) => t.projectId === projectId && t.done).length);

  if (total === 0) return null;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden max-w-[140px]">
        <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10.5px] text-text-faint flex-shrink-0">
        {done}/{total}
      </span>
    </div>
  );
}
