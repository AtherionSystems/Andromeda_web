import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { createTask } from "../../api/tasks";
import { getCapabilities, getFeatures, getStories } from "../../api/capabilities";
import type { ApiProject, ApiTask, TaskPriority, TaskStatus } from "../../types/api";

interface StoryOption {
  id: string;
  numericId: number;
  title: string;
  label: string;
}

interface LockedStory {
  id: string;
  numericId: number;
  title: string;
}

interface Props {
  projects: ApiProject[];
  defaultProjectId: number | "all";
  /** When set, the story field is pre-filled and locked (used from CapabilityPage). */
  lockedStory?: LockedStory;
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

function NewTaskModal({ projects, defaultProjectId, lockedStory, onClose, onCreated }: Props) {
  const { darkMode } = useTheme();

  const [projectId, setProjectId] = useState<number | "">(
    typeof defaultProjectId === "number" ? defaultProjectId : "",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [actualEnd, setActualEnd] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [actualHours, setActualHours] = useState("");
  const [selectedStoryId, setSelectedStoryId] = useState<string>(lockedStory?.id ?? "");
  const [storyOptions, setStoryOptions] = useState<StoryOption[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
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

  // Load stories for the selected project whenever it changes.
  // Skipped when a story is already locked (opened from CapabilityPage).
  useEffect(() => {
    if (lockedStory) return;
    setStoryOptions([]);
    setSelectedStoryId("");
    if (projectId === "") return;

    const ac = new AbortController();
    setStoriesLoading(true);

    (async () => {
      try {
        const caps = await getCapabilities(projectId as number, ac.signal);
        const options: StoryOption[] = [];

        await Promise.all(
          caps.map(async (cap) => {
            const feats = await getFeatures(projectId as number, cap.id).catch(() => []);
            await Promise.all(
              feats.map(async (feat) => {
                const stories = await getStories(projectId as number, cap.id, feat.id).catch(() => []);
                for (const s of stories) {
                  const numericId = parseInt(s.id, 10);
                  if (!Number.isNaN(numericId)) {
                    options.push({
                      id: s.id,
                      numericId,
                      title: s.title,
                      label: `${cap.name} › ${feat.name} › ${s.title}`,
                    });
                  }
                }
              }),
            );
          }),
        );

        if (!ac.signal.aborted) setStoryOptions(options);
      } catch {
        // Non-critical — story linking is optional.
      } finally {
        if (!ac.signal.aborted) setStoriesLoading(false);
      }
    })();

    return () => ac.abort();
  }, [projectId]);

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

    const body: Partial<Omit<ApiTask, "id" | "createdAt" | "projectId" | "projectName">> = {
      title: title.trim(),
      priority,
      status,
    };
    if (description.trim()) body.description = description.trim();
    if (startDate) body.startDate = `${startDate}T00:00:00`;
    if (dueDate) body.dueDate = `${dueDate}T00:00:00`;
    if (actualEnd) body.actualEnd = `${actualEnd}T00:00:00`;
    if (estimatedHours !== "") body.estimatedHours = Number(estimatedHours);
    if (actualHours !== "") body.actualHours = Number(actualHours);

    const selectedStory = lockedStory ?? storyOptions.find((s) => s.id === selectedStoryId);
    const numericStoryId = selectedStory?.numericId;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask(projectId as number, body, numericStoryId);
      const proj = projects.find((p) => p.id === projectId);
      onCreated({
        ...created,
        projectId: projectId as number,
        projectName: proj?.name,
        ...(numericStoryId != null && { userStoryId: numericStoryId }),
        ...(selectedStory && { userStoryTitle: selectedStory.title }),
      });
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
        className={`relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-lg p-8 shadow-2xl ${
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

          {/* User Story */}
          {lockedStory ? (
            <div className="mb-4">
              <label className={labelClass}>User Story</label>
              <div
                className={`flex items-center gap-2 rounded border px-3 py-2.5 text-sm ${
                  darkMode
                    ? "bg-slate-800/50 border-slate-700 text-slate-300"
                    : "bg-[#eef4f8] border-[#dbe7f0] text-slate-600"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a7fa0" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="truncate">{lockedStory.title}</span>
              </div>
            </div>
          ) : projectId !== "" && (
            <div className="mb-4">
              <label className={labelClass}>
                User Story
                {storiesLoading && (
                  <span className={`ml-2 font-normal normal-case tracking-normal ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    loading…
                  </span>
                )}
              </label>
              <select
                value={selectedStoryId}
                onChange={(e) => setSelectedStoryId(e.target.value)}
                disabled={storiesLoading}
                className={fieldClass}
              >
                <option value="">— None —</option>
                {storyOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              {!storiesLoading && storyOptions.length === 0 && (
                <p className={`mt-1 text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  No user stories found for this project.
                </p>
              )}
            </div>
          )}

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

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Actual End</label>
            <input
              type="date"
              value={actualEnd}
              onChange={(e) => setActualEnd(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="mb-6 flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="e.g. 8"
                className={fieldClass}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Actual Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value)}
                placeholder="e.g. 0"
                className={fieldClass}
              />
            </div>
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
