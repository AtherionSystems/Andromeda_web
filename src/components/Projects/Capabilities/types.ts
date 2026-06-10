// Single source of truth for capability statuses — UIs derive their options
// from this array, and the type is derived from it too.
// Values are lowercase to match the backend; display them capitalized.
export const CAPABILITY_STATUSES = ["active", "completed", "cancelled"] as const;
export type CapabilityStatus = (typeof CAPABILITY_STATUSES)[number];

// Features use the same status set as capabilities.
export const FEATURE_STATUSES = ["active", "completed", "cancelled"] as const;
export type FeatureStatus = (typeof FEATURE_STATUSES)[number];

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Assignee {
  initials: string;
  color: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string | null;
  acceptanceCriteria?: string | null;
  priority?: string;
  status?: string;
  storyPoints?: number | null;
  createdById?: number;
  ownerId?: number | null;
  // Optional avatar for display (not provided by the backend by default).
  assignee?: Assignee;
}

export interface Feature {
  id: string;
  name: string;
  description?: string | null;
  priority?: Priority;
  status: FeatureStatus;
  stories: Story[];
}

export interface Capability {
  id: string;
  name: string;
  description?: string | null;
  status: CapabilityStatus;
  features: Feature[];
}

// Standalone tasks — not linked to any capability or feature.
export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: FeatureStatus;
  assignee: Assignee;
}
