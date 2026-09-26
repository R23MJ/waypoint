"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { waitingTasks, daysSince } from "@/lib/gtd";
import { Clock, Check, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function WaitingPage() {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const setWaiting = useAppStore((s) => s.setWaiting);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const items = waitingTasks(tasks).sort((a, b) => (a.waitingSince ?? 0) - (b.waitingSince ?? 0));

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-8 py-7 pb-24 md:pb-16">
      <h1 className="font-display text-[24px] font-bold mb-1">Waiting For</h1>
      <p className="text-text-dim text-[14px] mb-6">
        Things you can&apos;t move forward yourself — delegated, or blocked on someone else. Off your list until they come through.
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16 text-text-faint flex flex-col items-center gap-2">
          <Clock size={26} strokeWidth={1.5} />
          <div>Nothing pending on anyone else right now.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((t) => {
            const project = projects.find((p) => p.id === t.projectId);
            const days = t.waitingSince ? daysSince(t.waitingSince) : 0;
            return (
              <div key={t.id} className="bg-surface border border-border-soft rounded-[9px] px-3.5 py-3">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-slate flex-shrink-0 mt-0.5 hover:border-amber"
                    title="Mark done"
                  />
                  <div className="flex-1 min-w-0">
                    {project && (
                      <Link href={`/projects/${project.id}`} className="text-[11px] text-text-faint hover:text-amber">
                        {project.name}
                      </Link>
                    )}
                    <div className="text-[14.5px]">{t.title}</div>
                    <div className="text-[11.5px] text-amber mt-1">
                      waiting on <b className="font-semibold">{t.waitingOn}</b>
                      <span className={`ml-1.5 ${days > 10 ? "text-rust font-semibold" : "text-text-faint"}`}>
                        · {days}d
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setWaiting(t.id, null)}
                      title="Came through — clear waiting"
                      className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-sage"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(t.id)}
                      className="p-1.5 rounded-md text-text-faint hover:bg-surface-2 hover:text-rust"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        message="Remove this step entirely? This can't be undone."
        onConfirm={() => {
          if (confirmDeleteId) deleteTask(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
