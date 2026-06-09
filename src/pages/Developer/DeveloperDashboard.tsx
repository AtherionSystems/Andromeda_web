import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { useAuth } from "../../contexts/auth";
import { getProjects, getProjectSprints } from "../../api/projects";
import { getSprintTasks } from "../../api/tasks";
import { getHealth } from "../../api/health";
import type { ApiTask } from "../../types/api";
import type { EnrichedTask } from "../../components/dashboard/types";
import { PRIORITY_ORDER } from "../../components/dashboard/types";
import Skeleton from "../../components/dashboard/Skeleton";
import CurrentObjectivesCard from "../../components/dashboard/CurrentObjectivesCard";
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

interface RawAssignee {
  userName: string | null;
  userId: number;
}

interface RawSprintTask extends ApiTask {
  assignees?: RawAssignee[];
}

interface SprintTaskEntry {
  sprintId: number;
  sprintName: string;
  tasks?: RawSprintTask[];
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

// ── Main dashboard ─────────────────────────────────────────────────────────────

function nameMatches(assigneeName: string | null | undefined, user: { name: string; username: string }): boolean {
  if (!assigneeName) return false;
  const a = assigneeName.trim().toLowerCase();
  return a === user.name.trim().toLowerCase() || a === user.username.trim().toLowerCase();
}

export default function DeveloperDashboard() {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [healthUp, setHealthUp]             = useState<boolean | null>(null);
  const [objectives, setObjectives]         = useState<EnrichedTask[]>([]);
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

  // ── Main load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();

    async function load(signal: AbortSignal) {
      setLoading(true);
      setError(null);
      try {
        const projectsRaw = await getProjects(signal);
        const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
        if (projects.length === 0) {
          setMyCounts({ todo: 0, in_progress: 0, review: 0, done: 0 });
          setHoursPerSprint([]);
          setTasksPerSprint([]);
          setObjectives([]);
          setSprintProgress([]);
          return;
        }

        // Get all sprints per project.
        const sprintResults = await Promise.allSettled(
          projects.map((p) => getProjectSprints(p.id)),
        );
        if (signal.aborted) return;

        // Build a flat list of (project, sprint) pairs.
        const sprintPairs = projects.flatMap((project, i) => {
          const res = sprintResults[i];
          if (res.status !== "fulfilled") return [];
          return res.value.map((sprint) => ({ project, sprint }));
        });

        // Fetch sprint tasks for each pair (includes assignees).
        const sprintTaskResults = await Promise.allSettled(
          sprintPairs.map(({ project, sprint }) =>
            getSprintTasks(project.id, sprint.id),
          ),
        );
        if (signal.aborted) return;

        // Aggregate per sprint.
        const hoursMap = new Map<string, SprintHourEntry>();
        const tasksMap = new Map<string, SprintPersonalEntry>();
        const myTasksAcrossAll: EnrichedTask[] = [];
        const sprintProgressMap = new Map<string, SprintProgressItem>();

        sprintPairs.forEach(({ project, sprint }, i) => {
          const res = sprintTaskResults[i];
          if (res.status !== "fulfilled") return;

          const raw = res.value as unknown as SprintTaskEntry[];
          const entries: SprintTaskEntry[] = Array.isArray(raw) && raw[0]?.tasks !== undefined
            ? raw
            : [{ sprintId: sprint.id, sprintName: sprint.name, tasks: res.value as RawSprintTask[] }];

          const allTasksInSprint: RawSprintTask[] = entries.flatMap((e) => e.tasks ?? []);

          // Active-sprint progress (overall, not just my tasks).
          if (sprint.status === "active" && allTasksInSprint.length > 0) {
            const key = `${project.name}::${sprint.name}`;
            sprintProgressMap.set(key, {
              projectName: project.name,
              sprintName: sprint.name,
              total: allTasksInSprint.length,
              done: allTasksInSprint.filter((t) => t.status === "done").length,
            });
          }

          // My tasks only.
          const mine = allTasksInSprint.filter((t) =>
            (t.assignees ?? []).some((a) => nameMatches(a.userName, user!)),
          );

          if (mine.length === 0) return;

          const estimated = mine.reduce((acc, t) => acc + (t.estimatedHours ?? 0), 0);
          const actual    = mine.reduce((acc, t) => acc + (t.actualHours ?? 0), 0);
          const completed = mine.filter((t) => t.status === "done").length;
          const velocity  = mine
            .filter((t) => t.status === "done")
            .reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);

          const existingHours = hoursMap.get(sprint.name);
          hoursMap.set(sprint.name, {
            sprintName: sprint.name,
            estimated: (existingHours?.estimated ?? 0) + estimated,
            actual:    (existingHours?.actual ?? 0) + actual,
          });

          const existingTasks = tasksMap.get(sprint.name);
          tasksMap.set(sprint.name, {
            sprintName: sprint.name,
            completed: (existingTasks?.completed ?? 0) + completed,
            velocity:  (existingTasks?.velocity ?? 0) + velocity,
          });

          for (const t of mine) {
            myTasksAcrossAll.push({ ...t, projectId: project.id, projectName: project.name });
          }
        });

        // Dedupe my tasks by id (a task may appear in multiple sprint entries).
        const seen = new Set<number>();
        const myTasks: EnrichedTask[] = myTasksAcrossAll.filter((t) => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });

        setMyCounts({
          todo:        myTasks.filter((t) => t.status === "todo").length,
          in_progress: myTasks.filter((t) => t.status === "in_progress").length,
          review:      myTasks.filter((t) => t.status === "review").length,
          done:        myTasks.filter((t) => t.status === "done").length,
        });

        setHoursPerSprint([...hoursMap.values()]);
        setTasksPerSprint([...tasksMap.values()]);
        setSprintProgress([...sprintProgressMap.values()]);

        setObjectives(
          myTasks
            .filter((t) => t.status !== "done")
            .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)),
        );
      } catch (err) {
        if (signal.aborted) return;
        console.error("DeveloperDashboard load error:", err);
        setError("Could not load the dashboard. Make sure the backend is running.");
      } finally {
        if (!signal.aborted) {
          setLoading(false);
          setSprintLoading(false);
        }
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
          <CurrentObjectivesCard loading={loading} darkMode={darkMode} objectives={objectives} />
        </div>

        <div className="flex flex-col gap-3.5">
          <UpcomingCard darkMode={darkMode} tasks={objectives} loading={loading} />
          <SprintProgressCard items={sprintProgress} loading={sprintLoading} darkMode={darkMode} />
          <SystemConfigCard healthUp={healthUp} />
        </div>
      </div>
    </div>
  );
}
