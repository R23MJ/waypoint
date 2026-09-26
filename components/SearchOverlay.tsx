"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { searchAll } from "@/lib/search";
import { typeIcon } from "@/components/Resources";
import { X, Search as SearchIcon } from "lucide-react";

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-[10vh]" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-soft">
          <SearchIcon size={16} className="text-text-faint flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, steps, resources…"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
          <button onClick={onClose} className="text-text-faint hover:text-text flex-shrink-0">
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-2 py-2">
          {!hasQuery && (
            <div className="text-[13px] text-text-faint text-center py-8">
              Start typing to search everything.
            </div>
          )}
          {nothingFound && (
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
