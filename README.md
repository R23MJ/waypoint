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
