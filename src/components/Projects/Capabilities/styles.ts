import type { FeatureStatus, Priority } from "./types";

// Shared status / priority styling used by features and standalone tasks.
export const FEAT_STATUS_STYLES: Record<FeatureStatus, string> = {
  "IN PROGRESS": "bg-rose-100 text-rose-600",
  REVIEW: "bg-blue-100 text-blue-600",
  BACKLOG: "bg-slate-100 text-slate-500",
  DONE: "bg-emerald-100 text-emerald-600",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH: "#c74634",
  MEDIUM: "#d97706",
  LOW: "#64748b",
};
