import { apiFetch } from "./client";
import type { ApiProjectMember } from "../types/api";

export const getProjectMembers = (params?: {
  projectId?: number;
  userId?: number;
}): Promise<ApiProjectMember[]> => {
  const query = new URLSearchParams();
  if (params?.projectId != null)
    query.set("projectId", String(params.projectId));
  if (params?.userId != null) query.set("userId", String(params.userId));
  const qs = query.toString();
  return apiFetch(`/api/project-members${qs ? `?${qs}` : ""}`);
};

export const addMember = (body: {
  projectId: number;
  userId: number;
  role?: string;
}): Promise<ApiProjectMember> =>
  apiFetch("/api/project-members", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const removeMember = (id: number): Promise<void> =>
  apiFetch(`/api/project-members/${id}`, { method: "DELETE" });
