"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { newId } from "./id";
import { nextOccurrenceDate, todayISO } from "./gtd";
import {
  AppState,
  ChecklistItem,
  Context,
  InboxItem,
  Priority,
  Project,
  ProjectStatus,
  RecurrenceRule,
  ResourceType,
  SomedayIdea,
  Task,
} from "./types";

const DEFAULT_CONTEXTS: Context[] = [
  { id: "ctx-computer", name: "Computer", icon: "\ud83d\udcbb" },
  { id: "ctx-phone", name: "Phone", icon: "\ud83d\udcde" },
  { id: "ctx-errands", name: "Errands", icon: "\ud83d\ude97" },
  { id: "ctx-home", name: "Home", icon: "\ud83c\udfe0" },
  { id: "ctx-anywhere", name: "Anywhere", icon: "\ud83c\udf10" },
];

const initialState: AppState = {
  projects: [],
  tasks: [],
  resources: [],
  contexts: DEFAULT_CONTEXTS,
  inbox: [],
  somedayIdeas: [],
  lastReviewedAt: null,
  notificationsEnabled: false,
  lastNotifiedDate: null,
  displayName: "",
};

// No-op storage so the persist middleware never touches `localStorage`
// during server-side rendering, where it does not exist.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/** Fills in fields added after a person may already have data saved, so an
 * older backup or an already-hydrated browser never crashes on a missing
 * field. */
function withTaskDefaults(t: Partial<Task> & { id: string }): Task {
  return {
    id: t.id,
    projectId: t.projectId ?? null,
    title: t.title ?? "",
    notes: t.notes ?? "",
    done: t.done ?? false,
    completedAt: t.completedAt ?? null,
    dependsOn: t.dependsOn ?? [],
    contextIds: t.contextIds ?? [],
    waitingOn: t.waitingOn ?? null,
    waitingSince: t.waitingSince ?? null,
    deferUntil: t.deferUntil ?? null,
    dueDate: t.dueDate ?? null,
    priority: t.priority ?? "normal",
    recurrence: t.recurrence ?? null,
    checklist: t.checklist ?? [],
    order: t.order ?? 0,
    createdAt: t.createdAt ?? Date.now(),
  };
}

interface Store extends AppState {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  addProject: (name: string, status: ProjectStatus) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addTask: (
    projectId: string | null,
    title: string,
    opts?: Partial<
      Pick<
        Task,
        "dependsOn" | "contextIds" | "deferUntil" | "notes" | "dueDate" | "priority" | "recurrence"
      >
    >
  ) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setWaiting: (id: string, waitingOn: string | null) => void;
  reorderTask: (id: string, direction: "up" | "down") => void;
  reorderTasks: (orderedIds: string[]) => void;

