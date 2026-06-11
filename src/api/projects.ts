import { apiFetch } from "./client";
import { cache, TTL } from "../lib/cache";
import type { ApiProject, ApiSprint } from "../types/api";

// ─── reads ────────────────────────────────────────────────────────────────────

export const getProjects = (signal?: AbortSignal): Promise<ApiProject[]> => {
  const KEY = "projects:all";
  const hit = cache.get<ApiProject[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiProject[]>("/api/projects", { signal }).then((data) => {
    cache.set(KEY, data, TTL.PROJECTS);
    return data;
  });
};

export const getProject = (id: number): Promise<ApiProject> => {
  const KEY = `project:${id}`;
  const hit = cache.get<ApiProject>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiProject>(`/api/projects/${id}`).then((data) => {
    cache.set(KEY, data, TTL.PROJECTS);
    return data;
  });
};

export const getProjectSprints = (projectId: number): Promise<ApiSprint[]> => {
  const KEY = `sprints:${projectId}`;
  const hit = cache.get<ApiSprint[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiSprint[]>(`/api/projects/${projectId}/sprints`).then(
    (data) => {
      cache.set(KEY, data, TTL.SPRINTS);
      return data;
    },
  );
};

// ─── mutations ────────────────────────────────────────────────────────────────

export const createProject = (
  body: Partial<Omit<ApiProject, "id" | "createdAt">>,
): Promise<ApiProject> =>
  apiFetch<ApiProject>("/api/projects", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    cache.invalidate("projects:all");
    return data;
  });

export const updateProject = (
  id: number,
  body: Partial<Omit<ApiProject, "id" | "createdAt">>,
): Promise<ApiProject> =>
  apiFetch<ApiProject>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  }).then((data) => {
    cache.invalidate(`project:${id}`);
    cache.invalidate("projects:all");
    return data;
  });

export const deleteProject = (id: number): Promise<void> =>
  apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" }).then(() => {
    cache.invalidate(`project:${id}`);
    cache.invalidate("projects:all");
    cache.invalidatePrefix(`sprints:${id}`);
    cache.invalidatePrefix(`tasks:project:${id}`);
    cache.invalidatePrefix(`tasks:sprint:${id}:`);
    cache.invalidatePrefix(`members:${id}`);
  });

export const createSprint = (
  projectId: number,
  body: {
    name: string;
    goal?: string | null;
    status?: "planned" | "active" | "completed";
    startDate?: string | null;
    dueDate?: string | null;
  },
): Promise<ApiSprint> => {
  const KEY_LIST = `sprints:${projectId}`;
  return apiFetch<ApiSprint>(`/api/projects/${projectId}/sprints`, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    cache.invalidate(KEY_LIST); // fuerza re-fetch de la lista en la próxima visita
    return data;
  });
};
