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

## Trackables (daily habits & running totals)

A project (e.g. "Powerlifting") can now hold **Trackables** — a "Today" section
above its Next Steps:

- **Yes/no** (e.g. "Took Creatine") — a daily checkbox that resets each day.
- **Running total** (e.g. "Calories", target 4000 kcal) — a progress bar you
  top up throughout the day with a small "+ add" field; supports subtracting
  too, for corrections.

Data model: `Trackable` (the definition — name, type, target, unit) and
`TrackableEntry` (one row per trackable per calendar date, keyed by local
`YYYY-MM-DD`) in `lib/types.ts`, with actions in `lib/store.ts`
(`addTrackable`, `setTrackableToday`, `addTrackableAmount`, ...). The home
dashboard also rolls up all trackables from active projects into a "Today"
section, so daily check-ins don't require opening each project.

Not yet built: streaks / history charts, weekly (vs. daily) reset periods,
and quick-add preset amounts (e.g. "+250 kcal" buttons) — all reasonable
next steps if this gets used.

## Mobile keyboard covering sheet buttons — fixed

Bottom sheets (quick capture, edit, confirm dialogs) were rendered as
`fixed inset-0`, which sizes to the full layout viewport — on mobile, that
doesn't shrink when the on-screen keyboard opens, so a sheet's buttons could
end up hidden behind the keyboard. Two-part fix in `components/Sheet.tsx`:

1. `viewport.interactiveWidget = "resizes-content"` in `app/layout.tsx`
   (handles it natively on modern Chrome/Android — Next.js 16 supports this
   viewport meta field directly).
2. `components/ViewportFix.tsx` — a fallback using the `VisualViewport` API
   for browsers that don't honor (1), notably iOS Safari.

## Swipe-to-delete rendering bug — fixed

Two compounding bugs: the task card had its own `rounded-2xl` *inside* the
swipe container's `rounded-2xl`, so the corner-radius mismatch let the red
delete panel peek through at the edges; and dimmed cards (done/blocked/
waiting) used CSS `opacity` on the whole card, which makes the background
semi-transparent too — letting the delete panel ghost through even when
closed. Fixed in `components/TaskItem.tsx` by letting the swipe container
own all rounding/clipping, and moving the dimmed look to an inner content
wrapper so the card's background stays fully opaque underneath it.

## Task editing

Every step now has a pencil icon opening an edit sheet (title, priority,
context, due date, defer date, dependencies, recurrence) —
`components/EditTaskSheet.tsx`. Previously the only way to touch a step
after creating it was to delete and re-add it.

## Trackables unified into Tasks (no separate model)

The dedicated Trackable/TrackableEntry data model from the previous round is
gone. A "trackable" is now just a **task** — specifically, a recurring task
(optionally) carrying a running number:

- **"Took Creatine" (yes/no daily)** → a plain recurring task, `recurrence:
  {freq: "daily", interval: 1}`. This is exactly what recurring tasks already
  were — no new concept needed.
- **"Calories" (0/4000 kcal)** → a recurring task that also sets
  `trackTarget: 4000, trackUnit: "kcal"`. The checkbox still means "done for
  this period"; the progress bar + "+add" control underneath is a
  supplementary way to log a number against it, the same way checklists are
  an optional supplementary sub-list.

This means: no separate "Trackables" section in a project anymore — a
tracked task is created via the normal "+ Add a step" form (there's a
"Track a running number" checkbox that reveals target/unit fields) or edited
via the same step-edit sheet. It sorts and filters through the exact same
next-actions logic as everything else. Weekly or monthly running totals now
work for free, since they're just recurrence — set `recurrence` to weekly
and it's a weekly count.

**Behavior change worth knowing:** because this is a real recurring task now,
a period only advances when you check it off — there's no silent daily
auto-reset independent of completion. If you skip a day on "Took Creatine"
without checking it off, it stays there as that (now-stale) occurrence until
you complete it, rather than quietly refreshing to a new blank checkbox at
midnight. This is the standard, predictable behavior for every recurring
task in the app; it just reads differently for a daily habit than a
dedicated habit-tracker would.

A one-time migration (`migrateLegacyTrackables` in `lib/store.ts`, storage
version 5) converts any trackables saved under the old model into equivalent
recurring tasks, carrying today's logged value forward. Full historical
entries (`TrackableEntry` rows) are not preserved — only today's number.

## Mobile form overflow — fixed

Both reported issues (add-trackable's unit field pushed off-screen, and a
focus glow clipped at the screen edge) traced to the same root cause: a
`<input>` in a `flex-1` row defaults to a browser-imposed minimum width
(~150-170px, from the implicit `size="20"` UA default) unless you explicitly
set `min-width: 0`. Two inputs side-by-side in a narrow sheet would refuse to
shrink, overflow the sheet's own padding, and get clipped right at the
screen edge. Added `min-w-0` to every paired-input row across
`AddTaskForm.tsx` and `EditTaskSheet.tsx`.
