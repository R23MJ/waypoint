"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useThemeStore, ThemeMode } from "@/lib/theme-store";
import { X, Sun, Moon, Monitor, Coffee } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

// TODO: swap in your real Buy Me a Coffee page before shipping.
const BUY_ME_A_COFFEE_URL = "https://www.buymeacoffee.com/waypoint";

export default function SettingsPage() {
  const contexts = useAppStore((s) => s.contexts);
  const addContext = useAppStore((s) => s.addContext);
  const deleteContext = useAppStore((s) => s.deleteContext);
  const importData = useAppStore((s) => s.importData);
  const clearAll = useAppStore((s) => s.clearAll);
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const displayName = useAppStore((s) => s.displayName);
  const setDisplayName = useAppStore((s) => s.setDisplayName);

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
      notificationsEnabled: state.notificationsEnabled,
      lastNotifiedDate: state.lastNotifiedDate,
      displayName: state.displayName,
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

  const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: "light", label: "Light", icon: Sun },
    { mode: "dark", label: "Dark", icon: Moon },
    { mode: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-[640px] mx-auto px-5 md:px-8 py-8 pb-28 md:pb-16">
      <h1 className="font-display text-[26px] font-bold mb-8 tracking-[-0.01em]">Settings</h1>

      <SettingsSection title="Appearance" description="How Waypoint looks on this device.">
        <div className="inline-flex bg-surface-2 rounded-xl p-1 gap-1">
          {THEME_OPTIONS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                themeMode === mode ? "bg-surface text-text shadow-sm" : "text-text-faint hover:text-text-dim"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Your name" description="Used only for the greeting on your Next Actions screen.">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="What should Waypoint call you?"
          className="w-full max-w-xs bg-bg-2 border border-border rounded-xl px-3.5 py-2.5 text-[13.5px]"
        />
      </SettingsSection>

      <SettingsSection
        title="Contexts"
        description="Tag steps with where or what you need to do them — filter Next Actions down to just what fits right now."
      >
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {contexts.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 text-[12.5px] bg-surface border border-border-soft rounded-lg px-2.5 py-1.5"
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
            className="w-12 bg-bg-2 border border-border rounded-xl px-2 py-2 text-[14px] text-center"
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
            className="flex-1 bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13.5px]"
          />
          <button
            onClick={() => {
              if (newCtxName.trim()) {
                addContext(newCtxName, newCtxIcon || "\ud83d\udccc");
                setNewCtxName("");
              }
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
          >
            Add
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Due-date reminders"
        description="When enabled, opening the app checks for anything due today or overdue and shows one notification a day. This only fires while a tab or the installed app is open — it's not a background push, since that needs a server."
      >
        <label className="flex items-center gap-2.5 text-[13.5px] cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={async (e) => {
              const on = e.target.checked;
              if (on && typeof window !== "undefined" && "Notification" in window) {
                const perm = await Notification.requestPermission();
                setNotificationsEnabled(perm === "granted");
              } else {
                setNotificationsEnabled(false);
              }
            }}
            className="w-4 h-4 accent-amber"
          />
          Notify me about due tasks when I open the app
        </label>
        {notificationsEnabled === false &&
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "denied" && (
            <p className="text-[12px] text-rust mt-2.5">
              Notifications are blocked for this site in your browser settings — enable them there first.
            </p>
          )}
      </SettingsSection>

      <SettingsSection
        title="Your data"
        description="Everything lives only in this browser — no account, nothing sent anywhere. Export a backup regularly, and especially before clearing browser data or switching devices."
      >
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={exportData}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-surface-2 border border-border-soft hover:border-border transition-colors"
          >
            Export backup (.json)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-surface-2 border border-border-soft hover:border-border transition-colors"
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
      </SettingsSection>

      <SettingsSection title="Danger zone" description="Permanently erase every project, step, and resource on this browser.">
        <button
          onClick={() => setConfirmClear(true)}
          className="px-4 py-2 rounded-xl text-[13px] font-semibold text-rust border border-rust/30 hover:bg-rust/10 transition-colors"
        >
          Clear all data
        </button>
      </SettingsSection>

      <section className="pt-2">
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] text-text-faint hover:text-amber transition-colors"
        >
          <Coffee size={13} />
          Buy me a coffee
        </a>
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

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 pb-8 border-b border-border-soft last:border-b-0">
      <h2 className="text-[14.5px] font-semibold mb-1">{title}</h2>
      <p className="text-[12.5px] text-text-faint mb-3.5 leading-relaxed max-w-[52ch]">{description}</p>
      {children}
    </section>
  );
}
