import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowSize } from "../../hooks/useWindowSize";
import { getProjects, deleteProject, getProjectSprints } from "../../api/projects";
import { getProjectMembers } from "../../api/members";
import { getProjectTasks } from "../../api/tasks";
import { getCapabilities } from "../../api/capabilities";
import type { ApiProject, ApiProjectMember } from "../../types/api";
import type { Member } from "../../types/project";
import ProjectCard from "./ProjectCard";
import NewProjectModal from "./EntryPointProjects/NewProjectModal";
import SearchInput from "./SearchInput";
import EmptyProjectScreen from "./EmptyProjectScreen";
import EditProjectModal from "./EditProjectModal";
import ProjectArchitectureScreen from "./CapabilityPage";
import SprintsPage from "./Sprint/SprintsPage";
import ProjectEntryModal from "./EntryPointProjects/ProjectEntryModal";

// prueba de projects en producción
interface ProjectsPageProps {
  description?: string;
  readOnly?: boolean;
  onViewTasks?: (projectId: number) => void;
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

function ProjectsPage({ description, readOnly = false }: ProjectsPageProps) {
  const { breakpoint } = useWindowSize();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [memberMap, setMemberMap] = useState<Record<number, Member[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emptyProject, setEmptyProject] = useState<ApiProject | null>(null);
  const [architectureProject, setArchitectureProject] = useState<ApiProject | null>(null);
  const [sprintsProject, setSprintsProject] = useState<ApiProject | null>(null);
  const [entryProject, setEntryProject] = useState<ApiProject | null>(null);
  const [editProject, setEditProject] = useState<ApiProject | null>(null);
  const hasFetched = useRef(false);

  // Open a project: only show the empty-state screen when it is truly empty —
  // no members, no tasks, no capabilities AND no sprints. The moment it has
  // anything (even just a sprint, or just a capability), show the chooser
  // (Capabilities / Sprints) so the user can land on either view.
  async function handleOpen(project: ApiProject) {
    const members = memberMap[project.id] ?? [];
    if (members.length === 0) {
      try {
        const [tasks, capabilities, sprints] = await Promise.all([
          getProjectTasks(project.id),
          getCapabilities(project.id),
          getProjectSprints(project.id),
        ]);
        if (
          tasks.length === 0 &&
          capabilities.length === 0 &&
          sprints.length === 0
        ) {
          setEmptyProject(project);
          return;
        }
      } catch {
        // If we can't confirm, still show the chooser.
      }
    }
    setEntryProject(project);
  }

  async function handleDelete(project: ApiProject) {
    try {
      await deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch {
      setError(`Could not delete "${project.name}". Please try again.`);
    }
  }

  const load = useCallback(async () => {
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
      setError("Could not load projects. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    load();
  }, [load]);

  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q)
    );
  });

  if (architectureProject) {
    return (
      <div className="flex-1 px-6 pt-3 pb-4">
        <ProjectArchitectureScreen
          project={architectureProject}
          onClose={() => setArchitectureProject(null)}
        />
      </div>
    );
  }

  if (sprintsProject) {
    return (
      <div className="flex-1 px-6 pt-3 pb-4">
        <SprintsPage
          project={sprintsProject}
          onClose={() => setSprintsProject(null)}
        />
      </div>
    );
  }

  if (emptyProject) {
    return (
      <div className="flex-1 px-6 pt-3 pb-4">
        <EmptyProjectScreen
          project={emptyProject}
          onClose={() => setEmptyProject(null)}
          onAddCapabilities={() => {
            setArchitectureProject(emptyProject);
            setEmptyProject(null);
          }}
          onAddSprints={() => {
            setSprintsProject(emptyProject);
            setEmptyProject(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 pt-3 pb-4">
      {/* Header */}
      <div
        className={`flex gap-3 mb-8 ${
          breakpoint === "mobile"
            ? "flex-col"
            : "flex-row items-start justify-between"
        }`}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Projects
          </h1>
          <p className="text-[12px] text-oracle-muted mt-1 max-w-[420px] leading-relaxed">
            {description ??
              "Review and manage your current project portfolio, teams and key performance indicators for all active initiatives assigned to your department."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 mt-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            inputClassName="w-[260px] text-[13px]"
          />
          {!readOnly && (
            <div className="flex gap-2">
              <button
                style={{ background: "#c74634" }}
                className="flex items-center gap-1.5 px-3.5 h-8 bg-oracle-red text-white border-none rounded text-[12px] font-medium cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                + NEW PROJECT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="flex flex-col items-center gap-4">
            <img
              src="/Andromeda_web/Media/Animations/RedGearGIF.gif"
              alt="Loading animation"
              className="h-28 w-28 object-contain"
            />
            <p className="text-sm font-semibold tracking-wide text-[#C74634]">
              Loading Projects...
            </p>
          </div>
        </div>
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
              onDelete={readOnly ? undefined : handleDelete}
              onEdit={readOnly ? undefined : () => setEditProject(project)}
              onViewTasks={() => handleOpen(project)}
            />
          ))}
          {filtered.length === 0 && !loading && (
            <p className="text-[#6a8a9a] text-sm col-span-full">
              No projects match your search.
            </p>
          )}
        </div>
      )}
      <NewProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          hasFetched.current = false;
          load();
        }}
      />
      {entryProject && (
        <ProjectEntryModal
          project={entryProject}
          onClose={() => setEntryProject(null)}
          onSelectCapabilities={() => {
            setArchitectureProject(entryProject);
            setEntryProject(null);
          }}
          onSelectSprints={() => {
            setSprintsProject(entryProject);
            setEntryProject(null);
          }}
        />
      )}
      {editProject && (
        <EditProjectModal
          project={editProject}
          members={memberMap[editProject.id] ?? []}
          index={Math.max(0, filtered.findIndex((p) => p.id === editProject.id))}
          onClose={() => setEditProject(null)}
          onSaved={(updated) => {
            setProjects((prev) =>
              prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
            );
            setEditProject(null);
          }}
        />
      )}
    </div>
  );
}

export default ProjectsPage;
