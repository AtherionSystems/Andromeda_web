import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { useAuth } from "../../contexts/auth";
import { getHealth } from "../../api/health";
import {
  getMyDashboard,
  getMyTasks,
  getMyProjects,
  type ApiMeTask,
} from "../../api/me";
import { getProjectSprints } from "../../api/projects";
import { getSprintTasks } from "../../api/tasks";
import type { ApiProject, ApiTask } from "../../types/api";
import type { EnrichedTask } from "../../components/dashboard/types";
import { PRIORITY_ORDER } from "../../components/dashboard/types";
import Skeleton from "../../components/dashboard/Skeleton";
import UpcomingCard from "../../components/dashboard/UpcomingCard";
import SystemConfigCard from "../../components/dashboard/SystemConfigCard";
import MyTaskDistributionCard, {
  type MyTaskStatusCounts,
} from "../../components/dashboard/MyTaskDistributionCard";
import HoursPerSprintCard, {
  type SprintHourEntry,
} from "../../components/dashboard/HoursPerSprintCard";
import MyTasksPerSprintCard, {
  type SprintPersonalEntry,
} from "../../components/dashboard/MyTasksPerSprintCard";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SprintProgressItem {
  projectName: string;
  sprintName: string;
  done: number;
  total: number;
}

interface SprintTaskEntry {
  sprintId: number;
  sprintName: string;
  tasks?: ApiTask[];
}

const EMPTY_COUNTS: MyTaskStatusCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };

// Convert taskDistribution array → object indexed by status.
function distributionArrayToCounts(items: { status: string; total: number }[]): MyTaskStatusCounts {
  const out: MyTaskStatusCounts = { ...EMPTY_COUNTS };
  for (const item of items) {
    const key = item.status as keyof MyTaskStatusCounts;
    if (key in out) out[key] = item.total;
  }
  return out;
}

// ── Sprint progress card (kept) ────────────────────────────────────────────────

