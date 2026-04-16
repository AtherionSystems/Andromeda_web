// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  userTypeId: number;
  userType: string; // e.g. "developer", "admin", "manager"
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── Projects ────────────────────────────────────────────────────────────────

export type ProjectStatus = "active" | "paused" | "completed" | "cancelled";

export interface ApiProject {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface ApiTask {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number | null;
  actualHours: number | null;
  storyPoints: number | null;
  acceptanceCriteria: string | null;
  startDate: string | null;
  dueDate: string | null;
  actualEnd: string | null;
  createdAt: string;
  // enriched client-side
  projectId?: number;
  projectName?: string;
}

export interface ApiTaskAssignment {
  id: number;
  task: { id: number; title: string };
  user: { id: number; username: string };
  assignedAt: string;
}

// ─── Project Members ─────────────────────────────────────────────────────────

export type MemberRole = "owner" | "manager" | "member";

export interface ApiProjectMember {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  username: string;
  role: MemberRole;
  joinedAt: string;
}

// ─── Sprints ─────────────────────────────────────────────────────────────────

export type SprintStatus = "planned" | "active" | "completed";

export interface ApiSprint {
  id: number;
  projectId: number;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  dueDate: string | null;
  actualEnd: string | null;
  createdAt: string;
}
