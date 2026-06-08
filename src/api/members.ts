import { apiFetch } from "./client";
import { cache, TTL } from "../lib/cache";
import type { ApiProjectMember } from "../types/api";

// ─── reads ────────────────────────────────────────────────────────────────────

export const getProjectMembers = (
  params?: { projectId?: number; userId?: number },
  signal?: AbortSignal,
): Promise<ApiProjectMember[]> => {
  const query = new URLSearchParams();
  if (params?.projectId != null)
    query.set("projectId", String(params.projectId));
  if (params?.userId != null) query.set("userId", String(params.userId));
  const qs = query.toString();

  // La key refleja exactamente los parámetros usados:
  //   members:all          → sin filtros
  //   members:p:5          → filtrado por projectId=5
  //   members:u:12         → filtrado por userId=12
  //   members:p:5:u:12     → ambos filtros
  const KEY =
    [
      "members",
      params?.projectId != null ? `p:${params.projectId}` : null,
      params?.userId != null ? `u:${params.userId}` : null,
    ]
      .filter(Boolean)
      .join(":") || "members:all";

  const hit = cache.get<ApiProjectMember[]>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiProjectMember[]>(
    `/api/project-members${qs ? `?${qs}` : ""}`,
    { signal },
  ).then((data) => {
    cache.set(KEY, data, TTL.MEMBERS);
    return data;
  });
};

// ─── mutations ────────────────────────────────────────────────────────────────

export const addMember = (body: {
  projectId: number;
  userId: number;
  role?: string;
}): Promise<ApiProjectMember> =>
  apiFetch<ApiProjectMember>("/api/project-members", {
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    cache.invalidatePrefix(`members:p:${body.projectId}`);
    cache.invalidatePrefix(`members:u:${body.userId}`);
    cache.invalidate("members:all");
    return data;
  });

export const removeMember = (
  id: number,
  meta?: { projectId?: number; userId?: number },
): Promise<void> =>
  apiFetch<void>(`/api/project-members/${id}`, { method: "DELETE" }).then(
    () => {
      if (meta?.projectId != null)
        cache.invalidatePrefix(`members:p:${meta.projectId}`);
      if (meta?.userId != null)
        cache.invalidatePrefix(`members:u:${meta.userId}`);
      if (meta?.projectId == null && meta?.userId == null)
        cache.invalidatePrefix("members:");
      cache.invalidate("members:all");
    },
  );
