import { apiFetch } from "./client";
import { cache, TTL } from "../lib/cache";
import type { ApiProject, ApiTask, TaskStatus } from "../types/api";

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface ApiMeTaskDistribution {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

export interface ApiMeHoursPerSprint {
  sprintName: string;
  estimatedHours: number;
  actualHours: number;
}

export interface ApiMeTasksPerSprint {
  sprintName: string;
  tasksCompleted: number;
  storyPoints: number;
}

export interface ApiMeDashboard {
  projectId: number | null;
  generatedAt: string;
  taskDistribution: ApiMeTaskDistribution;
  hoursPerSprint: ApiMeHoursPerSprint[];
  tasksPerSprint: ApiMeTasksPerSprint[];
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const getMyProjects = (signal?: AbortSignal): Promise<ApiProject[]> => {
  const KEY = "me:projects";
  const hit = cache.get<ApiProject[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiProject[]>("/api/me/projects", { signal }).then((data) => {
    cache.set(KEY, data, TTL.PROJECTS);
    return data;
  });
};

export const getMyTasks = (
  params?: { projectId?: number; status?: TaskStatus },
  signal?: AbortSignal,
): Promise<ApiTask[]> => {
  const qs = new URLSearchParams();
  if (params?.projectId != null) qs.set("projectId", String(params.projectId));
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  const KEY = `me:tasks:${query || "all"}`;
  const hit = cache.get<ApiTask[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiTask[]>(`/api/me/tasks${query ? `?${query}` : ""}`, {
    signal,
  }).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const getMyDashboard = (
  projectId?: number,
  signal?: AbortSignal,
): Promise<ApiMeDashboard> => {
  const query = projectId != null ? `?projectId=${projectId}` : "";
  const KEY = `me:dashboard:${projectId ?? "all"}`;
  const hit = cache.get<ApiMeDashboard>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiMeDashboard>(`/api/me/dashboard${query}`, { signal }).then(
    (data) => {
      cache.set(KEY, data, TTL.TASKS);
      return data;
    },
  );
};
