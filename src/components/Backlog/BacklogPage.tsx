import { useState, useEffect, useContext, useRef } from "react";
import BacklogColumn from "../../components/Backlog/BacklogColumn";
import type {
  ApiProject,
  ApiTask,
  ApiSprint,
  TaskStatus,
} from "../../types/api";
import type { Member } from "../../types/project";
import { getProjects, getProjectSprints } from "../../api/projects";
import {
  getProjectTasks,
  getTaskAssignments,
  getSprintTasks,
  updateTask,
} from "../../api/tasks";
import BacklogDetails from "./BacklogDetails";
import NewTaskModal from "./NewTaskModal";
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

const TASKS_PER_PAGE = 5;

function memberInitials(username: string): string {
  const parts = username.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function BacklogPage({
  canUpdateStatus = false,
  canEdit = false,
  initialProjectId,
}: {
  canUpdateStatus?: boolean;
  canEdit?: boolean;
  initialProjectId?: number;
}) {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [sprints, setSprints] = useState<ApiSprint[]>([]);
  const [loadingSprintList, setLoadingSprintList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">(
    initialProjectId ?? "all",
  );
  const [selectedSprintId, setSelectedSprintId] = useState<number | "all">(
    "all",
  );
  const [taskAssignments, setTaskAssignments] = useState<
    Record<number, Member[]>
  >({});
  const [columnPages, setColumnPages] = useState<Record<string, number>>({
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  });

  // baseTasksRef holds all enriched tasks across projects so we can restore
  // the full list when the user resets the sprint filter without a new API call.
  // cache.ts handles HTTP-level deduplication; this ref handles UI-level state.
  const baseTasksRef = useRef<ApiTask[]>([]);
  const loadedAssignmentsRef = useRef<Set<number>>(new Set());
  const hasFetched = useRef(false);

  const theme = useContext(ThemeContext);
  const darkMode = theme?.darkMode ?? false;

  const handlePageChange = (column: string, page: number) => {
    setColumnPages((prev) => ({ ...prev, [column]: page }));
  };

  // Reflect an edited task (title/description) in the board and open modal.
  function handleTaskSaved(updated: ApiTask) {
    const merge = (prev: ApiTask[]) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
    setTasks(merge);
    baseTasksRef.current = merge(baseTasksRef.current);
    setSelectedTask(updated);
  }

  // Add a newly created task to the board.
  function handleTaskCreated(created: ApiTask) {
    setTasks((prev) => [created, ...prev]);
    baseTasksRef.current = [created, ...baseTasksRef.current];
  }

  // Refresh a task's assignees after they change in the detail modal.
  async function handleAssigneesChanged() {
    if (!selectedTask || selectedTask.projectId == null) return;
    const { projectId, id } = selectedTask;
    loadedAssignmentsRef.current.delete(id);
    try {
      const assignments = await getTaskAssignments(projectId, id);
      const members: Member[] = assignments
        .filter((a) => a.userName != null)
        .map((a) => ({
          initials: memberInitials(a.userName!),
          color: AVATAR_COLORS[a.userId % AVATAR_COLORS.length],
          name: a.userName!,
        }));
      setTaskAssignments((prev) => ({ ...prev, [id]: members }));
      loadedAssignmentsRef.current.add(id);
    } catch (err) {
      console.error("Failed to refresh assignees:", err);
    }
  }

  async function handleStatusToggle(task: ApiTask) {
    if (task.projectId == null) return;
    const newStatus: TaskStatus =
      task.status === "done" ? "in_progress" : "done";
    // Optimistic update
    const update = (prev: ApiTask[]) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t));
    setTasks(update);
    baseTasksRef.current = baseTasksRef.current.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t,
    );
    try {
      await updateTask(task.projectId, task.id, { status: newStatus });
    } catch {
      // Rollback on failure
      const rollback = (prev: ApiTask[]) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t));
      setTasks(rollback);
      baseTasksRef.current = baseTasksRef.current.map((t) =>
        t.id === task.id ? { ...t, status: task.status } : t,
      );
    }
  }

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchTasks = async () => {
      try {
        setError(null);
        const projectList = await getProjects();
        setProjects(projectList);

        const taskArrays = await Promise.all(
          projectList.map(async (project) => {
            const projectTasks = await getProjectTasks(project.id);
            return projectTasks.map((task) => ({
              ...task,
              projectId: project.id,
              projectName: project.name,
            }));
          }),
        );

        const allTasks = taskArrays.flat();
        baseTasksRef.current = allTasks;
        setTasks(allTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Unable to load backlog tasks right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ── Assignments: fetch only for tasks visible on current page ───────────────
  useEffect(() => {
    const visibleTaskIds = (
      ["todo", "in_progress", "review", "done"] as const
    ).flatMap((status) => {
      const columnTasks = tasks.filter((t) => t.status === status);
      const page = columnPages[status] ?? 0;
      return columnTasks
        .slice(page * TASKS_PER_PAGE, page * TASKS_PER_PAGE + TASKS_PER_PAGE)
        .map((t) => t.id);
    });

    const toFetch = tasks.filter(
      (t) =>
        visibleTaskIds.includes(t.id) &&
        !loadedAssignmentsRef.current.has(t.id),
    );

    const fetchVisibleAssignments = async () => {
      const pairs = await Promise.all(
        toFetch.map(async (task) => {
          if (task.projectId == null) return [task.id, [] as Member[]] as const;
          try {
            const assignments = await getTaskAssignments(
              task.projectId,
              task.id,
            );
            const members: Member[] = assignments
              .filter((a) => a.userName != null)
              .map((a) => ({
                initials: memberInitials(a.userName!),
                color: AVATAR_COLORS[a.userId % AVATAR_COLORS.length],
                name: a.userName!,
              }));
            loadedAssignmentsRef.current.add(task.id);
            return [task.id, members] as const;
          } catch {
            return [task.id, [] as Member[]] as const;
          }
        }),
      );
      setTaskAssignments((prev) => ({ ...prev, ...Object.fromEntries(pairs) }));
    };

    fetchVisibleAssignments();
  }, [tasks, columnPages]);

  // ── Sprint list: fetch when project changes ─────────────────────────────────
  useEffect(() => {
    if (selectedProjectId === "all") {
      setSprints([]);
      setSelectedSprintId("all");
      setTasks(baseTasksRef.current);
      return;
    }

    const ac = new AbortController();

    const fetchSprints = async () => {
      setLoadingSprintList(true);
      setSelectedSprintId("all");
      try {
        const projectSprints = await getProjectSprints(selectedProjectId);
        if (!ac.signal.aborted) setSprints(projectSprints);
      } catch (err) {
        if (!ac.signal.aborted) {
          console.error("Error fetching sprints:", err);
          setSprints([]);
        }
      } finally {
        if (!ac.signal.aborted) setLoadingSprintList(false);
      }
    };

    fetchSprints();
    return () => ac.abort();
  }, [selectedProjectId]);

  // ── Sprint tasks: fetch when sprint filter changes ──────────────────────────
  useEffect(() => {
    if (selectedProjectId === "all") return;

    // Restore from baseTasksRef — no API call needed (cache.ts handles HTTP dedup)
    if (selectedSprintId === "all") {
      setTasks((prev) => [
        ...prev.filter((t) => t.projectId !== selectedProjectId),
        ...baseTasksRef.current.filter(
          (t) => t.projectId === selectedProjectId,
        ),
      ]);
      return;
    }

    const ac = new AbortController();

    const fetchSprintTasks = async () => {
      try {
        const sprintTasks = await getSprintTasks(
          selectedProjectId as number,
          selectedSprintId as number,
        );

        if (ac.signal.aborted) return;

        const projectName = projects.find(
          (p) => p.id === selectedProjectId,
        )?.name;
        const enrichedTasks: ApiTask[] = (
          sprintTasks as SprintTaskEntry[]
        ).flatMap((entry) =>
          (entry.tasks ?? []).map((task) => ({
            ...task,
            projectId: selectedProjectId as number,
            projectName,
            sprintId: entry.sprintId,
            sprintName: entry.sprintName,
          })),
        );

        setTasks((prev) => [
          ...prev.filter((t) => t.projectId !== selectedProjectId),
          ...enrichedTasks,
        ]);

        // Sprint response may already embed assignee data — use it directly
        const assignmentMap: Record<number, Member[]> = {};
        for (const task of enrichedTasks) {
          const assignees = (task as RawTaskWithAssignees).assignees ?? [];
          const members = assignees
            .filter(
              (a): a is RawAssignee & { userName: string } =>
                a.userName != null,
            )
            .map((a) => ({
              initials: memberInitials(a.userName),
              color: AVATAR_COLORS[a.userId % AVATAR_COLORS.length],
              name: a.userName,
            }));
          if (members.length > 0) {
            assignmentMap[task.id] = members;
            loadedAssignmentsRef.current.add(task.id);
          }
        }
        setTaskAssignments((prev) => ({ ...prev, ...assignmentMap }));
      } catch (err) {
        if (!ac.signal.aborted)
          console.error("Error fetching sprint tasks:", err);
      }
    };

    fetchSprintTasks();
    return () => ac.abort();
  }, [selectedSprintId, selectedProjectId, projects]);

  // ── Keyboard / theme side-effects ───────────────────────────────────────────
  useEffect(() => {
    if (!selectedTask) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedTask(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedTask]);

  useEffect(() => {
    setSelectedTask(null);
  }, [darkMode]);

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/Andromeda_web/Media/Animations/RedGearGIF.gif"
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
            <div className="flex flex-col items-start -ml-5">
              <h2
                className={`text-2xl font-bold tracking-tight ${darkMode ? "text-foreground" : "text-foreground"}`}
              >
                Backlog
              </h2>
              <p
                className={`mt-2 text-[18px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {visibleTaskCount} tasks
              </p>
            </div>

            <div className="flex min-w-[320px] flex-col gap-3 text-right sm:flex-row sm:items-end sm:gap-4 -mr-5">
              <div className="flex-[1.5]">
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
                  disabled={selectedProjectId === "all" || loadingSprintList}
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-[#c74634] disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  {loadingSprintList ? (
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

          <div className="mt-3 flex justify-end -mr-5">
            <button
              type="button"
              onClick={() => setAddTaskOpen(true)}
              style={{ background: "#c74634" }}
              className="flex items-center justify-center gap-1.5 rounded px-3.5 h-8 min-w-[220px] text-white text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-90"
            >
              + Add Task
            </button>
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
          onStatusToggle={canUpdateStatus ? handleStatusToggle : undefined}
          taskAssignments={taskAssignments}
          onPageChange={(page) => handlePageChange("todo", page)}
        />
        <BacklogColumn
          title="In Progress"
          subtitle={
            selectedSprintName === "all" ? "All Sprints" : selectedSprintName
          }
          tasks={visibleTasks.filter((t) => t.status === "in_progress")}
          onTaskClick={setSelectedTask}
          onStatusToggle={canUpdateStatus ? handleStatusToggle : undefined}
          taskAssignments={taskAssignments}
          onPageChange={(page) => handlePageChange("in_progress", page)}
        />
        <BacklogColumn
          title="Review"
          subtitle={
            selectedSprintName === "all" ? "All Sprints" : selectedSprintName
          }
          tasks={visibleTasks.filter((t) => t.status === "review")}
          onTaskClick={setSelectedTask}
          onStatusToggle={canUpdateStatus ? handleStatusToggle : undefined}
          taskAssignments={taskAssignments}
          onPageChange={(page) => handlePageChange("review", page)}
        />
        <BacklogColumn
          title="Done"
          subtitle={
            selectedSprintName === "all" ? "All Sprints" : selectedSprintName
          }
          tasks={visibleTasks.filter((t) => t.status === "done")}
          onTaskClick={setSelectedTask}
          onStatusToggle={canUpdateStatus ? handleStatusToggle : undefined}
          taskAssignments={taskAssignments}
          onPageChange={(page) => handlePageChange("done", page)}
        />
      </div>

      {selectedTask && (
        <BacklogDetails
          task={selectedTask}
          members={selectedMembers}
          canEdit={canEdit}
          onClose={() => setSelectedTask(null)}
          onSaved={handleTaskSaved}
          onAssigneesChanged={handleAssigneesChanged}
        />
      )}

      {addTaskOpen && (
        <NewTaskModal
          projects={projects}
          defaultProjectId={selectedProjectId}
          onClose={() => setAddTaskOpen(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}

export default BacklogPage;
