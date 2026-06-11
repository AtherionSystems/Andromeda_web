import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { deleteStory } from "../../../api/capabilities";
import { getTasksByStory } from "../../../api/tasks";
import type { ApiProject, ApiTask } from "../../../types/api";
import type { Story } from "./types";
import { Avatar, Chevron } from "./shared";
import EditStoryModal from "./EditStoryModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import NewTaskModal from "../../Backlog/NewTaskModal";

const TASK_STATUS_COLOR: Record<string, string> = {
  todo: "#94a3b8",
  in_progress: "#f97316",
  review: "#3b82f6",
  revision: "#f59e0b",
  done: "#22c55e",
};

const TASK_STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  revision: "Revision",
  done: "Done",
};

interface Props {
  story: Story;
  project: ApiProject;
  capabilityId: string;
  featureId: string;
  onEdited?: (updated: Story) => void;
  onDeleted?: (storyId: string) => void;
}

function StoryRow({ story, project, capabilityId, featureId, onEdited, onDeleted }: Props) {
  const { darkMode } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const numericStoryId = parseInt(story.id, 10);
  const hasNumericId = !Number.isNaN(numericStoryId);
  const meta = [story.status, story.priority].filter(Boolean).join(" · ");

  useEffect(() => {
    if (!expanded || tasksLoaded || !hasNumericId) return;
    setTasksLoading(true);
    getTasksByStory(project.id, numericStoryId)
      .then((data) => {
        setTasks(data);
        setTasksLoaded(true);
      })
      .catch(() => {})
      .finally(() => setTasksLoading(false));
  }, [expanded, tasksLoaded, project.id, numericStoryId, hasNumericId]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteStory(project.id, capabilityId, featureId, story.id);
      onDeleted?.(story.id);
    } catch (err) {
      console.error("Failed to delete story:", err);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const iconBtn = `flex h-6 w-6 items-center justify-center rounded transition-colors ${
    darkMode
      ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
      : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
  }`;

  return (
    <>
      <div
        className={`rounded-md border-l-4 border border-l-[#9cc4dc] ${
          darkMode ? "bg-slate-800/60 border-slate-700" : "bg-[#f6fafd] border-[#e6f0f7]"
        }`}
      >
        {/* Story header row */}
        <div className="flex items-start gap-2 px-3 py-2.5">
          {/* Expand/collapse toggle */}
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            aria-expanded={expanded}
            aria-label="Toggle tasks"
            className={`mt-1 shrink-0 transition-colors ${
              darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Chevron open={expanded} />
          </button>

          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              User Story
            </p>
            <p className={`text-[13px] leading-snug ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
              {story.title}
            </p>
            {meta && (
              <p className={`mt-1 text-[10px] font-semibold tracking-[1px] capitalize ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                {meta.replace(/_/g, " ")}
              </p>
            )}
          </div>

          {typeof story.storyPoints === "number" && (
            <span className={`shrink-0 self-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${
              darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
            }`}>
              {story.storyPoints} pts
            </span>
          )}

          {story.assignee && (
            <Avatar initials={story.assignee.initials} color={story.assignee.color} />
          )}

          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" onClick={() => setEditOpen(true)} aria-label="Edit story" className={iconBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button type="button" onClick={() => setDeleteOpen(true)} aria-label="Delete story" className={iconBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tasks sub-list */}
        {expanded && (
          <div className={`px-3 pb-3 pl-11 border-t ${darkMode ? "border-slate-700" : "border-[#e6f0f7]"}`}>
            <p className={`pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Tasks
            </p>

            {tasksLoading ? (
              <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                Loading tasks…
              </p>
            ) : tasks.length === 0 ? (
              <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                No tasks linked yet.
              </p>
            ) : (
              <div className="space-y-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 ${
                      darkMode ? "bg-slate-700/50" : "bg-white/80"
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: TASK_STATUS_COLOR[task.status] ?? "#94a3b8" }}
                    />
                    <span className={`min-w-0 flex-1 truncate text-[12px] ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                      {task.title}
                    </span>
                    <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wide ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                      {TASK_STATUS_LABEL[task.status] ?? task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {hasNumericId && (
              <button
                type="button"
                onClick={() => setAddTaskOpen(true)}
                className={`mt-2 flex items-center gap-1 text-[11px] font-semibold tracking-wide ${
                  darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                + ADD TASK
              </button>
            )}
          </div>
        )}
      </div>

      {addTaskOpen && (
        <NewTaskModal
          projects={[project]}
          defaultProjectId={project.id}
          lockedStory={{ id: story.id, numericId: numericStoryId, title: story.title }}
          onClose={() => setAddTaskOpen(false)}
          onCreated={(task) => {
            setTasks((prev) => [...prev, task]);
            setAddTaskOpen(false);
          }}
        />
      )}

      {editOpen && (
        <EditStoryModal
          projectId={project.id}
          capabilityId={capabilityId}
          featureId={featureId}
          story={story}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            onEdited?.(updated);
            setEditOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <ConfirmDeleteDialog
          label="this user story"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          busy={deleting}
        />
      )}
    </>
  );
}

export default StoryRow;
