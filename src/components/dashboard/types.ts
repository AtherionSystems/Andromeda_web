import type { ApiProject, ApiTask, MemberRole } from "../../types/api";

export interface ProjectGroup {
  project: ApiProject;
  members: MemberEntry[];
}

export interface ProjectEffortData {
  project: string;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

export interface EnrichedTask extends ApiTask {
  projectId: number;
  projectName: string;
}

export interface MemberEntry {
  userId: number;
  username: string;
  role: MemberRole;
  status: "on_track" | "meeting" | "blocked";
  initials: string;
}

export const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function memberStatus(role: MemberRole, idx: number): "on_track" | "meeting" | "blocked" {
  if (role === "owner") return "on_track";
  if (role === "manager") return "meeting";
  return idx % 2 === 0 ? "on_track" : "blocked";
}

export function initials(username: string): string {
  const parts = username.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

export function taskCode(task: EnrichedTask): string {
  const abbr = task.projectName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  return `${abbr}-${String(task.id).padStart(3, "0")}`;
}

export const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  on_track: { bg: "#f0fdf4", text: "#16a34a", label: "ON TRACK" },
  meeting:  { bg: "#eff6ff", text: "#2563eb", label: "MEETING" },
  blocked:  { bg: "#fef2f2", text: "#c74634", label: "BLOCKED" },
};

export const AVATAR_COLORS = ["#4a3f7a", "#2a6a5a", "#c74634", "#d97706", "#2a4a7a", "#6a2a4a"];

export const PRIORITY_BADGE: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#fef2f2", color: "#c74634" },
  high:     { bg: "#fff7ed", color: "#d97706" },
  medium:   { bg: "#eff6ff", color: "#2563eb" },
  low:      { bg: "#f1f5f9", color: "#64748b" },
};
