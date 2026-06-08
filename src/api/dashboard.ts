import { apiFetch } from "./client";
import { cache, TTL } from "../lib/cache";
import type { ApiDashboardKPI } from "../types/api";

export function getDashboardKPI(projectId: number): Promise<ApiDashboardKPI> {
  const KEY = `dashboard:kpi:${projectId}`;
  const hit = cache.get<ApiDashboardKPI>(KEY);
  if (hit) return Promise.resolve(hit);

  return apiFetch<ApiDashboardKPI>(
    `/api/dashboard?projectId=${projectId}`,
  ).then((data) => {
    cache.set(KEY, data, TTL.DASHBOARD);
    return data;
  });
}
