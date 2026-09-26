"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { availableTasks, tasksForProject } from "@/lib/gtd";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ProjectStatus } from "@/lib/types";
import { ResourceCard, ResourceForm } from "@/components/Resources";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProjectDetail from "@/components/ProjectDetail";
import ProjectProgress from "@/components/ProjectProgress";
import { ChevronRight, X, FolderKanban } from "lucide-react";

const TABS: { key: ProjectStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "someday", label: "Someday / Maybe" },
];

export default function ProjectsPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
  const [selected, setSelected] = useState<string | null>(null);

  const list = projects.filter((p) => p.status === tab);
  const unfiledResources = resources.filter((r) => !r.projectId && !r.taskId);

  function openProject(id: string) {
    if (isDesktop) setSelected(id);
    else router.push(`/projects/${id}`);
  }

  const listColumn = (
    <div className="max-w-[720px] lg:max-w-none mx-auto lg:mx-0 px-5 md:px-8 lg:px-6 py-8 lg:py-7 pb-28 lg:pb-10">
      <h1 className="font-display text-[26px] lg:text-[20px] font-bold mb-6 lg:mb-5 tracking-[-0.01em]">Projects</h1>

      <div className="flex gap-1 mb-6 bg-surface-2 rounded-xl p-1 w-fit lg:w-full">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[12.5px] px-3.5 py-1.5 rounded-lg font-medium transition-colors lg:flex-1 ${
              tab === t.key ? "bg-surface text-text shadow-sm" : "text-text-faint hover:text-text-dim"
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
            const isSelected = isDesktop && selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => openProject(p.id)}
                className={`text-left flex items-center justify-between border rounded-xl px-4 py-3.5 transition-colors ${
                  isSelected
                    ? "bg-amber/10 border-amber"
                    : "bg-surface border-border-soft hover:border-border"
                }`}
              >
                <div className="min-w-0">
                  <span className="text-[14px] block truncate">{p.name}</span>
                  <ProjectProgress projectId={p.id} />
                </div>
                <span className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {ready > 0 && (
                    <span className="text-[10.5px] text-amber bg-amber-dim rounded-full font-medium px-2 py-0.5">
                      {ready} ready
                    </span>
                  )}
                  {!isDesktop && <ChevronRight size={15} className="text-text-faint" />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {adding ? (
        <div className="bg-surface border border-border-soft rounded-2xl p-3.5 mb-6">
          <input
            type="text"
            autoFocus
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && (addProject(newName, tab), setNewName(""), setAdding(false))}
            className="w-full bg-bg-2 border border-border rounded-xl px-3 py-2 text-[13.5px] mb-2.5"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (newName.trim()) {
                  const id = addProject(newName, tab);
                  setNewName("");
                  setAdding(false);
                  if (isDesktop) setSelected(id);
                }
              }}
              className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
            >
              Create in {TABS.find((t) => t.key === tab)?.label}
            </button>
            <button onClick={() => setAdding(false)} className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-text-faint">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full text-left border border-dashed border-border rounded-2xl px-4 py-3 text-[13.5px] text-text-faint hover:text-text-dim hover:border-text-faint mb-8 transition-colors"
        >
          + New project in {TABS.find((t) => t.key === tab)?.label}
        </button>
      )}

      {tab === "someday" && (
        <>
          <div className="mt-4">
            <h2 className="text-[14px] font-semibold mb-1">Loose ideas</h2>
            <p className="text-[12.5px] text-text-faint mb-3.5">
              Not even a project yet — just something worth not forgetting.
            </p>
            {somedayIdeas.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-3">
                {somedayIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between bg-surface border border-border-soft rounded-xl px-3.5 py-2.5">
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
                className="flex-1 bg-surface border border-border-soft rounded-xl px-3.5 py-2.5 text-[13.5px]"
              />
              <button
                onClick={() => {
                  if (ideaText.trim()) {
                    addSomedayIdea(ideaText);
                    setIdeaText("");
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[14px] font-semibold mb-1">Reference</h2>
            <p className="text-[12.5px] text-text-faint mb-3.5">Saved for later — not attached to any project.</p>
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
                className="w-full text-left border border-dashed border-border rounded-2xl px-4 py-3 text-[13.5px] text-text-faint hover:text-text-dim transition-colors"
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

  if (!isDesktop) return listColumn;

  return (
    <div className="flex h-full">
      <div className="w-[360px] flex-shrink-0 border-r border-border-soft h-full overflow-y-auto">{listColumn}</div>
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        {selected ? (
          <ProjectDetail projectId={selected} onDeleted={() => setSelected(null)} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-text-faint">
            <FolderKanban size={30} strokeWidth={1.5} />
            <p className="text-[13.5px]">Select a project to see its steps and resources.</p>
          </div>
        )}
      </div>
    </div>
  );
}
