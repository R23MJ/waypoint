import { Project, Task, Resource } from "./types";

export interface SearchResults {
  projects: Project[];
  tasks: Task[];
  resources: Resource[];
}

export function searchAll(
  query: string,
  data: { projects: Project[]; tasks: Task[]; resources: Resource[] }
): SearchResults {
  const q = query.trim().toLowerCase();
  if (!q) return { projects: [], tasks: [], resources: [] };

  return {
    projects: data.projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q)
    ),
    tasks: data.tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
    ),
    resources: data.resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
    ),
  };
}
