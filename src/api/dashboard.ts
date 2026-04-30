import { apiFetch } from "./client"
import type { ApiDashboardKPI } from "../types/api"

export function getDashboardKPI(projectId: number): Promise<ApiDashboardKPI> {
  return apiFetch<ApiDashboardKPI>(`/api/dashboard?projectId=${projectId}`)
}
