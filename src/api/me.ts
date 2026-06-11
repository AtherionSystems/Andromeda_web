import { apiFetch } from "./client";
import { cache, TTL } from "../lib/cache";
import type { ApiProject, TaskStatus, TaskPriority } from "../types/api";

// ─── Response shapes ──────────────────────────────────────────────────────────

/** Task shape returned by /api/me/tasks. Note: no projectId, createdAt, etc. */
export interface ApiMeTask {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string | null;
  dueDate: string | null;
  actualEnd: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  userStoryId: number | null;
  projectName: string;
  assignedUserName: string | null;
}

export interface ApiMeTaskDistributionItem {
  status: string;
  total: number;
}

export interface ApiMeHoursPerSprintItem {
  sprintName: string;
  estimatedHours: number;
  actualHours: number;
}

export interface ApiMeTasksPerSprintItem {
  sprintName: string;
  tasksCompleted: number;
}

export interface ApiMeDashboard {
  projectId: number;
  userId?: number;
  userName?: string;
  generatedAt?: string;
  myTaskDistribution: ApiMeTaskDistributionItem[];
  myHoursPerSprint: ApiMeHoursPerSprintItem[];
  myTasksPerSprint: ApiMeTasksPerSprintItem[];
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
): Promise<ApiMeTask[]> => {
  const qs = new URLSearchParams();
  if (params?.projectId != null) qs.set("projectId", String(params.projectId));
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString();
  const KEY = `me:tasks:${query || "all"}`;
  const hit = cache.get<ApiMeTask[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiMeTask[]>(`/api/me/tasks${query ? `?${query}` : ""}`, {
    signal,
  }).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

/** projectId is REQUIRED — backend returns 400 without it. */
export const getMyDashboard = (
  projectId: number,
  signal?: AbortSignal,
): Promise<ApiMeDashboard> => {
  const KEY = `me:dashboard:${projectId}`;
  const hit = cache.get<ApiMeDashboard>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiMeDashboard>(`/api/me/dashboard?projectId=${projectId}`, {
    signal,
  }).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};
