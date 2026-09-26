export type ProjectStatus = "active" | "scheduled" | "someday";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  scheduledDate: string | null; // ISO date, used when status === 'scheduled'
  notes: string;
  createdAt: number;
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
  lastReviewedAt: number | null;
}
