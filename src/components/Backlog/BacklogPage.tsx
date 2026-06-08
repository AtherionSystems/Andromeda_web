import { useState, useEffect, useContext, useRef } from "react";
import BacklogColumn from "../../components/Backlog/BacklogColumn";
import type { ApiProject, ApiTask, ApiSprint } from "../../types/api";
import type { Member } from "../../types/project";
import { getProjects, getProjectSprints } from "../../api/projects";
import {
  getProjectTasks,
  getTaskAssignments,
  getSprintTasks,
  updateTask,
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

const TASKS_PER_PAGE = 5;

function memberInitials(username: string): string {
  const parts = username.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function BacklogPage({ canUpdateStatus = false, initialProjectId }: { canUpdateStatus?: boolean; initialProjectId?: number }) {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [sprints, setSprints] = useState<ApiSprint[]>([]);
  const [loadingSprintList, setLoadingSprintList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
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

  async function handleStatusToggle(task: ApiTask) {
    if (task.projectId == null) return;
    const newStatus = task.status === "done" ? "in_progress" : "done";
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
      (t) => visibleTaskIds.includes(t.id) && !loadedAssignmentsRef.current.has(t.id),
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
              .filter((a) => a.assignedUserName != null)
              .map((a) => ({
                initials: memberInitials(a.assignedUserName!),
                color: AVATAR_COLORS[a.id % AVATAR_COLORS.length],
                name: a.assignedUserName!,
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

      {selectedTask &&
        (() => {
          const STATUS_META: Record<
            string,
            { label: string; subtitle: string; color: string; icon: string }
          > = {
            todo: {
              label: "TO DO",
              subtitle: "Not Started",
              color: "#94a3b8",
              icon: "○",
            },
            in_progress: {
              label: "IN PROGRESS",
              subtitle: "Active Development",
              color: "#f97316",
              icon: "↻",
            },
            review: {
              label: "IN REVIEW",
              subtitle: "Under Review",
              color: "#3b82f6",
              icon: "◎",
            },
            done: {
              label: "DONE",
              subtitle: "Completed",
              color: "#22c55e",
              icon: "✓",
            },
          };
          const PRIORITY_META: Record<
            string,
            { label: string; subtitle: string; color: string }
          > = {
            critical: {
              label: "CRITICAL",
              subtitle: "High Urgency",
              color: "#C74634",
            },
            high: {
              label: "HIGH",
              subtitle: "High Priority",
              color: "#FFB13F",
            },
            medium: { label: "MEDIUM", subtitle: "Moderate", color: "#00688C" },
            low: { label: "LOW", subtitle: "Low Priority", color: "#8FBFD0" },
          };
          const statusMeta =
            STATUS_META[selectedTask.status] ?? STATUS_META.todo;
          const priorityMeta = PRIORITY_META[selectedTask.priority] ?? {
            label: selectedTask.priority.toUpperCase(),
            subtitle: "",
            color: "#94a3b8",
          };

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
              onClick={() => setSelectedTask(null)}
            >
              <div
                role="dialog"
                aria-modal="true"
                className={`relative w-full max-w-[700px] rounded-lg shadow-2xl flex ${darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close */}
                <button
                  onClick={() => setSelectedTask(null)}
                  className={`absolute top-4 right-5 text-xl leading-none z-10 transition-colors ${darkMode ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"}`}
                >
                  ✕
                </button>

                {/* Left column */}
                <div className="flex-1 p-8 min-w-0">
                  <h2
                    className={`text-2xl italic font-light mb-1 pr-8 ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                  >
                    {selectedTask.title}
                  </h2>
                  <p
                    className={`text-[10px] tracking-[1.2px] uppercase font-semibold mb-6 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {selectedTask.projectName ||
                      `Project #${selectedTask.projectId ?? "N/A"}`}
                  </p>

                  <p
                    className={`text-[10px] tracking-[1.2px] uppercase font-semibold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Task Description
                  </p>
                  <div
                    className={`rounded border px-3 py-2.5 text-sm min-h-[80px] ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-[#f5f5f5] border-transparent text-slate-600"}`}
                  >
                    {selectedTask.description || (
                      <span
                        className={
                          darkMode ? "text-slate-500" : "text-slate-400"
                        }
                      >
                        No description available.
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[10px] tracking-[1.2px] uppercase font-semibold mt-5 mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Assignees
                  </p>
                  {selectedMembers.length === 0 ? (
                    <p
                      className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      No assignees
                    </p>
                  ) : (
                    <MemberAvatars
                      members={selectedMembers}
                      max={selectedMembers.length}
                    />
                  )}
                </div>

                {/* Divider */}
                <div
                  className={`w-px self-stretch ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}
                />

                {/* Right column */}
                <div className="flex flex-col gap-3 p-6 justify-center min-w-[200px]">
                  {/* Status card */}
                  <div
                    className={`flex items-center gap-4 rounded-lg p-4 ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white"
                      style={{ backgroundColor: statusMeta.color }}
                    >
                      {statusMeta.icon}
                    </div>
                    <div>
                      <p
                        className={`text-[9px] font-bold tracking-[1.4px] uppercase mb-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                      >
                        Current Status
                      </p>
                      <p
                        className="text-sm font-bold tracking-wide"
                        style={{ color: statusMeta.color }}
                      >
                        {statusMeta.label}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                      >
                        {statusMeta.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Priority card */}
                  <div
                    className={`flex items-center gap-4 rounded-lg p-4 ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                      style={{ backgroundColor: priorityMeta.color }}
                    >
                      !
                    </div>
                    <div>
                      <p
                        className={`text-[9px] font-bold tracking-[1.4px] uppercase mb-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                      >
                        Priority Level
                      </p>
                      <p
                        className="text-sm font-bold tracking-wide"
                        style={{ color: priorityMeta.color }}
                      >
                        {priorityMeta.label}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                      >
                        {priorityMeta.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default BacklogPage;
