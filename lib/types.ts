export type ProjectStatus = "active" | "scheduled" | "someday";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  scheduledDate: string | null; // ISO date, used when status === 'scheduled'
  notes: string;
  createdAt: number;
}

export type Priority = "low" | "normal" | "high";

export type RecurrenceFreq = "daily" | "weekly" | "monthly";

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  interval: number; // every N days/weeks/months
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string | null; // null = standalone next action, not part of a project
  title: string;
  notes: string;
  done: boolean;
  completedAt: number | null;
  dependsOn: string[]; // ids of tasks that must be done first (blocking)
  contextIds: string[]; // ids of Context tags (@home, @errands, ...)
  waitingOn: string | null; // set = "waiting for" someone/something external; not a dependency
  waitingSince: number | null;
  deferUntil: string | null; // ISO date; not "available" until this date passes
  dueDate: string | null; // ISO date; this needs to happen by this date
  priority: Priority;
  recurrence: RecurrenceRule | null; // when done, spawns the next occurrence
  checklist: ChecklistItem[]; // lightweight sub-items, not full dependency steps
  order: number;
  createdAt: number;
}

export type ResourceType = "link" | "note" | "book" | "video" | "article";

export interface Resource {
  id: string;
  projectId: string | null;
  taskId: string | null; // attach to a specific step instead of the whole project
  type: ResourceType;
  title: string;
  url: string;
  content: string;
  createdAt: number;
}

export interface Context {
  id: string;
  name: string;
  icon: string; // emoji
}

export interface InboxItem {
  id: string;
  text: string;
  createdAt: number;
}

export type TrackableType = "boolean" | "counter";

export interface Trackable {
  id: string;
  projectId: string;
  name: string; // "Took Creatine", "Calories"
  type: TrackableType;
  target: number | null; // counter only, e.g. 4000
  unit: string; // "kcal", "g", "" for boolean
  order: number;
  createdAt: number;
}

/** One trackable's tally for one calendar day (local date, ISO). For a
 * counter this is the running total added so far that day; for a boolean
 * it's 0 or 1. */
export interface TrackableEntry {
  id: string;
  trackableId: string;
  date: string;
  value: number;
}

export interface SomedayIdea {
  id: string;
  text: string;
  createdAt: number;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  resources: Resource[];
  contexts: Context[];
  inbox: InboxItem[];
  somedayIdeas: SomedayIdea[];
  trackables: Trackable[];
  trackableEntries: TrackableEntry[];
  lastReviewedAt: number | null;
  notificationsEnabled: boolean;
  lastNotifiedDate: string | null; // ISO date, so we notify at most once/day
  displayName: string;
}
