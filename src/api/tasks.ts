import { apiFetch } from "./client";
import type { ApiTask, ApiTaskAssignment } from "../types/api";

export const getProjectTasks = (projectId: number): Promise<ApiTask[]> =>
  apiFetch(`/api/projects/${projectId}/tasks`);

export const getTask = (projectId: number, taskId: number): Promise<ApiTask> =>
  apiFetch(`/api/projects/${projectId}/tasks/${taskId}`);

export const getTaskAssignments = (
  projectId: number,
  taskId: number
): Promise<ApiTaskAssignment[]> =>
  apiFetch(`/api/projects/${projectId}/tasks/${taskId}/assignments`);

export const createTask = (
  projectId: number,
  body: Partial<Omit<ApiTask, "id" | "createdAt" | "projectId" | "projectName">>
): Promise<ApiTask> =>
  apiFetch(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateTask = (
  projectId: number,
  taskId: number,
  body: Partial<Omit<ApiTask, "id" | "createdAt" | "projectId" | "projectName">>
): Promise<ApiTask> =>
  apiFetch(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteTask = (projectId: number, taskId: number): Promise<void> =>
  apiFetch(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
