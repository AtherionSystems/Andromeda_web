import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/useTheme";
import { SprintVelocityCard, CompletionRateCard } from "./SprintVelocity";
import { SprintCompletionRate } from "./SprintCompletion";
import { TeamVelocity } from "./TeamVelocity";
import { IndividualPerformanceCard } from "./IndividualPerformanceCard";
import { TaskDistributionByState } from "./TaskDistributionbyState";
import { TeamTaskCompletion } from "./TeamTaskCompletion";
import { getProjects } from "@/api/projects";
import { getDashboardKPI } from "@/api/dashboard";
import type {
  ApiProject,
  ApiDashboardKPI,
  ApiBurndownBySprintItem,
  ApiTeamVelocityItem,
  ApiUserTasksPerSprintItem,
  ApiTaskDistributionItem,
  DashboardBurndownPoint,
  DashboardTaskDistributionItem,
  DashboardTeamMemberCompletion,
} from "@/types/api";

// ─── Colores ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  done: "#5C926D",
  in_progress: "#DEB068",
  todo: "#36677D",
  review: "#8FBFD0",
  blocked: "#C74634",
};

const STATUS_DISPLAY_KEY: Record<string, string> = {
  in_progress: "inProgress",
  todo: "todo",
  done: "done",
  review: "review",
  blocked: "blocked",
};

const AVATAR_COLORS = [
  "bg-[#99C2A6]",
  "bg-[#69777B]",
  "bg-[#8FBFD0]",
  "bg-[#c74634]",
  "bg-[#DEB068]",
  "bg-[#5C926D]",
  "bg-[#2a4a5a]",
];

// ─── Transformaciones ─────────────────────────────────────────────────────────

function shortSprintName(name: string): string {
  return name.match(/Sprint \d+/)?.[0] ?? name;
}

/** Pie chart: { status, total } → { state, tasks, fill } */
function toTaskDistribution(
  raw: ApiTaskDistributionItem[],
): DashboardTaskDistributionItem[] {
  return raw.map((item) => ({
    state: STATUS_DISPLAY_KEY[item.status] ?? item.status,
    tasks: item.total,
    fill: STATUS_COLORS[item.status] ?? "#69777B",
  }));
}

