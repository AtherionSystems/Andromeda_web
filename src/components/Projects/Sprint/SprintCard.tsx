import { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { deleteSprint } from "../../../api/projects";
import type { ApiProject, ApiSprint, ApiTask } from "../../../types/api";
import { Chevron } from "../Capabilities/shared";
import ConfirmDeleteDialog from "../Capabilities/ConfirmDeleteDialog";
import EditSprintModal from "./EditSprintModal";
import SprintTaskRow from "./SprintTaskRow";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-100 text-blue-600",
  planned: "bg-amber-100 text-amber-600",
  completed: "bg-emerald-100 text-emerald-600",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  planned: "Planning",
  completed: "Completed",
};

function formatRange(sprint: ApiSprint): string | null {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (sprint.startDate && sprint.dueDate)
    return `${fmt(sprint.startDate)} – ${fmt(sprint.dueDate)}`;
  if (sprint.dueDate) return `Due ${fmt(sprint.dueDate)}`;
  if (sprint.startDate) return `Starts ${fmt(sprint.startDate)}`;
  return null;
}

interface Props {
  sprint: ApiSprint;
  tasks: ApiTask[];
  project: ApiProject;
  defaultOpen?: boolean;
  onEdited?: (updated: ApiSprint) => void;
  onDeleted?: (sprintId: number) => void;
}

function SprintCard({ sprint, tasks, project, defaultOpen, onEdited, onDeleted }: Props) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const total = tasks.length;
  const range = formatRange(sprint);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSprint(project.id, sprint.id);
      onDeleted?.(sprint.id);
    } catch (err) {
      console.error("Failed to delete sprint:", err);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const iconBtn = `flex h-7 w-7 items-center justify-center rounded transition-colors ${
    darkMode
      ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
      : "text-slate-400 hover:text-slate-700 hover:bg-white/60"
  }`;

  return (
    <>
      <div
        className={`overflow-hidden rounded-lg border-l-4 border border-l-[#1a3a4a] ${
          darkMode ? "bg-slate-800/40 border-slate-700" : "bg-[#D7E9E9] border-[#a9c0c0]"
        }`}
      >
        <div className="flex w-full items-center gap-3 px-4 py-3.5">
          {/* Expand button — flex-1 */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="min-w-0 flex-1 text-left flex items-center gap-3"
          >
            <span className={darkMode ? "text-slate-400" : "text-slate-400"}>
              <Chevron open={open} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Sprint
              </p>
              <p className={`truncate text-[16px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                {sprint.name}
              </p>
              <p className={`mt-1 text-[13px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {range ? `${range} · ` : ""}{total} {total === 1 ? "task" : "tasks"}
              </p>
            </div>
          </button>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-0.5">
            <span className={`mr-1 shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide ${STATUS_STYLES[sprint.status] ?? "bg-slate-100 text-slate-500"}`}>
              {STATUS_LABEL[sprint.status] ?? sprint.status}
            </span>
            <button type="button" onClick={() => setEditOpen(true)} aria-label="Edit sprint" className={iconBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button type="button" onClick={() => setDeleteOpen(true)} aria-label="Delete sprint" className={iconBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>

        {sprint.goal && (
          <div className="px-4 pb-3 pl-11">
            <p className={`text-[14px] leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              {sprint.goal}
            </p>
          </div>
        )}

        {open && (
          <div className="space-y-2 px-4 pb-4 pl-11">
            <p className={`text-[14px] font-bold uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-slate-800"}`}>
              Tasks
            </p>
            {tasks.map((task) => (
              <SprintTaskRow key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <p className={`text-[13px] ${darkMode ? "text-slate-400" : "text-slate-800"}`}>
                No tasks in this sprint yet.
              </p>
            )}
          </div>
        )}
      </div>

      {editOpen && (
        <EditSprintModal
          isOpen={editOpen}
          project={project}
          sprint={sprint}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            onEdited?.(updated);
            setEditOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <ConfirmDeleteDialog
          label="this sprint"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          busy={deleting}
        />
      )}
    </>
  );
}

export default SprintCard;
