"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { daysSince } from "@/lib/gtd";
import { ProjectStatus } from "@/lib/types";
import { Inbox as InboxIcon, X } from "lucide-react";

type Dest = "task" | "new-project" | "someday" | "reference" | null;

export default function InboxPage() {
  const inbox = useAppStore((s) => s.inbox);
  const projects = useAppStore((s) => s.projects);
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
    <div className="max-w-[680px] mx-auto px-5 md:px-8 py-7 pb-24 md:pb-16">
      <h1 className="font-display text-[24px] font-bold mb-1">Inbox</h1>
      <p className="text-text-dim text-[14px] mb-5">
        Dump anything here the moment it crosses your mind. Sort it out later — that&apos;s the point.
      </p>

      <div className="flex gap-2 mb-7">
        <input
          type="text"
          value={capture}
          onChange={(e) => setCapture(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCapture()}
          placeholder="Capture a thought…"
          className="flex-1 bg-surface border border-border-soft rounded-lg px-3.5 py-2.5 text-[14px]"
        />
        <button
          onClick={submitCapture}
          className="px-4 py-2.5 rounded-lg text-[13.5px] font-semibold bg-amber text-[#2a2117]"
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
            <div key={item.id} className="bg-surface border border-border-soft rounded-[9px] px-3.5 py-3">
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
                  className="mt-2 text-[12px] font-semibold text-amber"
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
  onDone,
  onCancel,
  addTask,
  addProject,
  addSomedayIdea,
  addResource,
}: {
  text: string;
  projects: ReturnType<typeof useAppStore.getState>["projects"];
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
            className={`text-[12px] rounded-md px-2.5 py-1.5 border ${
              dest === o.key ? "bg-amber-dim border-amber text-amber" : "bg-bg-2 border-border text-text-dim"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {dest === "task" && (
        <div>
          <div className="text-[11px] text-text-faint mb-1.5">attach to a project? (optional)</div>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13px] mb-2.5"
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
              addTask(projectId || null, text);
              onDone();
            }}
            className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]"
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
            className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13px] mb-2.5"
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
            className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]"
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
          className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]"
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
          className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-amber text-[#2a2117]"
        >
          Save as reference note
        </button>
      )}

      <button onClick={onCancel} className="ml-2 px-3.5 py-1.5 rounded-md text-[13px] font-semibold text-text-faint">
        Cancel
      </button>
    </div>
  );
}
