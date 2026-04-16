import { useState, useEffect } from "react";
import BacklogColumn from "../../components/Backlog/BacklogColumn";
import type { ApiTask } from "../../types/api";
import type { Member } from "../../types/project";
import { getProjects } from "../../api/projects";
import { getProjectTasks, getTaskAssignments } from "../../api/tasks";
import MemberAvatars from "../Projects/MemberAvatars";

const AVATAR_COLORS = ["#4a3f7a", "#2a6a5a", "#c74634", "#d97706", "#2a4a7a", "#6a2a4a"];
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
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [taskAssignments, setTaskAssignments] = useState<Record<number, Member[]>>({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError(null);

        const projects = await getProjects();
        const taskArrays = await Promise.all(
          projects.map(async (project) => {
            const projectTasks = await getProjectTasks(project.id);
            return projectTasks.map((task) => ({
              ...task,
              projectId: project.id,
              projectName: project.name,
            }));
          })
        );

        const allTasks = taskArrays.flat();
        setTasks(allTasks);

        const assignmentMap: Record<number, Member[]> = {};

        const taskAssignmentsPairs = await Promise.all(
          allTasks.map(async (task) => {
            if (task.projectId == null) return [task.id, [] as Member[]] as const;

            const assignments = await getTaskAssignments(task.projectId, task.id);
            const members: Member[] = assignments.map((assignment) => ({
              initials: memberInitials(assignment.user.username),
              color: AVATAR_COLORS[assignment.user.id % AVATAR_COLORS.length],
              name: assignment.user.username,
            }));

            return [task.id, members] as const;
          })
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

  if (loading) return <div className="p-10 text-slate-400">Loading Backlog...</div>;

  if (error) {
    return (
      <div className="p-10 text-slate-500">
        <p className="text-sm font-medium text-slate-700">Backlog unavailable</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const selectedMembers = selectedTask ? (taskAssignments[selectedTask.id] ?? []) : [];

  return (
    <>
      <div className="px-8 pt-6 pb-2 bg-[#fdfdfd]">
        <h2 className="text-2xl font-semibold text-slate-900 italic">Backlog</h2>
      </div>

      <div className="flex h-full gap-6 overflow-x-auto p-8 bg-[#fdfdfd]">
        <BacklogColumn 
          title="To Do" 
          tasks={tasks.filter(t => t.status === "todo")} 
          onTaskClick={setSelectedTask}
          taskAssignments={taskAssignments}
        />
        <BacklogColumn 
          title="In Progress" 
          tasks={tasks.filter(t => t.status === "in_progress")} 
          onTaskClick={setSelectedTask}
          taskAssignments={taskAssignments}
        />
        <BacklogColumn 
          title="Review" 
          tasks={tasks.filter(t => t.status === "review")} 
          onTaskClick={setSelectedTask}
          taskAssignments={taskAssignments}
        />
        <BacklogColumn 
          title="Done" 
          tasks={tasks.filter(t => t.status === "done")} 
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
            className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900">Task Detail</h4>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <p className="mt-1 text-lg font-semibold text-slate-900">{selectedTask.title}</p>
            <p className="mt-3 text-sm text-slate-600">
              {selectedTask.description || "No description available."}
            </p>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-slate-400 text-xs">Assignees</p>
              {selectedMembers.length === 0 ? (
                <p className="mt-1 text-xs text-slate-500">No assignees</p>
              ) : (
                <div className="mt-1">
                  <MemberAvatars members={selectedMembers} max={selectedMembers.length} />
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 col-span-2">
                <p className="text-slate-400">Project</p>
                <p className="font-medium text-slate-700">
                  {selectedTask.projectName || `#${selectedTask.projectId ?? "N/A"}`}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-slate-400">Status</p>
                <p className="font-medium text-slate-700">{selectedTask.status}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-slate-400">Priority</p>
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLORS[selectedTask.priority] ?? "#94a3b8" }}
                  />
                  <span>{selectedTask.priority}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BacklogPage;