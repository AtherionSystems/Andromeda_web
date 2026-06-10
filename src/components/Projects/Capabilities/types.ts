// Domain types for the capability hierarchy.
// When wiring the backend, map your API DTOs onto these shapes (or extend them).

export type CapabilityStatus = "ON TRACK" | "PLANNING" | "AT RISK";
export type FeatureStatus = "IN PROGRESS" | "REVIEW" | "BACKLOG" | "DONE";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Assignee {
  initials: string;
  color: string;
}

export interface Story {
  id: string;
  text: string;
  assignee: Assignee;
}

export interface Feature {
  id: string;
  name: string;
  priority: Priority;
  status: FeatureStatus;
  stories: Story[];
}

export interface Capability {
  id: string;
  name: string;
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
