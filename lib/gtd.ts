import { Project, RecurrenceRule, Task } from "./types";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(task: Task): boolean {
  if (task.done || !task.dueDate) return false;
  return task.dueDate < todayISO();
}

export function isDueToday(task: Task): boolean {
  if (task.done || !task.dueDate) return false;
  return task.dueDate === todayISO();
}

const PRIORITY_RANK: Record<Task["priority"], number> = { high: 0, normal: 1, low: 2 };

export function sortByPriorityThenOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (p !== 0) return p;
    return a.order - b.order;
  });
}

/** Given a rule and the date an occurrence was anchored to (its due date,
 * or today if it had none), compute the next occurrence's due date. */
export function nextOccurrenceDate(rule: RecurrenceRule, fromISODate: string): string {
  const d = new Date(fromISODate + "T00:00:00");
  if (rule.freq === "daily") d.setDate(d.getDate() + rule.interval);
  else if (rule.freq === "weekly") d.setDate(d.getDate() + rule.interval * 7);
  else if (rule.freq === "monthly") d.setMonth(d.getMonth() + rule.interval);
  return d.toISOString().slice(0, 10);
}

export function describeRecurrence(rule: RecurrenceRule): string {
  const n = rule.interval;
  const unit = { daily: "day", weekly: "week", monthly: "month" }[rule.freq];
  if (n === 1) return `every ${unit}`;
  return `every ${n} ${unit}s`;
}

export function isDeferred(task: Task): boolean {
  if (!task.deferUntil) return false;
  return task.deferUntil > todayISO();
}

export function isBlockedBy(task: Task, allTasks: Task[]): Task[] {
  if (!task.dependsOn?.length) return [];
  return task.dependsOn
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => !!t && !t.done);
}

export function isBlocked(task: Task, allTasks: Task[]): boolean {
  if (task.done) return false;
  return isBlockedBy(task, allTasks).length > 0;
}

export function isWaiting(task: Task): boolean {
  return !task.done && !!task.waitingOn;
}

/** Available = not done, not blocked by another open task, not waiting on
 * someone/something external, and not deferred to a future date. This is
 * the "next action" set GTD asks you to be able to see, automatically,
 * across mixed sequential/parallel projects. */
export function isAvailable(task: Task, allTasks: Task[]): boolean {
  if (task.done) return false;
  if (isWaiting(task)) return false;
  if (isDeferred(task)) return false;
  if (isBlocked(task, allTasks)) return false;
  return true;
}

export function tasksForProject(tasks: Task[], projectId: string): Task[] {
  return tasks
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export function availableTasks(tasks: Task[], scope?: Task[]): Task[] {
  const pool = scope ?? tasks;
  return pool.filter((t) => isAvailable(t, tasks));
}

export function waitingTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => isWaiting(t));
}

export function blockedTasks(tasks: Task[], scope?: Task[]): Task[] {
  const pool = scope ?? tasks;
  return pool.filter((t) => !t.done && !isWaiting(t) && isBlocked(t, tasks));
}

export function deferredTasks(tasks: Task[], scope?: Task[]): Task[] {
  const pool = scope ?? tasks;
  return pool.filter(
    (t) => !t.done && !isWaiting(t) && !isBlocked(t, tasks) && isDeferred(t)
  );
}

/** Projects GTD calls "stalled": active, not done, but with no available
 * next step and nothing explicitly waiting on someone else either. A
 * healthy active project always has one of the two. */
export function isStalledProject(project: Project, tasks: Task[]): boolean {
  if (project.status !== "active") return false;
  const projectTasks = tasksForProject(tasks, project.id);
  const openTasks = projectTasks.filter((t) => !t.done);
  if (openTasks.length === 0) return false; // no open tasks = nothing to stall on (or fully done)
  const hasAvailable = openTasks.some((t) => isAvailable(t, tasks));
  const hasWaiting = openTasks.some((t) => isWaiting(t));
  return !hasAvailable && !hasWaiting;
}

export function daysSince(ts: number): number {
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
}
