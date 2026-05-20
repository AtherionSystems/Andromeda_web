import { useEffect, useState } from "react";
import { useWindowSize } from "../../hooks/useWindowSize";
import { getProjects } from "../../api/projects";
import { getProjectMembers } from "../../api/members";
import type { ApiProject, ApiProjectMember } from "../../types/api";
import type { Member } from "../../types/project";
import ProjectCard from "./ProjectCard";

interface ProjectsPageProps {
  searchQuery: string;
  description?: string;
}

const AVATAR_COLORS = [
  "#4a3f7a",
  "#c74634",
  "#2a6a5a",
  "#7a4a2a",
  "#2a4a7a",
  "#6a2a4a",
];

function memberToAvatar(pm: ApiProjectMember): Member {
  const parts = pm.username.split(/[_.\-\s]+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : pm.username.slice(0, 2).toUpperCase();

  let hash = 0;
  for (const c of pm.username) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  const color = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];

  return { initials, color, name: pm.username };
}

function ProjectsPage({ searchQuery, description }: ProjectsPageProps) {
  const { breakpoint } = useWindowSize();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [memberMap, setMemberMap] = useState<Record<number, Member[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [allProjects, allMembers] = await Promise.all([
          getProjects(),
          getProjectMembers(),
        ]);
        setProjects(allProjects);

        const map: Record<number, Member[]> = {};
        allMembers.forEach((pm) => {
          if (!map[pm.projectId]) map[pm.projectId] = [];
          map[pm.projectId].push(memberToAvatar(pm));
        });
        setMemberMap(map);
      } catch {
        setError(
          "Could not load projects. Make sure the backend is running on port 8080."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1">
      {/* Header */}
      <div
        className={`flex gap-3 mb-5 ${
          breakpoint === "mobile"
            ? "flex-col"
            : "flex-row items-start justify-between"
        }`}
      >
        <div>
          <p className="text-[10px] tracking-[1.2px] uppercase text-oracle-muted mb-1">
            Current Active Projects
          </p>
          <h1 className="text-[22px] font-normal text-oracle-dark">
            My Projects
          </h1>
          <p className="text-[12px] text-oracle-muted mt-1 max-w-[420px] leading-relaxed">
            {description ??
              "Review and manage your current project portfolio, teams and key performance indicators for all active initiatives assigned to your department."}
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <button className="w-8 h-8 border-none rounded bg-oracle-red text-white cursor-pointer text-sm flex items-center justify-center">
            ✎
          </button>
          <button className="flex items-center gap-1.5 px-3.5 h-8 bg-oracle-red text-white border-none rounded text-[12px] font-medium cursor-pointer">
            + NEW PROJECT
          </button>
        </div>
      </div>

      {/* States */}
      {loading && (
        <p className="text-[#6a8a9a] text-sm">Loading projects…</p>
      )}

      {error && (
        <div className="px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#c74634] text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div
          className={`grid gap-4 ${
            breakpoint === "mobile"
              ? "grid-cols-1"
              : "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"
          }`}
        >
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              members={memberMap[project.id] ?? []}
              index={i}
            />
          ))}
          {filtered.length === 0 && !loading && (
            <p className="text-[#6a8a9a] text-sm col-span-full">
              No projects match your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
