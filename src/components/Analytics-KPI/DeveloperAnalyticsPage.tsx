import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/useTheme";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getMyDashboard,
  getMyProjects,
  getMyTasks,
  type ApiMeDashboard,
  type ApiMeTask,
} from "@/api/me";
import type { ApiProject } from "@/types/api";

// ─── Palette ──────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  critical: "#C74634",
  high:     "#FFB13F",
  medium:   "#00688C",
  low:      "#8FBFD0",
};

const STATUS_COLOR: Record<string, string> = {
  todo:        "#94a3b8",
  in_progress: "#f97316",
  review:      "#3b82f6",
  done:        "#22c55e",
};

const PROJECT_COLORS = [
  "#4a3f7a", "#2a6a5a", "#c74634", "#d97706",
  "#2a4a7a", "#6a2a4a", "#5C926D", "#8FBFD0",
];

const OVERRUN_COLOR  = "#c74634";
const UNDERRUN_COLOR = "#5C926D";

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;
const STATUS_ORDER   = ["todo", "in_progress", "review", "done"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

function shortSprintName(name: string): string {
  return name.match(/Sprint \d+/)?.[0] ?? (name.length > 14 ? name.slice(0, 12) + "…" : name);
}

// ─── Card 1: Sprint Scorecard (Table) ─────────────────────────────────────────

interface ScorecardRow {
  sprintName: string;
  tasksCompleted: number;
  estimated: number;
  actual: number;
  drift: number;
}

function aggregateScorecard(dashboards: ApiMeDashboard[]): ScorecardRow[] {
  const bySprint = new Map<string, ScorecardRow>();
  for (const d of dashboards) {
    for (const h of d.myHoursPerSprint ?? []) {
      const row = bySprint.get(h.sprintName) ?? {
        sprintName: h.sprintName,
        tasksCompleted: 0,
        estimated: 0,
        actual: 0,
        drift: 0,
      };
      row.estimated += h.estimatedHours;
      row.actual    += h.actualHours;
      bySprint.set(h.sprintName, row);
    }
    for (const t of d.myTasksPerSprint ?? []) {
      const row = bySprint.get(t.sprintName) ?? {
        sprintName: t.sprintName,
        tasksCompleted: 0,
        estimated: 0,
        actual: 0,
        drift: 0,
      };
      row.tasksCompleted += t.tasksCompleted;
      bySprint.set(t.sprintName, row);
    }
  }
  return [...bySprint.values()].map((r) => ({
    ...r,
    drift: r.estimated > 0 ? Math.round(((r.actual - r.estimated) / r.estimated) * 100) : 0,
  }));
}

function SprintScorecardCard({
  rows,
  loading,
  darkMode,
}: { rows: ScorecardRow[]; loading: boolean; darkMode: boolean }) {
  return (
    <Card className={`card-entrance ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-[#C2D4D4] bg-white text-slate-900"}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">My Sprint Scorecard</CardTitle>
        <CardDescription className="text-xs">
          How you performed each sprint — tasks completed, hours est/real, and drift.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 animate-pulse rounded-md bg-slate-200/30" />
        ) : rows.length === 0 ? (
          <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            No sprint data tracked yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-[10px] uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <th className="text-left  pb-2">Sprint</th>
                  <th className="text-right pb-2">Done</th>
                  <th className="text-right pb-2">Est h</th>
                  <th className="text-right pb-2">Real h</th>
                  <th className="text-right pb-2">Drift</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sprintName} className={`border-t ${darkMode ? "border-slate-700" : "border-slate-100"}`}>
                    <td className="py-2 font-medium">{shortSprintName(r.sprintName)}</td>
                    <td className="py-2 text-right">{r.tasksCompleted}</td>
                    <td className="py-2 text-right">{r.estimated}</td>
                    <td className="py-2 text-right">{r.actual}</td>
                    <td
                      className="py-2 text-right font-bold"
                      style={{ color: r.drift > 10 ? OVERRUN_COLOR : r.drift < -10 ? UNDERRUN_COLOR : (darkMode ? "#cbd5e1" : "#64748b") }}
                    >
                      {r.drift > 0 ? "+" : ""}{r.drift}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 2: Estimation Accuracy by Priority ──────────────────────────────────

interface PriorityDriftRow {
  priority: string;
  driftPct: number;
  taskCount: number;
}

function computePriorityDrift(tasks: ApiMeTask[]): PriorityDriftRow[] {
  const buckets = new Map<string, { drifts: number[]; }>();
  for (const t of tasks) {
    if (t.estimatedHours == null || t.actualHours == null) continue;
    if (t.estimatedHours <= 0) continue;
    const drift = ((t.actualHours - t.estimatedHours) / t.estimatedHours) * 100;
    const b = buckets.get(t.priority) ?? { drifts: [] };
    b.drifts.push(drift);
    buckets.set(t.priority, b);
  }
  return PRIORITY_ORDER
    .filter((p) => buckets.has(p))
    .map((p) => {
      const b = buckets.get(p)!;
      const avg = b.drifts.reduce((a, x) => a + x, 0) / b.drifts.length;
      return {
        priority: p,
        driftPct: Math.round(avg),
        taskCount: b.drifts.length,
      };
    });
}

const driftConfig: ChartConfig = { driftPct: { label: "Drift %", color: "#00688C" } };

function EstimationAccuracyCard({
  data,
  loading,
  darkMode,
}: { data: PriorityDriftRow[]; loading: boolean; darkMode: boolean }) {
  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

  return (
    <Card className={`card-entrance ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-[#C2D4D4] bg-white text-slate-900"}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Estimation Accuracy by Priority</CardTitle>
        <CardDescription className="text-xs">
          Average hour drift per priority. Above zero = underestimating; below = overestimating.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[220px] animate-pulse rounded-md bg-slate-200/30" />
        ) : data.length === 0 ? (
          <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            No tasks with both estimated and actual hours yet.
          </p>
        ) : (
          <ChartContainer config={driftConfig} className="h-[220px] w-full">
            <BarChart data={data} barSize={36}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="priority" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: tickColor, textTransform: "uppercase" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`} />
              <ReferenceLine y={0} stroke={darkMode ? "#475569" : "#94a3b8"} />
              <ChartTooltip content={<ChartTooltipContent
                formatter={(value, _name, item) => {
                  const p = item.payload as PriorityDriftRow;
                  return [`${p.driftPct > 0 ? "+" : ""}${p.driftPct}% (${p.taskCount} task${p.taskCount !== 1 ? "s" : ""})`, "Drift"];
                }}
              />} />
              <Bar dataKey="driftPct" radius={[4, 4, 4, 4]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.driftPct > 0 ? OVERRUN_COLOR : d.driftPct < 0 ? UNDERRUN_COLOR : "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 3: Tasks by Project (Donut) ─────────────────────────────────────────

interface ProjectShareRow {
  projectName: string;
  tasks: number;
  fill: string;
}

function computeProjectShare(tasks: ApiMeTask[]): ProjectShareRow[] {
  const counts = new Map<string, number>();
  for (const t of tasks) counts.set(t.projectName, (counts.get(t.projectName) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([projectName, tasks], i) => ({
      projectName,
      tasks,
      fill: PROJECT_COLORS[i % PROJECT_COLORS.length],
    }));
}

function TasksByProjectCard({
  data,
  loading,
  darkMode,
}: { data: ProjectShareRow[]; loading: boolean; darkMode: boolean }) {
  const total = data.reduce((a, b) => a + b.tasks, 0);
  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.projectName, { label: d.projectName, color: d.fill }]),
  );

  return (
    <Card className={`card-entrance ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-[#C2D4D4] bg-white text-slate-900"}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tasks by Project</CardTitle>
        <CardDescription className="text-xs">
          Where your workload is concentrated across projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[220px] animate-pulse rounded-md bg-slate-200/30" />
        ) : data.length === 0 ? (
          <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            You have no tasks assigned yet.
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <ChartContainer config={config} className="h-[220px] aspect-square">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="tasks"
                  nameKey="projectName"
                  innerRadius={55}
                  outerRadius={90}
                  strokeWidth={2}
                  stroke={darkMode ? "#1e293b" : "#ffffff"}
                >
                  {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              {data.slice(0, 6).map((d) => {
                const pct = total > 0 ? Math.round((d.tasks / total) * 100) : 0;
                return (
                  <div key={d.projectName} className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
                      <span className="text-[12px] font-medium truncate">{d.projectName}</span>
                    </div>
                    <span className={`text-[11px] font-bold shrink-0 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                      {d.tasks} <span className="font-normal text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
              {data.length > 6 && (
                <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>+ {data.length - 6} more</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 4: Hours by Priority (Stacked bar by status) ────────────────────────

interface HoursByPriorityRow {
  priority: string;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

function computeHoursByPriority(tasks: ApiMeTask[]): HoursByPriorityRow[] {
  const init = (): HoursByPriorityRow => ({
    priority: "",
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  });
  const map = new Map<string, HoursByPriorityRow>();
  for (const t of tasks) {
    const hrs = t.actualHours ?? 0;
    if (hrs <= 0) continue;
    const row = map.get(t.priority) ?? { ...init(), priority: t.priority };
    if (t.status === "todo")        row.todo        += hrs;
    if (t.status === "in_progress") row.in_progress += hrs;
    if (t.status === "review")      row.review      += hrs;
    if (t.status === "done")        row.done        += hrs;
    map.set(t.priority, row);
  }
  return PRIORITY_ORDER
    .filter((p) => map.has(p))
    .map((p) => map.get(p)!);
}

const hoursConfig: ChartConfig = {
  todo:        { label: "To Do",       color: STATUS_COLOR.todo },
  in_progress: { label: "In Progress", color: STATUS_COLOR.in_progress },
  review:      { label: "Review",      color: STATUS_COLOR.review },
  done:        { label: "Done",        color: STATUS_COLOR.done },
};

function HoursByPriorityCard({
  data,
  loading,
  darkMode,
}: { data: HoursByPriorityRow[]; loading: boolean; darkMode: boolean }) {
  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

  return (
    <Card className={`card-entrance ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-[#C2D4D4] bg-white text-slate-900"}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Hours by Priority</CardTitle>
        <CardDescription className="text-xs">
          Where your time is going — actual hours by priority level, split by status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[240px] animate-pulse rounded-md bg-slate-200/30" />
        ) : data.length === 0 ? (
          <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            No hours logged yet.
          </p>
        ) : (
          <ChartContainer config={hoursConfig} className="h-[240px] w-full">
            <BarChart data={data} barSize={36}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="priority" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: tickColor }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: tickColor }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="todo"        stackId="h" fill="var(--color-todo)" />
              <Bar dataKey="in_progress" stackId="h" fill="var(--color-in_progress)" />
              <Bar dataKey="review"      stackId="h" fill="var(--color-review)" />
              <Bar dataKey="done"        stackId="h" fill="var(--color-done)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 5: Cross-Project Hours Trend (Multi-line) ───────────────────────────

interface CrossProjectPoint {
  sprint: string;
  [projectName: string]: number | string;
}

function buildCrossProjectTrend(
  projects: ApiProject[],
  dashboards: ApiMeDashboard[],
): { data: CrossProjectPoint[]; projectNames: string[] } {
  const sprintNames = new Set<string>();
  const projectNames: string[] = [];
  const perProject = new Map<string, Map<string, number>>();

  dashboards.forEach((d, i) => {
    const projectName = projects[i]?.name ?? `Project ${d.projectId}`;
    projectNames.push(projectName);
    const map = new Map<string, number>();
    for (const h of d.myHoursPerSprint ?? []) {
      map.set(h.sprintName, (map.get(h.sprintName) ?? 0) + h.actualHours);
      sprintNames.add(h.sprintName);
    }
    perProject.set(projectName, map);
  });

  const sortedSprints = [...sprintNames].sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] ?? "0");
    const nb = parseInt(b.match(/\d+/)?.[0] ?? "0");
    return na - nb;
  });

  const data: CrossProjectPoint[] = sortedSprints.map((s) => {
    const point: CrossProjectPoint = { sprint: shortSprintName(s) };
    for (const name of projectNames) {
      point[name] = perProject.get(name)?.get(s) ?? 0;
    }
    return point;
  });

  return { data, projectNames };
}

function CrossProjectTrendCard({
  data,
  projectNames,
  loading,
  darkMode,
}: { data: CrossProjectPoint[]; projectNames: string[]; loading: boolean; darkMode: boolean }) {
  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

  const config: ChartConfig = Object.fromEntries(
    projectNames.map((name, i) => [
      name,
      { label: name, color: PROJECT_COLORS[i % PROJECT_COLORS.length] },
    ]),
  );

  return (
    <Card className={`card-entrance ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-[#C2D4D4] bg-white text-slate-900"}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Cross-Project Hours Trend</CardTitle>
        <CardDescription className="text-xs">
          Your real hours per sprint, one line per project — see where you spend time over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[260px] animate-pulse rounded-md bg-slate-200/30" />
        ) : data.length === 0 ? (
          <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            No cross-project sprint hours yet.
          </p>
        ) : (
          <ChartContainer config={config} className="h-[260px] w-full">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="sprint" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: tickColor }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: tickColor }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {projectNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={PROJECT_COLORS[i % PROJECT_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Card 6: Overdue & At Risk (KPI tiles) ────────────────────────────────────

interface OverdueStats {
  overdue: number;
  thisWeek: number;
  thisMonth: number;
  onTrack: number;
  overdueTasks: ApiMeTask[];
}

function computeOverdue(tasks: ApiMeTask[]): OverdueStats {
  let overdue = 0, thisWeek = 0, thisMonth = 0, onTrack = 0;
  const overdueTasks: ApiMeTask[] = [];
  for (const t of tasks) {
    if (t.status === "done") continue;
    const d = daysFromNow(t.dueDate);
    if (d == null) {
      onTrack++;
      continue;
    }
    if (d < 0) {
      overdue++;
      overdueTasks.push(t);
    } else if (d <= 7) {
      thisWeek++;
    } else if (d <= 30) {
      thisMonth++;
    } else {
      onTrack++;
    }
  }
  // Sort overdue tasks by how late
  overdueTasks.sort((a, b) => (daysFromNow(a.dueDate) ?? 0) - (daysFromNow(b.dueDate) ?? 0));
  return { overdue, thisWeek, thisMonth, onTrack, overdueTasks };
}

function OverdueCard({
  stats,
  loading,
  darkMode,
}: { stats: OverdueStats; loading: boolean; darkMode: boolean }) {
  const tiles = [
    { label: "Overdue",     value: stats.overdue,    color: "#c74634", hint: "past due date" },
    { label: "Due ≤ 7 d",   value: stats.thisWeek,   color: "#FFB13F", hint: "this week" },
    { label: "Due ≤ 30 d",  value: stats.thisMonth,  color: "#00688C", hint: "this month" },
    { label: "On Track",    value: stats.onTrack,    color: "#5C926D", hint: "no urgency" },
  ];
  return (
    <Card className={`card-entrance ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-[#C2D4D4] bg-white text-slate-900"}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Overdue & At Risk</CardTitle>
        <CardDescription className="text-xs">
          Open tasks bucketed by how soon they're due.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-[100px] animate-pulse rounded-md bg-slate-200/30" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tiles.map((t) => (
                <div
                  key={t.label}
                  className={`rounded-lg border p-3 flex flex-col gap-0.5 ${darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-slate-50/60"}`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: t.color }}>
                    {t.label}
                  </span>
                  <span className="text-[24px] font-bold leading-none" style={{ color: t.color }}>{t.value}</span>
                  <span className={`text-[9px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{t.hint}</span>
                </div>
              ))}
            </div>
            {stats.overdueTasks.length > 0 && (
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Most overdue
                </p>
                <ul className="space-y-1.5">
                  {stats.overdueTasks.slice(0, 4).map((t) => {
                    const days = Math.abs(daysFromNow(t.dueDate) ?? 0);
                    return (
                      <li key={t.id} className={`flex items-center justify-between gap-2 text-[12px] rounded-md px-2 py-1 ${darkMode ? "bg-slate-900/40" : "bg-red-50/40"}`}>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{t.title}</p>
                          <p className={`text-[10px] truncate ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{t.projectName}</p>
                        </div>
                        <span className="text-[11px] font-bold shrink-0" style={{ color: "#c74634" }}>
                          −{days}d
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DeveloperAnalyticsPage() {
  const { darkMode } = useTheme();

  const [projects, setProjects]     = useState<ApiProject[]>([]);
  const [tasks, setTasks]           = useState<ApiMeTask[]>([]);
  const [dashboards, setDashboards] = useState<ApiMeDashboard[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectList, myTasks] = await Promise.all([
          getMyProjects(ac.signal),
          getMyTasks(undefined, ac.signal),
        ]);
        if (ac.signal.aborted) return;

        setProjects(projectList);

        // Drop tasks from projects the user isn't a member of (orphan
        // assignments in the backend) so they don't skew the charts.
        const memberProjects = new Set(projectList.map((p) => p.name));
        setTasks(myTasks.filter((t) => memberProjects.has(t.projectName)));

        const results = await Promise.allSettled(
          projectList.map((p) => getMyDashboard(p.id, ac.signal)),
        );
        if (ac.signal.aborted) return;

        const ds = results
          .filter((r): r is PromiseFulfilledResult<ApiMeDashboard> => r.status === "fulfilled")
          .map((r) => r.value);
        setDashboards(ds);
      } catch (err) {
        if (ac.signal.aborted) return;
        console.error("DeveloperAnalyticsPage load error:", err);
        setError("Could not load analytics. Make sure the backend is reachable.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // Derived rows for each card
  const scorecard      = useMemo(() => aggregateScorecard(dashboards), [dashboards]);
  const priorityDrift  = useMemo(() => computePriorityDrift(tasks),    [tasks]);
  const projectShare   = useMemo(() => computeProjectShare(tasks),     [tasks]);
  const hoursByPrio    = useMemo(() => computeHoursByPriority(tasks),  [tasks]);
  const crossTrend     = useMemo(() => buildCrossProjectTrend(projects, dashboards), [projects, dashboards]);
  const overdueStats   = useMemo(() => computeOverdue(tasks),          [tasks]);

  return (
    <div className={`min-h-screen p-3 sm:p-6 ${darkMode ? "bg-slate-950" : "bg-background"}`}>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          My Analytics
        </h1>
        <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Personal performance across your projects — drift, distribution, momentum, and risk.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#c74634] text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Row 1: Overdue tiles full width */}
        <OverdueCard stats={overdueStats} loading={loading} darkMode={darkMode} />

        {/* Row 2: Scorecard table */}
        <SprintScorecardCard rows={scorecard} loading={loading} darkMode={darkMode} />

        {/* Row 3: two-up */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <EstimationAccuracyCard data={priorityDrift}   loading={loading} darkMode={darkMode} />
          <TasksByProjectCard     data={projectShare}    loading={loading} darkMode={darkMode} />
        </div>

        {/* Row 4: two-up */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <HoursByPriorityCard    data={hoursByPrio}     loading={loading} darkMode={darkMode} />
          <CrossProjectTrendCard  data={crossTrend.data} projectNames={crossTrend.projectNames} loading={loading} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}
