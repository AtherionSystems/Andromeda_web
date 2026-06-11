import { apiFetch } from "./client";
import { cache, TTL } from "../lib/cache";
import type { ApiTask, ApiTaskAssignment } from "../types/api";

// ─── reads ────────────────────────────────────────────────────────────────────

export const getProjectTasks = (
  projectId: number,
  signal?: AbortSignal,
): Promise<ApiTask[]> => {
  const KEY = `tasks:project:${projectId}`;
  const hit = cache.get<ApiTask[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiTask[]>(`/api/projects/${projectId}/tasks`, {
    signal,
  }).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const getTasksByStory = (
  projectId: number,
  userStoryId: number,
): Promise<ApiTask[]> => {
  const KEY = `tasks:story:${projectId}:${userStoryId}`;
  const hit = cache.get<ApiTask[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiTask[]>(
    `/api/projects/${projectId}/tasks?userStoryId=${userStoryId}`,
  ).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const getSprintTasks = (
  projectId: number,
  sprintId: number,
): Promise<ApiTask[]> => {
  const KEY = `tasks:sprint:${projectId}:${sprintId}`;
  const hit = cache.get<ApiTask[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiTask[]>(
    `/api/projects/${projectId}/sprints/${sprintId}/tasks`,
  ).then((data) => {
    cache.set(KEY, data, TTL.TASKS);
    return data;
  });
};

export const getTask = (
  projectId: number,
  taskId: number,
): Promise<ApiTask> => {
  const KEY = `task:${projectId}:${taskId}`;
  const hit = cache.get<ApiTask>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiTask>(`/api/projects/${projectId}/tasks/${taskId}`).then(
    (data) => {
      cache.set(KEY, data, TTL.TASKS);
      return data;
    },
  );
};

export const getTaskAssignments = (
  projectId: number,
  taskId: number,
): Promise<ApiTaskAssignment[]> => {
  const KEY = `assignments:${projectId}:${taskId}`;
  const hit = cache.get<ApiTaskAssignment[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiTaskAssignment[]>(
    `/api/projects/${projectId}/tasks/${taskId}/assignments`,
  ).then((data) => {
    cache.set(KEY, data, TTL.ASSIGNMENTS);
    return data;
  });
};

// ─── mutations ────────────────────────────────────────────────────────────────

export const addTaskToSprint = (
  projectId: number,
  sprintId: number,
  taskId: number,
): Promise<void> =>
  apiFetch<void>(`/api/projects/${projectId}/sprints/${sprintId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ taskId }),
  }).then(() => {
    cache.invalidate(`tasks:sprint:${projectId}:${sprintId}`);
    cache.invalidatePrefix(`tasks:project:${projectId}`);
  });

export const createTask = (
  projectId: number,
  body: Partial<
    Omit<ApiTask, "id" | "createdAt" | "projectId" | "projectName">
  >,
  userStoryId?: number,
): Promise<ApiTask> => {
  const qs = userStoryId != null ? `?userStoryId=${userStoryId}` : "";
  return apiFetch<ApiTask>(`/api/projects/${projectId}/tasks${qs}`, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    cache.invalidatePrefix(`tasks:project:${projectId}`);
    cache.invalidatePrefix(`tasks:sprint:${projectId}:`);
    if (userStoryId != null) cache.invalidate(`tasks:story:${projectId}:${userStoryId}`);
    return data;
  });
};

export const updateTask = (
  projectId: number,
  taskId: number,
  body: Partial<
    Omit<ApiTask, "id" | "createdAt" | "projectId" | "projectName">
  >,
): Promise<ApiTask> =>
  apiFetch<ApiTask>(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  }).then((data) => {
    cache.invalidate(`task:${projectId}:${taskId}`);
    cache.invalidatePrefix(`tasks:project:${projectId}`);
    cache.invalidatePrefix(`tasks:sprint:${projectId}:`);
    return data;
  });

// ─── assignments ───────────────────────────────────────────────────────────

export const assignTask = (
  projectId: number,
  taskId: number,
  userId: number,
): Promise<ApiTaskAssignment> => {
  // Invalidate up-front too: the backend can 500 on the response while still
  // persisting, so a follow-up read must fetch the fresh list.
  cache.invalidate(`assignments:${projectId}:${taskId}`);
  return apiFetch<ApiTaskAssignment>(
    `/api/projects/${projectId}/tasks/${taskId}/assignments`,
    { method: "POST", body: JSON.stringify({ userId }) },
  ).then((data) => {
    cache.invalidate(`assignments:${projectId}:${taskId}`);
    return data;
  });
};

export const unassignTask = (
  projectId: number,
  taskId: number,
  userId: number,
): Promise<void> => {
  cache.invalidate(`assignments:${projectId}:${taskId}`);
  return apiFetch<void>(
    `/api/projects/${projectId}/tasks/${taskId}/assignments/${userId}`,
    { method: "DELETE" },
  ).then(() => {
    cache.invalidate(`assignments:${projectId}:${taskId}`);
  });
};

export const deleteTask = (projectId: number, taskId: number): Promise<void> =>
  apiFetch<void>(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  }).then(() => {
    cache.invalidate(`task:${projectId}:${taskId}`);
    cache.invalidate(`assignments:${projectId}:${taskId}`);
    cache.invalidatePrefix(`tasks:project:${projectId}`);
    cache.invalidatePrefix(`tasks:sprint:${projectId}:`);
  });
