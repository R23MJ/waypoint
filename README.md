# Waypoint

A GTD-style project and next-action tracker. Everything lives in the browser's
`localStorage` — no account, no server, no database. Each browser is its own
"user," which makes this easy to ship and test for real demand before ever
building auth.

## Why it's built this way

Mainstream to-do apps make you manually flag "next action" on every task, and
most can't tell you, automatically, which steps across a mix of sequential and
parallel projects are actually unblocked right now — that gap shows up
constantly in GTD/productivity forums. This app's core feature is solving
exactly that:

- **Dependencies, not manual flags.** Mark a step as blocked by another step;
  it disappears from "available" until its blockers are done, automatically,
  even across projects that mix sequential and parallel work.
- **Waiting For is separate from Blocked.** GTD distinguishes a step you can't
  do because it depends on your own unfinished work (Blocked) from one you
  can't do because you're waiting on someone else (Waiting For). Both are
  modeled explicitly, with their own cross-project view.
- **Contexts** (`@computer`, `@errands`, `@home`, ...) let you filter Next
  Actions down to what you can actually do right now.
- **Inbox → process** is the GTD capture/clarify loop: dump raw thoughts fast,
  then later decide whether each one is a next action, a project, a someday
  idea, or just reference material.
- **Stalled project detection.** The Weekly Review flags any active project
  that has no available next step and nothing waiting — GTD's definition of a
  project that's quietly stuck.
- **Resources** (links, notes, videos, book passages, articles) attach to a
  project or to one specific step, so everything you need lives with the work.

## Layout overhaul (round 3)

Grounded in conventions from Linear, Things 3, Todoist and native mobile apps:

- **Dashboard home** — greeting (optionally personalized in Settings → Your name),
  a stats strip (due today / available / waiting), and a "Focus first" section
  surfacing your highest-priority available steps before the full list.
- **Master-detail Projects view** on desktop (≥1024px) — project list on the
  left, selected project's detail inline on the right, no page reload. Narrower
  screens keep the previous push-navigation to a full-screen project page.
- **Drag-to-reorder** for a project's Next Steps (`@dnd-kit`), both by mouse and
  touch (long-press to pick up on mobile). Manual order now wins over priority
  *within* a project's step list — priority still auto-sorts the cross-project
  Next Actions dashboard, but inside one project you're explicitly sequencing
  steps, so a drag should stick.
- **Swipe-to-delete** on task rows on touch devices (swipe left, tap the
  revealed Delete button). Desktop keeps the hover-to-reveal ✕.
- **Command palette** — the search overlay now also lists quick actions (jump
  to any screen, open quick capture) even with an empty query. Open it with
  `/` or `⌘K`/`Ctrl+K` from anywhere, not just by clicking the search field.
- **Progress bars** on project rows (done/total steps) in both the Projects
  list and the two-pane list.

## What's new since the first cut

Added after a pass through what GTD/task-app reviews and forums call out as
standard-but-missing:

- **Due dates + best-effort reminders.** Separate from "don't show until"
  (`deferUntil`). Overdue/due-today badges everywhere a step appears.
  Settings → Due-Date Reminders can turn on one browser notification per day
  when the app is opened and something's due — this is not a background push
  (that needs a server), so it only fires while the tab/app is actually open.
- **Recurring steps.** Daily/weekly/monthly, every N. Completing one spawns
  the next occurrence automatically rather than just vanishing.
- **Checklists.** A lightweight sub-list inside a step, for things you want
  to track without promoting each one to a full dependency-tracked step.
- **Priority** (low/normal/high). High-priority steps sort first in every
  Next Actions list and get a flagged/red-tinted border.
- **Search** (magnifying glass in the header) across projects, steps, and
  resources at once.
- **Installable as a PWA.** Manifest + icons + a small offline-caching
  service worker, so "Add to Home Screen" on Android gives it a real icon and
  it opens like an app, not a browser tab.

A localStorage migration (`store.ts`, `version: 2`) backfills the new task
fields for anyone who already has data saved from before this round.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Zustand, persisted to `localStorage`
- lucide-react icons

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Vercel, "Add New Project" → import the repo. No environment variables
   or build settings are required — Vercel auto-detects Next.js.
3. Deploy. That's it; there's no database to provision.

## Data & backup

Data is stored only in the visiting browser's `localStorage`, under the key
`gtd-app-storage`. There is no sync between devices or browsers by design (see
Settings → Your Data for export/import of a JSON backup — useful before
clearing browser data, switching devices, or just as a safety net). If you
later add accounts, the export/import JSON shape (`lib/types.ts` → `AppState`)
is the schema to build a backend around.

## Project structure

```
app/
  page.tsx              Next Actions (home) — cross-project unblocked steps
  inbox/                Capture + process
  projects/             Project list (Active / Scheduled / Someday tabs)
  projects/[id]/        Project detail — steps, resources, notes
  waiting/              Cross-project "Waiting For" list
  review/               Guided weekly review
  settings/             Contexts, data export/import, clear data
components/             Shared UI (TaskItem, AddTaskForm, Resources, ...)
lib/
  types.ts              Data model
  store.ts              Zustand store + localStorage persistence
  gtd.ts                Derived logic: available/blocked/waiting/stalled
```

## Natural-language quick add (Todoist-style)

Typing in the step title now recognizes shorthand — this is deterministic text
parsing (`chrono-node` for dates + a few regexes), **not** an AI/LLM call, so
it fits the "hold off on AI" decision and needs no backend:

- Dates: `tomorrow`, `next friday`, `in 3 days`, `sep 30`, etc.
- Priority: `p1` / `p2` / `p3` (Todoist convention: p1 = high).
- Context: `@computer`, `@phone`, matched against your existing contexts.
- Recurrence: `every day`, `daily`, `every monday`, `every 2 weeks`, etc.

Recognized shorthand pre-fills the due date / priority / context / repeat
fields (shown as chips above them) but never overwrites a field you've
already set by hand. It's wired into both "Add a step" and the Inbox's
"Do it — make it a next action" flow. See `lib/nlParse.ts`.
