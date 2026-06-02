import { useState, useEffect, useContext } from "react";
import BacklogColumn from "../../components/Backlog/BacklogColumn";
import type { ApiProject, ApiTask, ApiSprint } from "../../types/api";
import type { Member } from "../../types/project";
import { getProjects, getProjectSprints } from "../../api/projects";
import {
  getProjectTasks,
  getTaskAssignments,
  getSprintTasks,
} from "../../api/tasks";
import MemberAvatars from "../Projects/MemberAvatars";
import { ThemeContext } from "../../contexts/themeContextValue";

interface RawAssignee {
  userName: string | null;
  userId: number;
}

interface RawTaskWithAssignees extends ApiTask {
  assignees?: RawAssignee[];
}

interface SprintTaskEntry {
  sprintId: number;
  sprintName: string;
  tasks?: RawTaskWithAssignees[];
}

const AVATAR_COLORS = [
  "#4a3f7a",
  "#2a6a5a",
  "#c74634",
  "#d97706",
  "#2a4a7a",
  "#6a2a4a",
];
const PRIORITY_COLORS: Record<string, string> = {
  critical: "#C74634",
  high: "#FFB13F",
  medium: "#00688C",
  low: "#8FBFD0",
};

function memberInitials(username: string): string {
  const parts = username.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function BacklogPage() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [sprints, setSprints] = useState<ApiSprint[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">(
    "all",
  );
  const [selectedSprintId, setSelectedSprintId] = useState<number | "all">(
    "all",
  );
  const [taskAssignments, setTaskAssignments] = useState<
    Record<number, Member[]>
  >({});
  const theme = useContext(ThemeContext);
  const darkMode = theme?.darkMode ?? false;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError(null);

        const projects = await getProjects();
        setProjects(projects);
        const taskArrays = await Promise.all(
          projects.map(async (project) => {
            const projectTasks = await getProjectTasks(project.id);
            return projectTasks.map((task) => ({
              ...task,
              projectId: project.id,
              projectName: project.name,
            }));
          }),
        );

        const allTasks = taskArrays.flat();
        setTasks(allTasks);

        const assignmentMap: Record<number, Member[]> = {};

        const taskAssignmentsPairs = await Promise.all(
          allTasks.map(async (task) => {
            if (task.projectId == null)
              return [task.id, [] as Member[]] as const;
            const assignments = await getTaskAssignments(
              task.projectId,
              task.id,
            );
            const members: Member[] = assignments
              .filter((assignment) => assignment.assignedUserName != null)
              .map((assignment) => ({
                initials: memberInitials(assignment.assignedUserName!),
                color: AVATAR_COLORS[assignment.id % AVATAR_COLORS.length],
                name: assignment.assignedUserName!,
              }));
            return [task.id, members] as const;
          }),
        );

        for (const [taskId, members] of taskAssignmentsPairs) {
          assignmentMap[taskId] = members;
        }

        setTaskAssignments(assignmentMap);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Unable to load backlog tasks right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Fetch de Sprints
  useEffect(() => {
    if (selectedProjectId === "all") {
      setSprints([]);
      setSelectedSprintId("all");
      return;
    }

    const fetchSprints = async () => {
      setLoadingSprints(true);
      setSelectedSprintId("all");
      try {
        const projectSprints = await getProjectSprints(selectedProjectId);
        setSprints(projectSprints);
      } catch (err) {
        console.error("Error fetching sprints:", err);
        setSprints([]);
      } finally {
        setLoadingSprints(false);
      }
    };

    fetchSprints();
  }, [selectedProjectId]);

  // Fetch a Sprint Tasks
  useEffect(() => {
    if (selectedProjectId === "all") return;

    // regresa tasks originales completas
    if (selectedSprintId === "all") {
      const restoreProjectTasks = async () => {
        setLoadingSprints(true);
        try {
          const projectTasks = await getProjectTasks(
            selectedProjectId as number,
          );
          const projectName = projects.find(
            (p) => p.id === selectedProjectId,
          )?.name;
          const enrichedTasks = projectTasks.map((task) => ({
            ...task,
            projectId: selectedProjectId as number,
            projectName,
          }));
          setTasks((prev) => [
            ...prev.filter((t) => t.projectId !== selectedProjectId),
            ...enrichedTasks,
          ]);
        } catch (err) {
          console.error("Error restoring project tasks:", err);
        } finally {
          setLoadingSprints(false);
        }
      };
      restoreProjectTasks();
      return;
    }

    //Fetch a los sprint tasks especificos
    const fetchSprintTasks = async () => {
      setLoadingSprints(true);
      try {
        const sprintTasks = await getSprintTasks(
          selectedProjectId as number,
          selectedSprintId as number,
        );

        const projectName = projects.find(
          (p) => p.id === selectedProjectId,
        )?.name;
        const enrichedTasks: ApiTask[] = (sprintTasks as SprintTaskEntry[]).flatMap(
          (entry) =>
            (entry.tasks ?? []).map((task) => ({
              ...task,
              projectId: selectedProjectId as number,
              projectName,
              sprintId: entry.sprintId,
              sprintName: entry.sprintName,
            })),
        );

        // Reemplaza tasks del proyecto actual, conserva las de otros proyectos
        setTasks((prev) => [
          ...prev.filter((t) => t.projectId !== selectedProjectId),
          ...enrichedTasks,
        ]);

        // Fetch assignments para las nuevas tasks
        const assignmentMap: Record<number, Member[]> = {};
        for (const task of enrichedTasks) {
          const assignees = (task as RawTaskWithAssignees).assignees ?? [];
          assignmentMap[task.id] = assignees
            .filter((a): a is RawAssignee & { userName: string } => a.userName != null)
            .map((a) => ({
              initials: memberInitials(a.userName),
              color: AVATAR_COLORS[a.userId % AVATAR_COLORS.length],
              name: a.userName,
            }));
        }

        setTaskAssignments((prev) => ({ ...prev, ...assignmentMap }));
      } catch (err) {
        console.error("Error fetching sprint tasks:", err);
      } finally {
        setLoadingSprints(false);
      }
    };

    fetchSprintTasks();
  }, [selectedSprintId, selectedProjectId, projects]);

  useEffect(() => {
    if (!selectedTask) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedTask(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedTask]);

  useEffect(() => {
    // Close any open task detail when theme changes so the modal updates cleanly
    setSelectedTask(null);
  }, [darkMode]);

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/Media/Animations/RedGearGIF.gif"
            alt="Loading animation"
            className="h-28 w-28 object-contain"
          />
          <p className="text-sm font-semibold tracking-wide text-[#C74634]">
            Loading Backlog...
          </p>
        </div>
      </div>
    );

  if (error) {
    return (
      <div className="p-10 text-slate-500 dark:text-slate-300">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-100">
          Backlog unavailable
        </p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  // Filters
  const projectScopedTasks =
    selectedProjectId === "all"
      ? tasks
      : tasks.filter((task) => task.projectId === selectedProjectId);

  const visibleTasks =
    selectedSprintId === "all" ? projectScopedTasks : projectScopedTasks;

  const visibleTaskCount = visibleTasks.length;
  const selectedMembers = selectedTask
    ? (taskAssignments[selectedTask.id] ?? [])
    : [];

  const selectedSprintName =
    selectedSprintId === "all"
      ? "All Sprints"
      : (sprints.find((s) => s.id === selectedSprintId)?.name ?? "All Sprints");

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${darkMode ? "bg-slate-900" : "bg-white"}`}
    >
      <div className="px-8 pt-6 pb-1">
        <div
          className={`rounded-2xl px-5 py-4 ${darkMode ? "bg-slate-900" : "bg-white"}`}
        >
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex flex-col items-start">
              <h2
                className={`text-2xl font-semibold italic ${darkMode ? "text-slate-100" : "text-slate-900"}`}
              >
                Backlog
              </h2>
              <p
                className={`mt-2 text-[18px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {visibleTaskCount} tasks
              </p>
            </div>

            <div className="flex min-w-[320px] flex-col gap-3 text-right sm:flex-row sm:items-end sm:gap-4">
              <div className="flex-1">
                <label
                  className={`mb-2 block text-left text-[11px] font-semibold uppercase tracking-wide ${darkMode ? "text-slate-300" : "text-slate-500"}`}
                >
                  Filter by project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(event) => {
                    const value =
                      event.target.value === "all"
                        ? "all"
                        : Number(event.target.value);
                    setSelectedProjectId(value);
                    setSelectedSprintId("all");
                    setSelectedTask(null);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-[#c74634] ${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label
                  className={`mb-2 block text-left text-[11px] font-semibold uppercase tracking-wide ${darkMode ? "text-slate-300" : "text-slate-500"}`}
                >
                  Filter by sprint
                </label>
                <select
                  value={selectedSprintId}
                  onChange={(e) => {
                    const value =
                      e.target.value === "all" ? "all" : Number(e.target.value);
                    setSelectedSprintId(value);
                    setSelectedTask(null);
                  }}
                  disabled={selectedProjectId === "all" || loadingSprints}
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-[#c74634] disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  {loadingSprints ? (
                    <option>Loading sprints...</option>
                  ) : (
                    <>
                      <option value="all">All Sprints</option>
                      {sprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 items-stretch gap-6 overflow-hidden px-8 pb-8 pt-2">
        <BacklogColumn
          title="To Do"
          subtitle={
            selectedSprintName === "all" ? "All Sprints" : selectedSprintName
          }
          tasks={visibleTasks.filter((t) => t.status === "todo")}
          onTaskClick={setSelectedTask}
          taskAssignments={taskAssignments}
        />
        <BacklogColumn
          title="In Progress"
          subtitle={
            selectedSprintName === "all" ? "All Sprints" : selectedSprintName
          }
          tasks={visibleTasks.filter((t) => t.status === "in_progress")}
          onTaskClick={setSelectedTask}
          taskAssignments={taskAssignments}
        />
        <BacklogColumn
          title="Review"
          subtitle={
            selectedSprintName === "all" ? "All Sprints" : selectedSprintName
          }
          tasks={visibleTasks.filter((t) => t.status === "review")}
          onTaskClick={setSelectedTask}
          taskAssignments={taskAssignments}
        />
        <BacklogColumn
          title="Done"
          subtitle={
            selectedSprintName === "all" ? "All Sprints" : selectedSprintName
          }
          tasks={visibleTasks.filter((t) => t.status === "done")}
          onTaskClick={setSelectedTask}
          taskAssignments={taskAssignments}
        />
      </div>

      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:bg-slate-800 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Task Detail
              </h4>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {selectedTask.title}
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {selectedTask.description || "No description available."}
            </p>

            <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
              <p className="text-slate-400 text-xs dark:text-slate-300">
                Assignees
              </p>
              {selectedMembers.length === 0 ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  No assignees
                </p>
              ) : (
                <div className="mt-1">
                  <MemberAvatars
                    members={selectedMembers}
                    max={selectedMembers.length}
                  />
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 col-span-2 dark:bg-slate-700">
                <p className="text-slate-400 dark:text-slate-300">Project</p>
                <p className="font-medium text-slate-700 dark:text-slate-100">
                  {selectedTask.projectName ||
                    `#${selectedTask.projectId ?? "N/A"}`}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                <p className="text-slate-400 dark:text-slate-300">Status</p>
                <p className="font-medium text-slate-700 dark:text-slate-100">
                  {selectedTask.status}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                <p className="text-slate-400 dark:text-slate-300">Priority</p>
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-100">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        PRIORITY_COLORS[selectedTask.priority] ?? "#94a3b8",
                    }}
                  />
                  <span>{selectedTask.priority}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BacklogPage;
