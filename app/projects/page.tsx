"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { availableTasks, tasksForProject } from "@/lib/gtd";
import { ProjectStatus } from "@/lib/types";
import { ResourceCard, ResourceForm } from "@/components/Resources";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ChevronRight, X } from "lucide-react";

const TABS: { key: ProjectStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "someday", label: "Someday / Maybe" },
];

export default function ProjectsPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const resources = useAppStore((s) => s.resources);
  const somedayIdeas = useAppStore((s) => s.somedayIdeas);
  const addProject = useAppStore((s) => s.addProject);
  const addSomedayIdea = useAppStore((s) => s.addSomedayIdea);
  const deleteSomedayIdea = useAppStore((s) => s.deleteSomedayIdea);
  const deleteResource = useAppStore((s) => s.deleteResource);

  const [tab, setTab] = useState<ProjectStatus>("active");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [ideaText, setIdeaText] = useState("");
  const [addingRef, setAddingRef] = useState(false);
  const [confirmIdeaId, setConfirmIdeaId] = useState<string | null>(null);

  const list = projects.filter((p) => p.status === tab);
  const unfiledResources = resources.filter((r) => !r.projectId && !r.taskId);

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-8 py-7 pb-24 md:pb-16">
      <h1 className="font-display text-[24px] font-bold mb-5">Projects</h1>

      <div className="flex gap-1.5 mb-5 border-b border-border-soft">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[13px] px-3 py-2.5 -mb-px border-b-2 font-medium ${
              tab === t.key ? "border-amber text-text" : "border-transparent text-text-faint"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-text-faint text-[13.5px] py-4">No projects here yet.</div>
      ) : (
        <div className="flex flex-col gap-1.5 mb-4">
          {list.map((p) => {
            const ready = availableTasks(tasks, tasksForProject(tasks, p.id)).length;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between bg-surface border border-border-soft rounded-lg px-4 py-3 hover:border-text-faint"
              >
                <span className="text-[14px]">{p.name}</span>
                <span className="flex items-center gap-2">
                  {ready > 0 && (
                    <span className="text-[10.5px] text-amber bg-amber-dim rounded-full px-2 py-0.5">{ready} ready</span>
                  )}
                  <ChevronRight size={15} className="text-text-faint" />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {adding ? (
        <div className="bg-surface border border-border-soft rounded-lg p-3 mb-6">
          <input
            type="text"
            autoFocus
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && (addProject(newName, tab), setNewName(""), setAdding(false))}
            className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13.5px] mb-2.5"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (newName.trim()) {
                  addProject(newName, tab);
                  setNewName("");
                  setAdding(false);
                }
              }}
              className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]"
            >
              Create in {TABS.find((t) => t.key === tab)?.label}
            </button>
            <button onClick={() => setAdding(false)} className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold text-text-faint">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full text-left border border-dashed border-border rounded-lg px-4 py-2.5 text-[13.5px] text-text-faint hover:text-text-dim hover:border-text-faint mb-8"
        >
          + New project in {TABS.find((t) => t.key === tab)?.label}
        </button>
      )}

      {tab === "someday" && (
        <>
          <div className="mt-4">
            <h2 className="text-[13px] font-semibold text-text-faint tracking-wide mb-2">LOOSE IDEAS</h2>
            <p className="text-[12.5px] text-text-faint mb-3">
              Not even a project yet — just something worth not forgetting.
            </p>
            {somedayIdeas.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-3">
                {somedayIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between bg-surface border border-border-soft rounded-lg px-3.5 py-2.5">
                    <span className="text-[13.5px]">{idea.text}</span>
                    <button onClick={() => setConfirmIdeaId(idea.id)} className="text-text-faint hover:text-rust">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ideaText.trim() && (addSomedayIdea(ideaText), setIdeaText(""))}
                placeholder="Someday, maybe..."
                className="flex-1 bg-surface border border-border-soft rounded-lg px-3.5 py-2 text-[13.5px]"
              />
              <button
                onClick={() => {
                  if (ideaText.trim()) {
                    addSomedayIdea(ideaText);
                    setIdeaText("");
                  }
                }}
                className="px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-amber text-[#2a2117]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[13px] font-semibold text-text-faint tracking-wide mb-2">REFERENCE</h2>
            <p className="text-[12.5px] text-text-faint mb-3">Saved for later — not attached to any project.</p>
            <div className="flex flex-col gap-1.5 mb-3">
              {unfiledResources.map((r) => (
                <ResourceCard key={r.id} resource={r} onDelete={() => deleteResource(r.id)} />
              ))}
            </div>
            {addingRef ? (
              <ResourceForm
                onSave={(data) => {
                  useAppStore.getState().addResource({ projectId: null, taskId: null, ...data });
                  setAddingRef(false);
                }}
                onCancel={() => setAddingRef(false)}
              />
            ) : (
              <button
                onClick={() => setAddingRef(true)}
                className="w-full text-left border border-dashed border-border rounded-lg px-4 py-2.5 text-[13.5px] text-text-faint hover:text-text-dim"
              >
                + Save a reference link, article, or note
              </button>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmIdeaId}
        message="Remove this idea?"
        onConfirm={() => {
          if (confirmIdeaId) deleteSomedayIdea(confirmIdeaId);
          setConfirmIdeaId(null);
        }}
        onCancel={() => setConfirmIdeaId(null)}
      />
    </div>
  );
}