function SprintProgressCard({
  items,
  loading,
  darkMode,
}: {
  items: SprintProgressItem[];
  loading: boolean;
  darkMode: boolean;
}) {
  const cardClass = `rounded-xl border p-4 ${
    darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-black/[0.06]"
  }`;

  return (
    <div className={cardClass}>
      <p className={`text-[12px] font-bold uppercase tracking-[0.1em] mb-4 ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
        Active Sprint Progress
      </p>

      {loading && (
        <div className="flex flex-col gap-3.5">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton w={140} h={12} darkMode={darkMode} />
              <Skeleton w="100%" h={6} darkMode={darkMode} />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className={`text-[12px] text-center py-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          No active sprints found.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
            return (
              <div key={`${item.projectName}-${item.sprintName}`}>
                <div className="flex items-start justify-between mb-1 gap-2">
                  <div className="min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
                      {item.projectName}
                    </p>
                    <p className={`text-[10px] truncate ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                      {item.sprintName}
                    </p>
                  </div>
                  <span
                    className="text-[13px] font-bold shrink-0"
                    style={{ color: pct === 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#f97316" }}
                  >
                    {pct}%
                  </span>
                </div>

                <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#f97316",
                    }}
                  />
                </div>

                <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {item.done} of {item.total} tasks done
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Adapter: ApiMeTask → EnrichedTask for UpcomingCard ────────────────────────

function meTaskToEnriched(t: ApiMeTask): EnrichedTask {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    estimatedHours: t.estimatedHours,
    actualHours: t.actualHours,
    storyPoints: null,
    acceptanceCriteria: null,
    startDate: t.startDate,
    dueDate: t.dueDate,
    actualEnd: t.actualEnd,
    createdAt: t.startDate ?? "",
    projectId: 0,
    projectName: t.projectName,
  };
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

export default function DeveloperDashboard() {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const [healthUp, setHealthUp]             = useState<boolean | null>(null);
  const [projects, setProjects]             = useState<ApiProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [tasksLoading, setTasksLoading]     = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const [upcoming, setUpcoming]             = useState<EnrichedTask[]>([]);
  const [myCounts, setMyCounts]             = useState<MyTaskStatusCounts>(EMPTY_COUNTS);
  const [hoursPerSprint, setHoursPerSprint] = useState<SprintHourEntry[]>([]);
  const [tasksPerSprint, setTasksPerSprint] = useState<SprintPersonalEntry[]>([]);
  const [sprintProgress, setSprintProgress] = useState<SprintProgressItem[]>([]);
  const [sprintLoading, setSprintLoading]   = useState(true);
  const [debug, setDebug]                   = useState<{ raw: unknown; distSum: number; hoursLen: number; tasksLen: number } | null>(null);

  // ── Health probe ────────────────────────────────────────────────────────────
  useEffect(() => {
    const ac = new AbortController();
    getHealth(ac.signal).then((up) => {
      if (!ac.signal.aborted) setHealthUp(up);
    });
    return () => ac.abort();
  }, []);

  // ── Load my projects + my tasks (one-shot, no projectId dependency) ─────────
  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();

    async function load(signal: AbortSignal) {
      setProjectsLoading(true);
      setTasksLoading(true);
      setError(null);
      try {
        const [projectsRes, tasksRes] = await Promise.allSettled([
          getMyProjects(signal),
          getMyTasks(undefined, signal),
        ]);

        if (signal.aborted) return;

        if (projectsRes.status === "fulfilled") {
          setProjects(projectsRes.value);
          if (projectsRes.value.length > 0) {
            setSelectedProjectId((curr) => curr ?? projectsRes.value[0].id);
          }
          loadSprintProgress(projectsRes.value, signal).catch((err) => {
            if (!signal.aborted) console.error("Sprint progress failed:", err);
          });
        } else {
          console.error("getMyProjects failed:", projectsRes.reason);
          setSprintLoading(false);
        }

        if (tasksRes.status === "fulfilled") {
          const open = tasksRes.value
            .filter((t) => t.status !== "done")
            .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4))
            .map(meTaskToEnriched);
          setUpcoming(open);
        } else {
          console.error("getMyTasks failed:", tasksRes.reason);
        }
      } catch (err) {
        if (signal.aborted) return;
        console.error("Dashboard load error:", err);
        setError("Could not load the dashboard. Make sure the backend is running.");
      } finally {
        if (!signal.aborted) {
          setProjectsLoading(false);
          setTasksLoading(false);
        }
      }
    }

    async function loadSprintProgress(
      list: ApiProject[],
      signal: AbortSignal,
    ) {
      setSprintLoading(true);
      try {
        const sprintLists = await Promise.allSettled(
          list.map((p) => getProjectSprints(p.id)),
        );
        if (signal.aborted) return;

        const activePairs = list
          .map((project, i) => {
            const r = sprintLists[i];
            if (r.status !== "fulfilled") return null;
            const active = r.value.find((s) => s.status === "active");
            return active ? { project, sprint: active } : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);

        const sprintTaskResults = await Promise.allSettled(
          activePairs.map(({ project, sprint }) =>
            getSprintTasks(project.id, sprint.id),
          ),
        );
        if (signal.aborted) return;

        const items: SprintProgressItem[] = activePairs
          .map(({ project, sprint }, i) => {
            const r = sprintTaskResults[i];
            if (r.status !== "fulfilled") return null;
            const raw = r.value as unknown as SprintTaskEntry[];
            const tasks: ApiTask[] =
              Array.isArray(raw) && raw[0]?.tasks !== undefined
                ? raw.flatMap((e) => e.tasks ?? [])
                : (r.value as ApiTask[]);
            return {
              projectName: project.name,
              sprintName: sprint.name,
              total: tasks.length,
              done:  tasks.filter((t) => t.status === "done").length,
            };
          })
          .filter((x): x is SprintProgressItem => x !== null && x.total > 0);

        setSprintProgress(items);
      } finally {
        if (!signal.aborted) setSprintLoading(false);
      }
    }

    load(ac.signal);
    return () => ac.abort();
  }, [user]);

  // ── Load /api/me/dashboard whenever selectedProjectId changes ───────────────
  useEffect(() => {
    if (selectedProjectId == null) return;
    const ac = new AbortController();

    async function load(projectId: number, signal: AbortSignal) {
      setDashboardLoading(true);
      try {
        const d = await getMyDashboard(projectId, signal);
        if (signal.aborted) return;

        // Log so we can compare against the assumed shape.
        console.log("[/api/me/dashboard] raw response:", d);

        const dist = d.taskDistribution ?? [];
        const hours = d.myHoursPerSprint ?? [];
        const tasks = d.myTasksPerSprint ?? [];

        setMyCounts(distributionArrayToCounts(dist));
        setHoursPerSprint(
          hours.map((h) => ({
            sprintName: h.sprintName,
            estimated: h.estimatedHours,
            actual: h.actualHours,
          })),
        );
        setTasksPerSprint(
          tasks.map((t) => ({
            sprintName: t.sprintName,
            completed: t.tasksCompleted,
          })),
        );

        setDebug({
          raw: d,
          distSum: Array.isArray(dist) ? dist.reduce((acc, x) => acc + (x.total ?? 0), 0) : -1,
          hoursLen: Array.isArray(hours) ? hours.length : -1,
          tasksLen: Array.isArray(tasks) ? tasks.length : -1,
        });
      } catch (err) {
        if (signal.aborted) return;
        console.error("getMyDashboard failed:", err);
        setMyCounts(EMPTY_COUNTS);
        setHoursPerSprint([]);
        setTasksPerSprint([]);
        setDebug({ raw: { error: String(err) }, distSum: -1, hoursLen: -1, tasksLen: -1 });
      } finally {
        if (!signal.aborted) setDashboardLoading(false);
      }
    }

    load(selectedProjectId, ac.signal);
    return () => ac.abort();
  }, [selectedProjectId]);

  const overallLoading = projectsLoading || tasksLoading;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pb-6">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <h1 className={`text-2xl font-bold italic tracking-tight ${darkMode ? "text-slate-200" : "text-gray-900"}`}>
          {overallLoading ? <Skeleton w={320} h={28} darkMode={darkMode} /> : "Developer's View"}
        </h1>

        {/* Project selector — feeds /api/me/dashboard */}
        {projects.length > 0 && (
          <div className="flex flex-col">
            <label className={`mb-1 text-[10px] font-bold uppercase tracking-[0.12em] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Dashboard project
            </label>
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className={`rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-[#c74634] ${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#c74634] text-sm">
          {error}
        </div>
      )}

      {!projectsLoading && projects.length === 0 && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-[12px] ${darkMode ? "bg-slate-800 border border-slate-700 text-slate-300" : "bg-[#fff8e1] border border-[#ffd97a] text-[#7a5a00]"}`}>
          You aren't a member of any projects yet. Ask a project owner to add you.
        </div>
      )}

      {!dashboardLoading && debug && (debug.distSum === 0 && debug.hoursLen === 0 && debug.tasksLen === 0) && (
        <details className={`mb-4 px-4 py-3 rounded-lg text-[12px] ${darkMode ? "bg-slate-800 border border-slate-700 text-slate-300" : "bg-[#fff8e1] border border-[#ffd97a] text-[#7a5a00]"}`}>
          <summary className="cursor-pointer font-semibold">
            Dashboard response was empty for project #{selectedProjectId} — click to see raw JSON
          </summary>
          <div className="mt-2 space-y-1">
            <p>distribution total: <b>{debug.distSum}</b> · hours rows: <b>{debug.hoursLen}</b> · tasks rows: <b>{debug.tasksLen}</b></p>
            <p>If all are 0, the backend has no sprint/assignment data for you in this project.</p>
            <p>If the numbers look right but charts still empty, the field names probably differ from <code>taskDistribution / myHoursPerSprint / myTasksPerSprint</code>.</p>
            <pre className={`mt-2 max-h-60 overflow-auto rounded p-2 text-[10px] ${darkMode ? "bg-slate-900" : "bg-white"}`}>
              {JSON.stringify(debug.raw, null, 2)}
            </pre>
          </div>
        </details>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-3.5 items-start">
        <div className="flex flex-col gap-3.5">
          <MyTaskDistributionCard darkMode={darkMode} loading={dashboardLoading} counts={myCounts} />
          <HoursPerSprintCard    darkMode={darkMode} loading={dashboardLoading} data={hoursPerSprint} />
          <MyTasksPerSprintCard  darkMode={darkMode} loading={dashboardLoading} data={tasksPerSprint} />
        </div>

        <div className="flex flex-col gap-3.5">
          <UpcomingCard       darkMode={darkMode} tasks={upcoming} loading={tasksLoading} />
          <SprintProgressCard items={sprintProgress} loading={sprintLoading} darkMode={darkMode} />
          <SystemConfigCard   healthUp={healthUp} />
        </div>
      </div>
    </div>
  );
}
