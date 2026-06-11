import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { createTask } from "../../api/tasks";
import type { ApiProject, ApiTask, TaskPriority, TaskStatus } from "../../types/api";

interface Props {
  projects: ApiProject[];
  // Current "Filter by project" value — used to preselect the project.
  defaultProjectId: number | "all";
  onClose: () => void;
  onCreated: (task: ApiTask) => void;
}

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high", "critical"];
const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  revision: "Revision",
  done: "Done",
};

function NewTaskModal({ projects, defaultProjectId, onClose, onCreated }: Props) {
  const { darkMode } = useTheme();

  const [projectId, setProjectId] = useState<number | "">(
    typeof defaultProjectId === "number" ? defaultProjectId : "",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState(""); // yyyy-mm-dd from the date input
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (projectId === "") {
      setError("Select a project for this task.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    // Only send what the user filled. projectId goes in the URL, not the body.
    const body: Partial<Omit<ApiTask, "id" | "createdAt" | "projectId" | "projectName">> = {
      title: title.trim(),
      priority,
      status,
    };
    if (description.trim()) body.description = description.trim();
    // LocalDateTime without timezone, as the backend expects.
    if (dueDate) body.dueDate = `${dueDate}T00:00:00`;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask(projectId, body);
      const proj = projects.find((p) => p.id === projectId);
      // The API response omits the client-side enrichment, so add it back.
      onCreated({ ...created, projectId, projectName: proj?.name });
      onClose();
    } catch {
      setError("Could not create the task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = `text-[10px] tracking-[1.2px] uppercase font-semibold mb-1.5 block ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;

  const fieldClass = `w-full rounded border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C74634]/30 focus:border-[#C74634] transition-colors ${
    darkMode
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
      : "bg-[#f5f5f5] border-transparent text-slate-700 placeholder:text-slate-400"
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
        className={`relative w-full max-w-[520px] rounded-lg p-8 shadow-2xl ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-5 leading-none transition-colors ${
            darkMode
              ? "text-slate-500 hover:text-slate-200"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <h2 className={`mb-6 text-2xl bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          New Task
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClass}>Project</label>
            <select
              value={projectId}
              onChange={(e) =>
                setProjectId(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={fieldClass}
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={255}
              className={fieldClass}
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail (optional)."
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={fieldClass}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={fieldClass}
            />
          </div>

          {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{ background: "#C74634" }}
            className="w-full py-3.5 text-white text-[12px] font-semibold tracking-[1.5px] uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;
