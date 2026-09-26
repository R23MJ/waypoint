"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { searchAll } from "@/lib/search";
import { typeIcon } from "@/components/Resources";
import { X, Search as SearchIcon, Compass, Inbox, FolderKanban, Clock, RefreshCw, Plus } from "lucide-react";

export default function SearchOverlay({
  onClose,
  onQuickCapture,
}: {
  onClose: () => void;
  onQuickCapture?: () => void;
}) {
  const router = useRouter();
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const resources = useAppStore((s) => s.resources);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = searchAll(q, { projects, tasks, resources });
  const hasQuery = q.trim().length > 0;
  const nothingFound =
    hasQuery && results.projects.length === 0 && results.tasks.length === 0 && results.resources.length === 0;

  const ACTIONS = [
    { label: "Quick capture", icon: Plus, run: () => onQuickCapture?.() },
    { label: "Go to Next Actions", icon: Compass, run: () => router.push("/") },
    { label: "Go to Inbox", icon: Inbox, run: () => router.push("/inbox") },
    { label: "Go to Projects", icon: FolderKanban, run: () => router.push("/projects") },
    { label: "Go to Waiting For", icon: Clock, run: () => router.push("/waiting") },
    { label: "Go to Review", icon: RefreshCw, run: () => router.push("/review") },
  ].filter((a) => a.label.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="fixed left-0 right-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-start justify-center p-4 pt-[10vh] animate-fade-in" style={{ top: "var(--vv-top, 0px)", height: "var(--vv-height, 100dvh)" }} onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden shadow-lg animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-soft">
          <SearchIcon size={16} className="text-text-faint flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search, or jump somewhere…"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
          <button onClick={onClose} className="text-text-faint hover:text-text flex-shrink-0">
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-2 py-2">
          {!hasQuery && ACTIONS.length > 0 && (
            <ResultGroup title="Quick actions">
              {ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.label}
                    onClick={() => {
                      a.run();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-[13.5px]"
                  >
                    <Icon size={14} className="text-text-faint" />
                    {a.label}
                  </button>
                );
              })}
            </ResultGroup>
          )}

          {hasQuery && ACTIONS.length > 0 && (
            <ResultGroup title="Actions">
              {ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.label}
                    onClick={() => {
                      a.run();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-[13.5px]"
                  >
                    <Icon size={14} className="text-text-faint" />
                    {a.label}
                  </button>
                );
              })}
            </ResultGroup>
          )}

          {nothingFound && ACTIONS.length === 0 && (
            <div className="text-[13px] text-text-faint text-center py-8">No matches for &quot;{q}&quot;.</div>
          )}

          {results.projects.length > 0 && (
            <ResultGroup title="Projects">
              {results.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-surface-2 text-[13.5px]"
                >
                  {p.name}
                </Link>
              ))}
            </ResultGroup>
          )}

          {results.tasks.length > 0 && (
            <ResultGroup title="Steps">
              {results.tasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <Link
                    key={t.id}
                    href={project ? `/projects/${project.id}` : "/"}
                    onClick={onClose}
                    className="block px-3 py-2 rounded-lg hover:bg-surface-2"
                  >
                    <div className={`text-[13.5px] ${t.done ? "line-through text-text-faint" : ""}`}>{t.title}</div>
                    {project && <div className="text-[11px] text-text-faint">{project.name}</div>}
                  </Link>
                );
              })}
            </ResultGroup>
          )}

          {results.resources.length > 0 && (
            <ResultGroup title="Resources">
              {results.resources.map((r) => {
                const project = projects.find((p) => p.id === r.projectId);
                return (
                  <a
                    key={r.id}
                    href={r.url || undefined}
                    target={r.url ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="block px-3 py-2 rounded-lg hover:bg-surface-2 text-[13.5px]"
                  >
                    {typeIcon(r.type)} {r.title}
                    {project && <span className="text-[11px] text-text-faint"> · {project.name}</span>}
                  </a>
                );
              })}
            </ResultGroup>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="text-[11px] font-semibold text-text-faint tracking-wide px-3 py-1.5">{title.toUpperCase()}</div>
      {children}
    </div>
  );
}
