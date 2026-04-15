import React from "react";
import type { Project } from "../../types/project";
import ProjectCard from "./ProjectCard";
import { useWindowSize } from "../../hooks/useWindowSize";

interface ProjectsPageProps {
  projects: Project[];
  searchQuery: string;
  onNewProject?: () => void;
  onProjectClick?: (project: Project) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  searchQuery,
  onNewProject,
  onProjectClick,
}) => {
  const { breakpoint } = useWindowSize(); //
  // Filtrado case-insensitive por título o descripción
  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <main className="flex-1 px-6 py-5 overflow-y-auto">
      <div
        className={`flex gap-3 mb-5 ${breakpoint === "mobile" ? "flex-col" : "flex-row items-start justify-between"}`}
      >
        <div>
          <p className="text-[10px] tracking-[1.2px] uppercase text-oracle-muted mb-1">
            Current Active Projects
          </p>
          <h1 className="text-[22px] font-normal text-oracle-dark">
            My Projects
          </h1>
          <p className="text-[12px] text-oracle-muted mt-1 max-w-[420px] leading-relaxed">
            Review and manage your current project portfolio...
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <button className="w-8 h-8 border-none rounded bg-oracle-red text-white cursor-pointer text-sm flex items-center justify-center">
            ✎
          </button>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3.5 h-8 bg-oracle-red text-white border-none rounded text-[12px] font-medium cursor-pointer"
          >
            + NEW PROJECT
          </button>
        </div>
      </div>

      <div
        className={`grid gap-4 ${breakpoint === "mobile" ? "grid-cols-1" : "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"}`}
      >
        {filtered.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onClick={onProjectClick}
          />
        ))}
      </div>
    </main>
  );
};

export default ProjectsPage;
