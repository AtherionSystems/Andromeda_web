import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { getProjects } from "../../api/projects";
import { getProjectTasks } from "../../api/tasks";
import { getProjectMembers } from "../../api/members";
import { getHealth } from "../../api/health";
import type { ApiProjectMember } from "../../types/api";
import type { EnrichedTask, ProjectEffortData, ProjectGroup } from "../../components/dashboard/types";
import { PRIORITY_ORDER, memberStatus, initials } from "../../components/dashboard/types";
import Skeleton from "../../components/dashboard/Skeleton";
import SprintVelocityChart from "../../components/dashboard/SprintVelocityChart";
import TeamDistributionCard from "../../components/dashboard/TeamDistributionCard";
import CurrentObjectivesCard from "../../components/dashboard/CurrentObjectivesCard";
import UpcomingCard from "../../components/dashboard/UpcomingCard";
import SystemConfigCard from "../../components/dashboard/SystemConfigCard";

export default function DeveloperDashboard() {
  const { darkMode } = useTheme();
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [healthUp, setHealthUp]           = useState<boolean | null>(null);
  const [objectives, setObjectives]       = useState<EnrichedTask[]>([]);
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [effortData, setEffortData]       = useState<ProjectEffortData[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    getHealth(ac.signal).then((up) => {
      if (!ac.signal.aborted) setHealthUp(up);
    });
    return () => ac.abort();
  }, []);

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
      } catch (err) {
        if (signal.aborted) return;
        console.error("DeveloperDashboard load error:", err);
        setError("Could not load the dashboard. Make sure the backend is running.");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    load(ac.signal);
    return () => ac.abort();
  }, []);

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
          <SystemConfigCard healthUp={healthUp} />
        </div>
      </div>
    </div>
  );
}
