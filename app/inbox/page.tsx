"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { daysSince } from "@/lib/gtd";
import { parseQuickAdd } from "@/lib/nlParse";
import { ProjectStatus } from "@/lib/types";
import { Inbox as InboxIcon, X, Sparkles } from "lucide-react";

type Dest = "task" | "new-project" | "someday" | "reference" | null;

export default function InboxPage() {
  const inbox = useAppStore((s) => s.inbox);
  const projects = useAppStore((s) => s.projects);
  const contexts = useAppStore((s) => s.contexts);
  const addInboxItem = useAppStore((s) => s.addInboxItem);
  const deleteInboxItem = useAppStore((s) => s.deleteInboxItem);
  const addTask = useAppStore((s) => s.addTask);
  const addProject = useAppStore((s) => s.addProject);
  const addSomedayIdea = useAppStore((s) => s.addSomedayIdea);
  const addResource = useAppStore((s) => s.addResource);

  const [capture, setCapture] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  function submitCapture() {
    if (!capture.trim()) return;
    addInboxItem(capture);
    setCapture("");
  }

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-8 py-8 pb-28 md:pb-16">
      <h1 className="font-display text-[24px] font-bold mb-1.5 tracking-[-0.01em]">Inbox</h1>
      <p className="text-text-dim text-[14px] mb-6">
        Dump anything here the moment it crosses your mind. Sort it out later — that&apos;s the point.
      </p>

      <div className="flex gap-2 mb-7">
        <input
          type="text"
          value={capture}
          onChange={(e) => setCapture(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCapture()}
          placeholder="Capture a thought…"
          className="flex-1 bg-surface border border-border-soft rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-border transition-colors"
        />
        <button
          onClick={submitCapture}
          className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
        >
          Capture
        </button>
      </div>

      {inbox.length === 0 ? (
        <div className="text-center py-16 text-text-faint flex flex-col items-center gap-2">
          <InboxIcon size={28} strokeWidth={1.5} />
          <div>Inbox zero. Nice.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {inbox.map((item) => (
            <div key={item.id} className="bg-surface border border-border-soft rounded-2xl px-4 py-3.5 transition-colors hover:border-border">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px]">{item.text}</div>
                  <div className="text-[11px] text-text-faint mt-0.5">
                    {daysSince(item.createdAt) === 0 ? "today" : `${daysSince(item.createdAt)}d ago`}
                  </div>
                </div>
                <button onClick={() => deleteInboxItem(item.id)} className="p-1 text-text-faint hover:text-rust flex-shrink-0">
                  <X size={15} />
                </button>
              </div>

              {openId === item.id ? (
                <ProcessPanel
                  text={item.text}
                  projects={projects}
                  contexts={contexts}
                  onDone={() => {
                    deleteInboxItem(item.id);
                    setOpenId(null);
                  }}
                  onCancel={() => setOpenId(null)}
                  addTask={addTask}
                  addProject={addProject}
                  addSomedayIdea={addSomedayIdea}
                  addResource={addResource}
                />
              ) : (
                <button
                  onClick={() => setOpenId(item.id)}
                  className="mt-2 text-[12px] font-semibold text-amber hover:opacity-80 transition-opacity"
                >
                  Process →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProcessPanel({
  text,
  projects,
  contexts,
  onDone,
  onCancel,
  addTask,
  addProject,
  addSomedayIdea,
  addResource,
}: {
  text: string;
  projects: ReturnType<typeof useAppStore.getState>["projects"];
  contexts: ReturnType<typeof useAppStore.getState>["contexts"];
  onDone: () => void;
  onCancel: () => void;
  addTask: ReturnType<typeof useAppStore.getState>["addTask"];
  addProject: ReturnType<typeof useAppStore.getState>["addProject"];
  addSomedayIdea: ReturnType<typeof useAppStore.getState>["addSomedayIdea"];
  addResource: ReturnType<typeof useAppStore.getState>["addResource"];
}) {
  const [dest, setDest] = useState<Dest>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>("active");

  const parsed = parseQuickAdd(text, contexts);
  const hasParsedHints = !!(parsed.matchedDateText || parsed.priority || parsed.matchedContextNames.length || parsed.recurrence);

  const options: { key: Dest; label: string }[] = [
    { key: "task", label: "Do it — make it a next action" },
    { key: "new-project", label: "It's a project" },
    { key: "someday", label: "Someday / maybe" },
    { key: "reference", label: "Just reference — save, don't act" },
  ];

  return (
    <div className="mt-3 border-t border-border-soft pt-3">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => setDest(o.key)}
            className={`text-[12px] rounded-lg px-2.5 py-1.5 border transition-colors ${
              dest === o.key ? "bg-amber-dim border-amber text-amber" : "bg-bg-2 border-border text-text-dim hover:border-text-faint"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {dest === "task" && (
        <div>
          {hasParsedHints && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <Sparkles size={12} className="text-amber flex-shrink-0" />
              {parsed.dueDate && (
                <span className="text-[11px] bg-amber-dim text-amber rounded-md px-1.5 py-0.5">📅 {parsed.dueDate}</span>
              )}
              {parsed.priority && (
                <span className="text-[11px] bg-amber-dim text-amber rounded-md px-1.5 py-0.5 capitalize">🚩 {parsed.priority}</span>
              )}
              {parsed.matchedContextNames.map((n) => (
                <span key={n} className="text-[11px] bg-amber-dim text-amber rounded-md px-1.5 py-0.5">{n}</span>
              ))}
              {parsed.recurrence && <span className="text-[11px] bg-amber-dim text-amber rounded-md px-1.5 py-0.5">🔁 repeats</span>}
            </div>
          )}
          <div className="text-[11px] text-text-faint mb-1.5">attach to a project? (optional)</div>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-bg-2 border border-border rounded-xl px-2.5 py-2 text-[13px] mb-2.5"
          >
            <option value="">Standalone action</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              addTask(projectId || null, parsed.cleanTitle || text, {
                dueDate: parsed.dueDate,
                priority: parsed.priority ?? "normal",
                contextIds: parsed.contextIds,
                recurrence: parsed.recurrence,
              });
              onDone();
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
          >
            Save as next action
          </button>
        </div>
      )}

      {dest === "new-project" && (
        <div>
          <div className="text-[11px] text-text-faint mb-1.5">project status</div>
          <select
            value={newProjectStatus}
            onChange={(e) => setNewProjectStatus(e.target.value as ProjectStatus)}
            className="w-full bg-bg-2 border border-border rounded-xl px-2.5 py-2 text-[13px] mb-2.5"
          >
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="someday">Someday / maybe</option>
          </select>
          <button
            onClick={() => {
              addProject(text, newProjectStatus);
              onDone();
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
          >
            Create project &quot;{text}&quot;
          </button>
        </div>
      )}

      {dest === "someday" && (
        <button
          onClick={() => {
            addSomedayIdea(text);
            onDone();
          }}
          className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
        >
          Save to Someday / Maybe
        </button>
      )}

      {dest === "reference" && (
        <button
          onClick={() => {
            addResource({ projectId: null, taskId: null, type: "note", title: text, content: "" });
            onDone();
          }}
          className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] active:scale-[0.97] transition-transform"
        >
          Save as reference note
        </button>
      )}

      <button onClick={onCancel} className="ml-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-text-faint">
        Cancel
      </button>
    </div>
  );
}
