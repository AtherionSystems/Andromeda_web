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
  token: string;
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

// ─── Dashboard KPI (API response shape) ──────────────────────────────────────

export interface ApiTaskDistributionItem {
  status: string
  total: number
}

export interface ApiCompletionRateBySprintItem {
  completedStories: number
  completionRate: number
  sprintName: string
  totalStories: number
}

export interface ApiTeamVelocityItem {
  pointsCompleted: number
  pointsPlanned: number
  sprintName: string
}

export interface ApiUserTasksPerSprintItem {
  sprintName: string
  tasksCompleted: number
  userName: string
}

export interface ApiDashboardKPI {
  completionRateBySprint: ApiCompletionRateBySprintItem[]
  generatedAt: string
  projectId: number
  taskDistribution: ApiTaskDistributionItem[]
  teamVelocity: ApiTeamVelocityItem[]
  userTasksPerSprint: ApiUserTasksPerSprintItem[]
}

// ─── Dashboard KPI (frontend display shapes) ─────────────────────────────────

export interface DashboardBurndownPoint {
  day: string
  ideal: number
  actual: number
}

export interface DashboardTaskDistributionItem {
  state: string
  tasks: number
  fill: string
}

export interface DashboardTeamMemberCompletion {
  id: string
  name: string
  completion: number
  avatarColor?: string
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
