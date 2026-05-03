import { apiFetch } from "./client";
import type { ApiProject } from "../types/api";

export const getProjects = (): Promise<ApiProject[]> =>
  apiFetch("/api/projects");

export const getProject = (id: number): Promise<ApiProject> =>
  apiFetch(`/api/projects/${id}`);

export const createProject = (
  body: Partial<Omit<ApiProject, "id" | "createdAt">>
): Promise<ApiProject> =>
  apiFetch("/api/projects", { method: "POST", body: JSON.stringify(body) });

export const updateProject = (
  id: number,
  body: Partial<Omit<ApiProject, "id" | "createdAt">>
): Promise<ApiProject> =>
  apiFetch(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteProject = (id: number): Promise<void> =>
  apiFetch(`/api/projects/${id}`, { method: "DELETE" });
