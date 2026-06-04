import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { getProjects } from "../../api/projects";
import { getProjectTasks } from "../../api/tasks";
import { getProjectMembers } from "../../api/members";
import type { EnrichedTask, ProjectEffortData, ProjectGroup } from "../../components/dashboard/types";
import { PRIORITY_ORDER, memberStatus, initials } from "../../components/dashboard/types";
import Skeleton from "../../components/dashboard/Skeleton";
import SprintVelocityChart from "../../components/dashboard/SprintVelocityChart";
import TeamDistributionCard from "../../components/dashboard/TeamDistributionCard";
import CurrentObjectivesCard from "../../components/dashboard/CurrentObjectivesCard";
import UpcomingCard from "../../components/dashboard/UpcomingCard";
import SystemConfigCard from "../../components/dashboard/SystemConfigCard";

interface HealthResponse {
  status?: string;
}

export default function PODashboard() {
  const { darkMode } = useTheme();
  const [loading, setLoading]             = useState(true);
  const [healthUp, setHealthUp]           = useState<boolean | null>(null);
  const [objectives, setObjectives]       = useState<EnrichedTask[]>([]);
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [effortData, setEffortData]       = useState<ProjectEffortData[]>([]);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/health");
        if (res.status === 403 || !res.ok) { setHealthUp(true); return; }
        const data = (await res.json()) as HealthResponse | null;
        if (!data || typeof data.status !== "string") { setHealthUp(true); return; }
        setHealthUp(data.status.toUpperCase() === "UP");
      } catch {
        setHealthUp(false);
      }
    }
    checkHealth();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const _projects = await getProjects();
        const projects = Array.isArray(_projects) ? _projects : [];
        if (projects.length === 0) return;

        const [taskArrays, memberArrays] = await Promise.all([
          Promise.all(
            projects.map(async (p) => {
              const tasks = await getProjectTasks(p.id);
              return tasks.map<EnrichedTask>((t) => ({
                ...t,
                projectId: p.id,
                projectName: p.name,
              }));
            })
          ),
          Promise.all(projects.map((p) => getProjectMembers({ projectId: p.id }))),
        ]);

        const allTasks = taskArrays.flat();

        // Open tasks sorted by priority across all projects
        setObjectives(
          allTasks
            .filter((t) => t.status !== "done")
            .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4))
        );

        // Per-project groups for TeamDistributionCard
        const groups: ProjectGroup[] = projects.map((p, pi) => {
          const seen = new Set<number>();
          const members = memberArrays[pi]
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

        // Effort data per project for the stacked bar chart
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
          })
        );
      } catch (err) {
        console.error("PODashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="pb-6">
      <h1 className={`mb-5 text-2xl font-bold italic tracking-tight ${darkMode ? "text-slate-200" : "text-gray-900"}`}>
        {loading ? <Skeleton w={320} h={28} darkMode={darkMode} /> : "Projects Overview"}
      </h1>

      {/* Main two-column grid: stacks on mobile, side-by-side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-3.5 items-start">

        {/* Left column: chart + two cards */}
        <div className="flex flex-col gap-3.5">
          <SprintVelocityChart darkMode={darkMode} data={effortData} loading={loading} />

          {/* Bottom cards: stack on mobile, side-by-side on md+ */}
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

        {/* Right column: upcoming + system config */}
        <div className="flex flex-col gap-3.5">
          <UpcomingCard darkMode={darkMode} tasks={objectives} loading={loading} />
          <SystemConfigCard healthUp={healthUp} />
        </div>
      </div>
    </div>
  );
}
