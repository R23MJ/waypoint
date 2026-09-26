"use client";

import { useState } from "react";
import Sheet from "@/components/Sheet";
import { useAppStore } from "@/lib/store";

export default function WaitingPrompt({
  taskId,
  onClose,
}: {
  taskId: string | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!taskId} onClose={onClose}>
      {taskId && <WaitingPromptBody key={taskId} taskId={taskId} onClose={onClose} />}
    </Sheet>
  );
}

function WaitingPromptBody({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = useAppStore((s) => s.tasks.find((t) => t.id === taskId));
  const setWaiting = useAppStore((s) => s.setWaiting);
  const [text, setText] = useState(task?.waitingOn ?? "");

  return (
    <>
      <h3 className="font-display text-[16px] font-semibold mb-3">Waiting on whom or what?</h3>
      <input
        type="text"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (setWaiting(taskId, text.trim() || "someone"), onClose())}
        placeholder="e.g. Paul to send the logo files"
        className="w-full bg-bg-2 border border-border rounded-xl px-3 py-2.5 text-[13.5px] mb-4"
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            setWaiting(taskId, text.trim() || "someone");
            onClose();
          }}
          className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
        >
          Mark waiting
        </button>
        {task?.waitingOn && (
          <button
            onClick={() => {
              setWaiting(taskId, null);
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-rust bg-surface-2 active:scale-[0.97] transition-transform"
          >
            Clear
          </button>
        )}
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-text-faint">
          Cancel
        </button>
      </div>
    </>
  );
}
