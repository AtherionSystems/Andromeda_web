import { useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { updateTask } from "../../api/tasks";
import type { ApiSprint, ApiTask } from "../../types/api";

interface Props {
  task: ApiTask;
  sprints: ApiSprint[];
  onClose: () => void;
  onAssigned: (task: ApiTask) => void;
}

function AssignToSprintModal({ task, sprints, onClose, onAssigned }: Props) {
  const { darkMode } = useTheme();
  const [selectedId, setSelectedId] = useState<number | "">(task.sprintId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectId = task.projectId;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectId) { setError("Task has no project."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const sprintId = selectedId === "" ? null : (selectedId as number);
      const updated = await updateTask(projectId, task.id, { sprintId: sprintId ?? undefined });
      const sprint = sprints.find((s) => s.id === sprintId);
      onAssigned({
        ...task,
        ...updated,
        sprintId: sprintId ?? undefined,
        sprintName: sprint?.name,
      });
      onClose();
    } catch {
      setError("Could not assign sprint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = `text-[10px] tracking-[1.2px] uppercase font-semibold mb-1.5 block ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;
  const fieldClass = `w-full rounded border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C74634]/30 focus:border-[#C74634] transition-colors ${
    darkMode
      ? "bg-slate-800 border-slate-700 text-slate-100"
      : "bg-[#f5f5f5] border-transparent text-slate-700"
  }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[420px] rounded-lg p-8 shadow-2xl ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-5 leading-none transition-colors ${
            darkMode ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <h2 className={`mb-1 text-xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          Assign to Sprint
        </h2>
        <p className={`mb-5 text-[11px] font-medium truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {task.title}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={labelClass}>Sprint</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value === "" ? "" : Number(e.target.value))}
              className={fieldClass}
              autoFocus
            >
              <option value="">— None (unassign) —</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{ background: "#C74634" }}
            className="w-full py-3.5 text-white text-[12px] font-semibold tracking-[1.5px] uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Saving..." : "Assign Sprint"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AssignToSprintModal;
