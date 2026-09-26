"use client";

import { useState } from "react";
import Sheet from "@/components/Sheet";
import { useAppStore } from "@/lib/store";
import { Inbox } from "lucide-react";

export default function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addInboxItem = useAppStore((s) => s.addInboxItem);
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    addInboxItem(text);
    setText("");
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <Inbox size={16} className="text-amber" />
        <h3 className="font-display text-[16px] font-semibold">Quick capture</h3>
      </div>
      <p className="text-[12.5px] text-text-faint mb-3">
        Goes straight to your inbox — sort it into a project or next action whenever.
      </p>
      <input
        type="text"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="What's on your mind?"
        className="w-full bg-bg-2 border border-border rounded-xl px-3 py-2.5 text-[14px] mb-4"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[13.5px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
        >
          Capture
        </button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-text-faint">
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
