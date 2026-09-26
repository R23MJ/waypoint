"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { isStalledProject, waitingTasks, daysSince } from "@/lib/gtd";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function ReviewPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const inbox = useAppStore((s) => s.inbox);
  const somedayIdeas = useAppStore((s) => s.somedayIdeas);
  const lastReviewedAt = useAppStore((s) => s.lastReviewedAt);
  const markReviewed = useAppStore((s) => s.markReviewed);

  const stalled = projects.filter((p) => isStalledProject(p, tasks));
  const staleWaiting = waitingTasks(tasks).filter((t) => t.waitingSince && daysSince(t.waitingSince) >= 7);
  const somedayProjects = projects.filter((p) => p.status === "someday");
  const oldSomedayIdeas = somedayIdeas.filter((i) => daysSince(i.createdAt) >= 30);

  const allClear = inbox.length === 0 && stalled.length === 0 && staleWaiting.length === 0;

  return (
    <div className="max-w-[680px] mx-auto px-5 md:px-8 py-8 pb-28 md:pb-16">
      <h1 className="font-display text-[24px] font-bold mb-1.5 tracking-[-0.01em]">Weekly Review</h1>
      <p className="text-text-dim text-[14px] mb-1">
        {lastReviewedAt
          ? `Last reviewed ${daysSince(lastReviewedAt)}d ago.`
          : "You haven't done a review yet — this is where the system stays trustworthy."}
      </p>
      <div className="mb-7" />

      <ReviewSection
        title="Inbox to process"
        empty={inbox.length === 0}
        emptyText="Inbox is clear."
      >
        <Link
          href="/inbox"
          className="flex items-center justify-between bg-surface border border-border-soft rounded-xl px-4 py-3.5 hover:border-border transition-colors"
        >
          <span className="text-[14px]">{inbox.length} item{inbox.length === 1 ? "" : "s"} waiting to be sorted</span>
          <ChevronRight size={15} className="text-text-faint" />
        </Link>
      </ReviewSection>

      <ReviewSection
        title="Stalled projects"
        empty={stalled.length === 0}
        emptyText="Every active project has a next step ready, or is waiting on someone."
        hint="Active, but no available step and nothing waiting — these are the ones GTD calls stalled. Give each one a next action, mark it waiting, or move it to Someday."
      >
        {stalled.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="flex items-center justify-between bg-surface border border-border-soft rounded-xl px-4 py-3 mb-1.5 hover:border-border transition-colors"
          >
            <span className="text-[14px]">{p.name}</span>
            <ChevronRight size={15} className="text-text-faint" />
          </Link>
        ))}
      </ReviewSection>

      <ReviewSection
        title="Waiting a while"
        empty={staleWaiting.length === 0}
        emptyText="Nothing's been sitting long enough to chase."
        hint="Waiting on something for a week or more — might be worth a nudge."
      >
        {staleWaiting.map((t) => {
          const project = projects.find((p) => p.id === t.projectId);
          return (
            <div key={t.id} className="bg-surface border border-border-soft rounded-xl px-4 py-3 mb-1.5">
              <div className="text-[14px]">{t.title}</div>
              <div className="text-[11.5px] text-amber mt-1">
                waiting on <b>{t.waitingOn}</b>{" "}
                <span className="text-text-faint">
                  · {daysSince(t.waitingSince!)}d{project ? ` · ${project.name}` : ""}
                </span>
              </div>
            </div>
          );
        })}
      </ReviewSection>

      <ReviewSection
        title="Someday / Maybe to reconsider"
        empty={somedayProjects.length === 0 && oldSomedayIdeas.length === 0}
        emptyText="Nothing parked in Someday right now."
        hint="Still want these someday, or is it time to activate or let go?"
      >
        {somedayProjects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="flex items-center justify-between bg-surface border border-border-soft rounded-xl px-4 py-3 mb-1.5 hover:border-border transition-colors"
          >
            <span className="text-[14px]">{p.name}</span>
            <ChevronRight size={15} className="text-text-faint" />
          </Link>
        ))}
        {oldSomedayIdeas.map((i) => (
          <div key={i.id} className="bg-surface border border-border-soft rounded-xl px-4 py-3 mb-1.5 text-[14px]">
            {i.text}
          </div>
        ))}
      </ReviewSection>

      {allClear && (
        <div className="text-center py-6 text-sage flex flex-col items-center gap-2 mb-4">
          <CheckCircle2 size={26} strokeWidth={1.5} />
          <div className="text-[13.5px]">Everything&apos;s accounted for.</div>
        </div>
      )}

      <button
        onClick={markReviewed}
        className="w-full py-3.5 rounded-xl text-[14px] font-semibold bg-amber text-[#241d12] mt-4 active:scale-[0.98] transition-transform"
      >
        Mark review complete
      </button>
    </div>
  );
}

function ReviewSection({
  title,
  empty,
  emptyText,
  hint,
  children,
}: {
  title: string;
  empty: boolean;
  emptyText: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <h2 className="text-[14px] font-semibold mb-1">{title}</h2>
      {hint && !empty && <p className="text-[12px] text-text-faint mb-2.5">{hint}</p>}
      {empty ? <div className="text-[13px] text-text-faint italic py-1">{emptyText}</div> : children}
    </div>
  );
}
