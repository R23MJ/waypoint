"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function SettingsPage() {
  const contexts = useAppStore((s) => s.contexts);
  const addContext = useAppStore((s) => s.addContext);
  const deleteContext = useAppStore((s) => s.deleteContext);
  const importData = useAppStore((s) => s.importData);
  const clearAll = useAppStore((s) => s.clearAll);

  const [newCtxName, setNewCtxName] = useState("");
  const [newCtxIcon, setNewCtxIcon] = useState("\ud83d\udccc");
  const [confirmClear, setConfirmClear] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const state = useAppStore.getState();
    const data = {
      projects: state.projects,
      tasks: state.tasks,
      resources: state.resources,
      contexts: state.contexts,
      inbox: state.inbox,
      somedayIdeas: state.somedayIdeas,
      lastReviewedAt: state.lastReviewedAt,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waypoint-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        importData(data);
      } catch {
        setImportError("That file doesn't look like a valid backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-8 py-7 pb-24 md:pb-16">
      <h1 className="font-display text-[24px] font-bold mb-6">Settings</h1>

      <section className="mb-9">
        <h2 className="text-[13px] font-semibold text-text-faint tracking-wide mb-1">CONTEXTS</h2>
        <p className="text-[12.5px] text-text-faint mb-3">
          Tag steps with where or what you need to do them — filter Next Actions down to just what fits right now.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {contexts.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 text-[12.5px] bg-surface border border-border-soft rounded-md px-2.5 py-1.5"
            >
              {c.icon} {c.name}
              <button onClick={() => deleteContext(c.id)} className="text-text-faint hover:text-rust">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCtxIcon}
            onChange={(e) => setNewCtxIcon(e.target.value)}
            className="w-14 bg-surface border border-border-soft rounded-md px-2 py-2 text-[14px] text-center"
            maxLength={2}
          />
          <input
            type="text"
            placeholder="New context name"
            value={newCtxName}
            onChange={(e) => setNewCtxName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCtxName.trim()) {
                addContext(newCtxName, newCtxIcon || "\ud83d\udccc");
                setNewCtxName("");
              }
            }}
            className="flex-1 bg-surface border border-border-soft rounded-md px-3 py-2 text-[13.5px]"
          />
          <button
            onClick={() => {
              if (newCtxName.trim()) {
                addContext(newCtxName, newCtxIcon || "\ud83d\udccc");
                setNewCtxName("");
              }
            }}
            className="px-3.5 py-2 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]"
          >
            Add
          </button>
        </div>
      </section>

      <section className="mb-9">
        <h2 className="text-[13px] font-semibold text-text-faint tracking-wide mb-1">YOUR DATA</h2>
        <p className="text-[12.5px] text-text-faint mb-3">
          Everything lives only in this browser — there&apos;s no account and nothing is sent anywhere. Export a backup
          regularly, and especially before clearing your browser data or switching devices.
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          <button onClick={exportData} className="px-3.5 py-2 rounded-md text-[13px] font-semibold bg-surface-2 border border-border">
            Export backup (.json)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-md text-[13px] font-semibold bg-surface-2 border border-border"
          >
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {importError && <p className="text-[12.5px] text-rust mb-2">{importError}</p>}
      </section>

      <section>
        <h2 className="text-[13px] font-semibold text-text-faint tracking-wide mb-1">DANGER ZONE</h2>
        <p className="text-[12.5px] text-text-faint mb-3">
          Permanently erase every project, step, and resource on this browser.
        </p>
        <button
          onClick={() => setConfirmClear(true)}
          className="px-3.5 py-2 rounded-md text-[13px] font-semibold text-rust border border-rust/40"
        >
          Clear all data
        </button>
      </section>

      <ConfirmDialog
        open={confirmClear}
        message="This deletes everything on this browser — projects, steps, resources, all of it. There's no undo."
        confirmLabel="Yes, erase everything"
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
