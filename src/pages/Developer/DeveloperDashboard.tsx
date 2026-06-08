import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { getProjects, getProjectSprints } from "../../api/projects";
import { getProjectTasks, getSprintTasks } from "../../api/tasks";
import { getProjectMembers } from "../../api/members";
import { getHealth } from "../../api/health";
import type { ApiProjectMember, ApiTask } from "../../types/api";
import type { EnrichedTask, ProjectEffortData, ProjectGroup } from "../../components/dashboard/types";
import { PRIORITY_ORDER, memberStatus, initials } from "../../components/dashboard/types";
import Skeleton from "../../components/dashboard/Skeleton";
import SprintVelocityChart from "../../components/dashboard/SprintVelocityChart";
import TeamDistributionCard from "../../components/dashboard/TeamDistributionCard";
import CurrentObjectivesCard from "../../components/dashboard/CurrentObjectivesCard";
import UpcomingCard from "../../components/dashboard/UpcomingCard";
import SystemConfigCard from "../../components/dashboard/SystemConfigCard";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TaskStats {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

interface SprintProgressItem {
  projectName: string;
  sprintName: string;
  done: number;
  total: number;
}

// Sprint tasks endpoint returns this shape (same as BacklogPage)
interface SprintTaskEntry {
  sprintId: number;
  sprintName: string;
  tasks?: ApiTask[];
}

// ── Stats strip ────────────────────────────────────────────────────────────────

const STAT_CONFIG = [
  { key: "todo",        label: "To Do",      color: "#94a3b8", bg: "#f8fafc", darkBg: "#1e293b" },
  { key: "in_progress", label: "In Progress", color: "#f97316", bg: "#fff7ed", darkBg: "#1c1008" },
  { key: "review",      label: "In Review",   color: "#3b82f6", bg: "#eff6ff", darkBg: "#0d1c38" },
  { key: "done",        label: "Done",        color: "#22c55e", bg: "#f0fdf4", darkBg: "#0a1f10" },
] as const;

function StatsStrip({ stats, loading, darkMode }: { stats: TaskStats; loading: boolean; darkMode: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-3.5">
      {STAT_CONFIG.map(({ key, label, color, bg, darkBg }) => (
        <div
          key={key}
          className={`rounded-xl px-4 py-3.5 border flex flex-col gap-1 ${
            darkMode ? "border-slate-700" : "border-black/[0.06]"
          }`}
          style={{ background: darkMode ? darkBg : bg }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color }}
            >
              {label}
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: color }}
            />
          </div>
          {loading ? (
            <Skeleton w={40} h={28} darkMode={darkMode} />
          ) : (
            <span
              className="text-[28px] font-bold leading-none tracking-tight"
              style={{ color: darkMode ? "#f1f5f9" : "#1a3a4a" }}
            >
              {stats[key as keyof TaskStats]}
            </span>
          )}
          <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
            tasks across projects
          </span>
        </div>
      ))}
    </div>
  );
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

                {/* Progress bar */}
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

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [healthUp, setHealthUp]         = useState<boolean | null>(null);
  const [objectives, setObjectives]     = useState<EnrichedTask[]>([]);
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [effortData, setEffortData]     = useState<ProjectEffortData[]>([]);
  const [stats, setStats]               = useState<TaskStats>({ todo: 0, in_progress: 0, review: 0, done: 0 });
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

  // ── Main load: dashboard data + stats strip ────────────────────────────────
  useEffect(() => {
    const ac = new AbortController();

    async function load(signal: AbortSignal) {
      setLoading(true);
      setError(null);
      try {
        const projectsRaw = await getProjects(signal);
        const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
        if (projects.length === 0) return;

        const [taskResults, allMembers] = await Promise.all([
          Promise.allSettled(projects.map((p) => getProjectTasks(p.id, signal))),
          getProjectMembers(undefined, signal),
        ]);

        if (signal.aborted) return;

        const taskArrays: EnrichedTask[][] = taskResults.map((result, i) =>
          result.status === "fulfilled"
            ? result.value.map<EnrichedTask>((t) => ({
                ...t,
                projectId: projects[i].id,
                projectName: projects[i].name,
              }))
            : [],
        );
        const allTasks = taskArrays.flat();

        // Stats strip — sum across all projects
        setStats({
          todo:        allTasks.filter((t) => t.status === "todo").length,
          in_progress: allTasks.filter((t) => t.status === "in_progress").length,
          review:      allTasks.filter((t) => t.status === "review").length,
          done:        allTasks.filter((t) => t.status === "done").length,
        });

        const membersByProject = new Map<number, ApiProjectMember[]>();
        for (const m of allMembers) {
          const list = membersByProject.get(m.projectId);
          if (list) list.push(m);
          else membersByProject.set(m.projectId, [m]);
        }

        setObjectives(
          allTasks
            .filter((t) => t.status !== "done")
            .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)),
        );

        const groups: ProjectGroup[] = projects.map((p) => {
          const seen = new Set<number>();
          const members = (membersByProject.get(p.id) ?? [])
            .filter((m) => {
              if (seen.has(m.userId)) return false;
              seen.add(m.userId);
              return true;
            })
            .map((m, i) => ({
              userId:   m.userId,
              username: m.username,
              role:     m.role,
              status:   memberStatus(m.role, i),
              initials: initials(m.username),
            }));
          return { project: p, members };
        });
        setProjectGroups(groups.sort((a, b) => b.members.length - a.members.length));

        setEffortData(
          projects.map((p, pi) => {
            const tasks = taskArrays[pi];
            return {
              project:     p.name,
              todo:        tasks.filter((t) => t.status === "todo").length,
              in_progress: tasks.filter((t) => t.status === "in_progress").length,
              review:      tasks.filter((t) => t.status === "review").length,
              done:        tasks.filter((t) => t.status === "done").length,
            };
          }),
        );

        // Sprint progress — find active sprint per project, then get sprint tasks
        setSprintLoading(true);
        const sprintResults = await Promise.allSettled(
          projects.map((p) => getProjectSprints(p.id)),
        );

        if (signal.aborted) return;

        const activeSprintPairs = projects
          .map((p, i) => {
            const result = sprintResults[i];
            if (result.status !== "fulfilled") return null;
            const active = result.value.find((s) => s.status === "active");
            return active ? { project: p, sprint: active } : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);

        const sprintTaskResults = await Promise.allSettled(
          activeSprintPairs.map(({ project, sprint }) =>
            getSprintTasks(project.id, sprint.id),
          ),
        );

        if (signal.aborted) return;

        const progressItems: SprintProgressItem[] = activeSprintPairs
          .map(({ project, sprint }, i) => {
            const result = sprintTaskResults[i];
            if (result.status !== "fulfilled") return null;

            const raw = result.value as unknown as SprintTaskEntry[];
            const tasks: ApiTask[] = Array.isArray(raw) && raw[0]?.tasks !== undefined
              ? raw.flatMap((entry) => entry.tasks ?? [])
              : (result.value as ApiTask[]);

            return {
              projectName: project.name,
              sprintName:  sprint.name,
              total:       tasks.length,
              done:        tasks.filter((t) => t.status === "done").length,
            };
          })
          .filter((x): x is SprintProgressItem => x !== null && x.total > 0);

        setSprintProgress(progressItems);
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
  }, []);

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

      {/* Stats strip */}
      <StatsStrip stats={stats} loading={loading} darkMode={darkMode} />

      {/* Main two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-3.5 items-start">

        <div className="flex flex-col gap-3.5">
          <SprintVelocityChart darkMode={darkMode} data={effortData} loading={loading} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <TeamDistributionCard
              loading={loading}
              darkMode={darkMode}
              projectGroups={projectGroups}
            />
            <CurrentObjectivesCard
              loading={loading}
              darkMode={darkMode}
              objectives={objectives}
            />
          </div>
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