  addChecklistItem: (taskId: string, text: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;

  addResource: (data: {
    projectId: string | null;
    taskId: string | null;
    type: ResourceType;
    title: string;
    url?: string;
    content?: string;
  }) => void;
  deleteResource: (id: string) => void;

  addContext: (name: string, icon: string) => void;
  updateContext: (id: string, patch: Partial<Context>) => void;
  deleteContext: (id: string) => void;

  addInboxItem: (text: string) => void;
  deleteInboxItem: (id: string) => void;

  addSomedayIdea: (text: string) => void;
  deleteSomedayIdea: (id: string) => void;

  markReviewed: () => void;

  setNotificationsEnabled: (v: boolean) => void;
  markNotified: (date: string) => void;
  setDisplayName: (name: string) => void;

  importData: (data: AppState) => void;
  clearAll: () => void;
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      addProject: (name, status) => {
        const id = newId();
        const project: Project = {
          id,
          name: name.trim(),
          status,
          scheduledDate: null,
          notes: "",
          createdAt: Date.now(),
        };
        set((s) => ({ projects: [...s.projects, project] }));
        return id;
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.projectId !== id),
          resources: s.resources.filter((r) => r.projectId !== id),
        })),

      addTask: (projectId, title, opts) => {
        const id = newId();
        const siblings = get().tasks.filter((t) => t.projectId === projectId);
        const maxOrder = siblings.reduce((m, t) => Math.max(m, t.order), 0);
        const task: Task = withTaskDefaults({
          id,
          projectId,
          title: title.trim(),
          notes: opts?.notes ?? "",
          dependsOn: opts?.dependsOn ?? [],
          contextIds: opts?.contextIds ?? [],
          deferUntil: opts?.deferUntil ?? null,
          dueDate: opts?.dueDate ?? null,
          priority: opts?.priority ?? "normal",
          recurrence: opts?.recurrence ?? null,
          order: maxOrder + 1,
          createdAt: Date.now(),
        });
        set((s) => ({ tasks: [...s.tasks, task] }));
        return id;
      },
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const completing = !task.done;

        // Completing a recurring task spawns its next occurrence instead of
        // just disappearing — that's the whole point of "recurring".
        if (completing && task.recurrence) {
          const anchor = task.dueDate ?? todayISO();
          const nextDue = nextOccurrenceDate(task.recurrence, anchor);
          const next: Task = withTaskDefaults({
            ...task,
            id: newId(),
            done: false,
            completedAt: null,
            waitingOn: null,
            waitingSince: null,
            dueDate: nextDue,
            checklist: task.checklist.map((c) => ({ ...c, done: false })),
            createdAt: Date.now(),
          });
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, done: true, completedAt: Date.now() } : t
            ).concat(next),
          }));
          return;
        }

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  done: completing,
                  completedAt: completing ? Date.now() : null,
                  waitingOn: completing ? null : t.waitingOn,
                }
              : t
          ),
        }));
      },
      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks
            .filter((t) => t.id !== id)
            .map((t) => ({
              ...t,
              dependsOn: t.dependsOn.filter((d) => d !== id),
            })),
          resources: s.resources.map((r) =>
            r.taskId === id ? { ...r, taskId: null } : r
          ),
        })),
      setWaiting: (id, waitingOn) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  waitingOn,
                  waitingSince: waitingOn ? Date.now() : null,
                }
              : t
          ),
        })),
      reorderTask: (id, direction) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (!task) return s;
          const siblings = s.tasks
            .filter((t) => t.projectId === task.projectId)
            .sort((a, b) => a.order - b.order);
          const idx = siblings.findIndex((t) => t.id === id);
          const swapIdx = direction === "up" ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= siblings.length) return s;
          const other = siblings[swapIdx];
          const aOrder = task.order;
          const bOrder = other.order;
          return {
            tasks: s.tasks.map((t) => {
              if (t.id === task.id) return { ...t, order: bOrder };
              if (t.id === other.id) return { ...t, order: aOrder };
              return t;
            }),
          };
        }),
      reorderTasks: (orderedIds) =>
        set((s) => {
          const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
          return {
            tasks: s.tasks.map((t) => (orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t)),
          };
        }),

      addChecklistItem: (taskId, text) => {
        if (!text.trim()) return;
        const item: ChecklistItem = { id: newId(), text: text.trim(), done: false };
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, checklist: [...t.checklist, item] } : t
          ),
        }));
      },
      toggleChecklistItem: (taskId, itemId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: t.checklist.map((c) =>
                    c.id === itemId ? { ...c, done: !c.done } : c
                  ),
                }
              : t
          ),
        })),
      deleteChecklistItem: (taskId, itemId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, checklist: t.checklist.filter((c) => c.id !== itemId) }
              : t
          ),
        })),

      addResource: (data) =>
        set((s) => ({
          resources: [
            ...s.resources,
            {
              id: newId(),
              projectId: data.projectId,
              taskId: data.taskId,
              type: data.type,
              title: data.title.trim(),
              url: (data.url ?? "").trim(),
              content: (data.content ?? "").trim(),
              createdAt: Date.now(),
            },
          ],
        })),
      deleteResource: (id) =>
        set((s) => ({ resources: s.resources.filter((r) => r.id !== id) })),

      addContext: (name, icon) =>
        set((s) => ({
          contexts: [...s.contexts, { id: newId(), name: name.trim(), icon }],
        })),
      updateContext: (id, patch) =>
        set((s) => ({
          contexts: s.contexts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteContext: (id) =>
        set((s) => ({
          contexts: s.contexts.filter((c) => c.id !== id),
          tasks: s.tasks.map((t) => ({
            ...t,
            contextIds: t.contextIds.filter((cid) => cid !== id),
          })),
        })),

      addInboxItem: (text) => {
        if (!text.trim()) return;
        const item: InboxItem = { id: newId(), text: text.trim(), createdAt: Date.now() };
        set((s) => ({ inbox: [item, ...s.inbox] }));
      },
      deleteInboxItem: (id) =>
        set((s) => ({ inbox: s.inbox.filter((i) => i.id !== id) })),

      addSomedayIdea: (text) => {
        if (!text.trim()) return;
        const idea: SomedayIdea = { id: newId(), text: text.trim(), createdAt: Date.now() };
        set((s) => ({ somedayIdeas: [idea, ...s.somedayIdeas] }));
      },
      deleteSomedayIdea: (id) =>
        set((s) => ({ somedayIdeas: s.somedayIdeas.filter((i) => i.id !== id) })),

      markReviewed: () => set({ lastReviewedAt: Date.now() }),

      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      markNotified: (date) => set({ lastNotifiedDate: date }),
      setDisplayName: (name) => set({ displayName: name }),

      importData: (data) =>
        set({
          projects: data.projects ?? [],
          tasks: (data.tasks ?? []).map(withTaskDefaults),
          resources: data.resources ?? [],
          contexts: data.contexts?.length ? data.contexts : DEFAULT_CONTEXTS,
          inbox: data.inbox ?? [],
          somedayIdeas: data.somedayIdeas ?? [],
          lastReviewedAt: data.lastReviewedAt ?? null,
          notificationsEnabled: data.notificationsEnabled ?? false,
          lastNotifiedDate: data.lastNotifiedDate ?? null,
          displayName: data.displayName ?? "",
        }),
      clearAll: () => set({ ...initialState }),
    }),
    {
      name: "gtd-app-storage",
      version: 3,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      skipHydration: true,
      partialize: (s) => ({
        projects: s.projects,
        tasks: s.tasks,
        resources: s.resources,
        contexts: s.contexts,
        inbox: s.inbox,
        somedayIdeas: s.somedayIdeas,
        lastReviewedAt: s.lastReviewedAt,
        notificationsEnabled: s.notificationsEnabled,
        lastNotifiedDate: s.lastNotifiedDate,
        displayName: s.displayName,
      }),
      migrate: (persisted) => {
        const p = persisted as AppState;
        return {
          ...p,
          tasks: (p.tasks ?? []).map(withTaskDefaults),
          notificationsEnabled: p.notificationsEnabled ?? false,
          lastNotifiedDate: p.lastNotifiedDate ?? null,
          displayName: p.displayName ?? "",
        };
      },
    }
  )
);

export type { Priority, RecurrenceRule };
