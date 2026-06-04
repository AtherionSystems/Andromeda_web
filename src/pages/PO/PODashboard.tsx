import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { getProjects } from "../../api/projects";
import { getProjectTasks } from "../../api/tasks";
import { getProjectMembers } from "../../api/members";
import type { EnrichedTask, ProjectEffortData, ProjectGroup } from "../../components/dashboard/types";
import { PRIORITY_ORDER, memberStatus, initials } from "../../components/dashboard/types";
import Skeleton from "../../components/dashboard/Skeleton";
import SprintVelocityChart from "../../components/dashboard/SprintVelocityChart";
import KpiCards from "../../components/dashboard/KpiCards";
import TeamDistributionCard from "../../components/dashboard/TeamDistributionCard";
import CurrentObjectivesCard from "../../components/dashboard/CurrentObjectivesCard";
import UpcomingCard from "../../components/dashboard/UpcomingCard";

interface HealthResponse {
  status?: string;
}

export default function PODashboard() {
  const { darkMode } = useTheme();
  const [loading, setLoading]             = useState(true);
  const [healthUp, setHealthUp]           = useState<boolean | null>(null);
  const [completionPct, setCompletionPct] = useState(0);
  const [activeBlocks, setActiveBlocks]   = useState(0);
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

        // Load tasks and members for ALL projects in parallel
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

        // Global KPIs
        const done = allTasks.filter((t) => t.status === "done").length;
        setCompletionPct(allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0);
        setActiveBlocks(allTasks.filter((t) => t.priority === "critical" && t.status !== "done").length);

        // Open tasks sorted by priority across all projects
        setObjectives(
          allTasks
            .filter((t) => t.status !== "done")
            .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4))
        );

        // Build per-project groups for TeamDistributionCard
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
    <div style={{ paddingBottom: 24 }}>
      <h1 style={{
        margin: "0 0 20px",
        fontSize: 24, fontWeight: 700, fontStyle: "italic",
        color: darkMode ? "#e2e8f0" : "#111827", letterSpacing: -0.5,
      }}>
        {loading ? <Skeleton w={320} h={28} darkMode={darkMode} /> : "Projects Overview"}
      </h1>

      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 14, marginBottom: 14 }}>
        <SprintVelocityChart darkMode={darkMode} data={effortData} loading={loading} />
        <KpiCards
          loading={loading}
          darkMode={darkMode}
          completionPct={completionPct}
          activeBlocks={activeBlocks}
        />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 14 }}>
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
        <UpcomingCard darkMode={darkMode} healthUp={healthUp} />
      </div>
    </div>
  );
}