/** CompletionRateCard: done / total * 100 */
function calcCompletionRate(raw: ApiTaskDistributionItem[]): number {
  const total = raw.reduce((sum, i) => sum + i.total, 0);
  const done = raw.find((i) => i.status === "done")?.total ?? 0;
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/** SprintVelocityCard: último sprint completado */
function calcSprintVelocity(raw: ApiTeamVelocityItem[]): {
  velocity: number;
  change: number;
} {
  if (raw.length === 0) return { velocity: 0, change: 0 };
  const last = raw[raw.length - 1];
  const prev = raw.length > 1 ? raw[raw.length - 2] : null;
  const change =
    prev && prev.pointsCompleted > 0
      ? Math.round(
          ((last.pointsCompleted - prev.pointsCompleted) /
            prev.pointsCompleted) *
            100,
        )
      : 0;
  return { velocity: last.pointsCompleted, change };
}

/** SprintCompletionRate: { day: "Sprint N", ideal: 100, actual: completionRate } */
function toBurndown(raw: ApiBurndownBySprintItem[]): DashboardBurndownPoint[] {
  const projectTotalStories = raw.reduce(
    (sum, item) => sum + item.totalStories,
    0,
  );
  let remainingStories = projectTotalStories;
  const chartPoints: DashboardBurndownPoint[] = [
    { day: "Start", ideal: 100, actual: 100 },
  ];
  raw.forEach((item, index) => {
    const idealPoint =
      raw.length > 0 ? Math.round(100 - ((index + 1) / raw.length) * 100) : 0;
    remainingStories -= item.completedStories;
    const actualRemaining =
      projectTotalStories > 0
        ? Math.round((remainingStories / projectTotalStories) * 100)
        : 0;
    chartPoints.push({
      day: shortSprintName(item.sprintName),
      ideal: idealPoint,
      actual: actualRemaining,
    });
  });

  return chartPoints;
}

/** TeamVelocity: { sprintNumber: "Sprint N", pointsCompleted, pointsPlanned } */
function toTeamVelocityChart(
  raw: ApiTeamVelocityItem[],
): Record<string, number | string>[] {
  return raw.map((item) => ({
    sprintNumber: shortSprintName(item.sprintName),
    pointsCompleted: item.pointsCompleted,
    pointsPlanned: item.pointsPlanned,
  }));
}


/**
 * TeamTaskCompletion: suma tasks completadas por usuario.
 * La barra muestra el % real que representa cada integrante del total del equipo.
 */
function toTeamCompletion(
  raw: ApiUserTasksPerSprintItem[],
): DashboardTeamMemberCompletion[] {
  const totals: Record<string, number> = {};
  raw.forEach((r) => {
    totals[r.userName] = (totals[r.userName] ?? 0) + r.tasksCompleted;
  });

  const teamTotal = Object.values(totals).reduce((s, v) => s + v, 0) || 1;

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, completed], i) => ({
      id: String(i + 1),
      name,
      completion: Math.round((completed / teamTotal) * 100),
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    }));
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [kpi, setKpi] = useState<ApiDashboardKPI | null>(null);
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();

  useEffect(() => {
    getProjects()
      .then((list) => {
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProjectId === null) return;
    const projectId = selectedProjectId;
    let isActive = true;

    async function loadKpi() {
      setLoading(true);
      setKpi(null);
      try {
        const data = await getDashboardKPI(projectId);
        if (isActive) setKpi(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadKpi();
    return () => { isActive = false; };
  }, [selectedProjectId]);

  const taskDistribution = kpi ? toTaskDistribution(kpi.taskDistribution) : undefined;
  const completionRate   = kpi ? calcCompletionRate(kpi.taskDistribution) : undefined;
  const { velocity, change } = kpi
    ? calcSprintVelocity(kpi.teamVelocity)
    : { velocity: undefined, change: undefined };
  const burndown        = kpi?.burndownBySprint?.length ? toBurndown(kpi.burndownBySprint) : undefined;
  const teamVelocityData = kpi?.teamVelocity.length ? toTeamVelocityChart(kpi.teamVelocity) : undefined;
  const teamCompletion  = kpi?.userTasksPerSprint?.length ? toTeamCompletion(kpi.userTasksPerSprint) : undefined;

  return (
    <div className={`min-h-screen p-3 sm:p-6 ${darkMode ? "bg-slate-950" : "bg-background"}`}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Analytics Dashboard
        </h1>
        {projects.length > 0 && (
          <select
            value={selectedProjectId ?? ""}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className={`w-full sm:w-auto rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-slate-500" : "border-[#C2D4D4] bg-white text-slate-900 focus:ring-[#2a4a5a]"}`}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* KPI cards + burndown: KPI cards stack above on mobile, side-by-side on md+ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          <div className="grid grid-cols-2 gap-4 md:flex md:flex-col">
            <SprintVelocityCard velocity={velocity} velocityChange={change} loading={loading} index={0} />
            <CompletionRateCard completionRate={completionRate} loading={loading} index={1} />
          </div>
          <SprintCompletionRate data={burndown} index={2} />
        </div>

        {/* Individual Performance */}
        <IndividualPerformanceCard
          hoursRaw={kpi?.hoursPerUserBySprint}
          tasksRaw={kpi?.userTasksPerSprint}
          loading={loading}
        />

        {/* Team velocity + task distribution */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TeamVelocity data={teamVelocityData} index={5} />
          <TaskDistributionByState data={taskDistribution} index={6} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TeamTaskCompletion members={teamCompletion} isLoading={loading} index={7} />
        </div>
      </div>
    </div>
  );
}
