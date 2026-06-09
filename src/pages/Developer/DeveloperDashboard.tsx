import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { useAuth } from "../../contexts/auth";
import { getHealth } from "../../api/health";
import { getMyDashboard, getMyTasks, getMyProjects } from "../../api/me";
import { getProjectSprints } from "../../api/projects";
import { getSprintTasks } from "../../api/tasks";
import type { ApiTask } from "../../types/api";
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

// ── Sprint progress card ───────────────────────────────────────────────────────

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

// ── Main dashboard ─────────────────────────────────────────────────────────────

export default function DeveloperDashboard() {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [healthUp, setHealthUp]             = useState<boolean | null>(null);
  const [upcoming, setUpcoming]             = useState<EnrichedTask[]>([]);
  const [myCounts, setMyCounts]             = useState<MyTaskStatusCounts>({ todo: 0, in_progress: 0, review: 0, done: 0 });
  const [hoursPerSprint, setHoursPerSprint] = useState<SprintHourEntry[]>([]);
  const [tasksPerSprint, setTasksPerSprint] = useState<SprintPersonalEntry[]>([]);
  const [sprintProgress, setSprintProgress] = useState<SprintProgressItem[]>([]);
  const [sprintLoading, setSprintLoading]   = useState(true);

  // ── Health probe ────────────────────────────────────────────────────────────
  useEffect(() => {
    const ac = new AbortController();
    getHealth(ac.signal).then((up) => {
      if (!ac.signal.aborted) setHealthUp(up);
    });
    return () => ac.abort();
  }, []);

  // ── Main load: personal dashboard ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();

    async function load(signal: AbortSignal) {
      setLoading(true);
      setError(null);
      try {
        // Fire the three personal endpoints in parallel.
        const [dashboardRes, tasksRes, projectsRes] = await Promise.allSettled([
          getMyDashboard(undefined, signal),
          getMyTasks(undefined, signal),
          getMyProjects(signal),
        ]);

        if (signal.aborted) return;

        // 1. Dashboard (3 charts)
        if (dashboardRes.status === "fulfilled") {
          const d = dashboardRes.value;
          setMyCounts(d.taskDistribution);
          setHoursPerSprint(
            d.hoursPerSprint.map((h) => ({
              sprintName: h.sprintName,
              estimated: h.estimatedHours,
              actual:    h.actualHours,
            })),
          );
          setTasksPerSprint(
            d.tasksPerSprint.map((t) => ({
              sprintName: t.sprintName,
              completed:  t.tasksCompleted,
              velocity:   t.storyPoints,
            })),
          );
        } else {
          console.error("getMyDashboard failed:", dashboardRes.reason);
        }

        // 2. Upcoming tasks (open ones, sorted by priority)
        if (tasksRes.status === "fulfilled") {
          const open = tasksRes.value
            .filter((t) => t.status !== "done")
            .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4))
            .map<EnrichedTask>((t) => ({
              ...t,
              projectId: t.projectId ?? 0,
              projectName: t.projectName ?? "",
            }));
          setUpcoming(open);
        } else {
          console.error("getMyTasks failed:", tasksRes.reason);
        }

        // 3. Active sprint progress — derived from my projects only.
        if (projectsRes.status === "fulfilled") {
          loadSprintProgress(projectsRes.value, signal).catch((err) => {
            if (!signal.aborted) console.error("Sprint progress load failed:", err);
          });
        } else {
          console.error("getMyProjects failed:", projectsRes.reason);
          setSprintLoading(false);
        }
      } catch (err) {
        if (signal.aborted) return;
        console.error("DeveloperDashboard load error:", err);
        setError("Could not load the dashboard. Make sure the backend is running.");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    async function loadSprintProgress(
      projects: { id: number; name: string }[],
      signal: AbortSignal,
    ) {
      setSprintLoading(true);
      try {
        const sprintLists = await Promise.allSettled(
          projects.map((p) => getProjectSprints(p.id)),
        );
        if (signal.aborted) return;

        const activePairs = projects
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pb-6">
      <h1 className={`mb-5 text-2xl font-bold italic tracking-tight ${darkMode ? "text-slate-200" : "text-gray-900"}`}>
        {loading ? <Skeleton w={320} h={28} darkMode={darkMode} /> : "Developer's View"}
      </h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#c74634] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-3.5 items-start">
        <div className="flex flex-col gap-3.5">
          <MyTaskDistributionCard darkMode={darkMode} loading={loading} counts={myCounts} />
          <HoursPerSprintCard darkMode={darkMode} loading={loading} data={hoursPerSprint} />
          <MyTasksPerSprintCard darkMode={darkMode} loading={loading} data={tasksPerSprint} />
        </div>

        <div className="flex flex-col gap-3.5">
          <UpcomingCard darkMode={darkMode} tasks={upcoming} loading={loading} />
          <SprintProgressCard items={sprintProgress} loading={sprintLoading} darkMode={darkMode} />
          <SystemConfigCard healthUp={healthUp} />
        </div>
      </div>
    </div>
  );
}
