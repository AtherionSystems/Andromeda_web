import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { updateStory, getStory } from "../../../api/capabilities";
import { getUsers } from "../../../api/auth";
import type { ApiUser } from "../../../types/api";
import type { Story } from "./types";

interface Props {
  projectId: number;
  capabilityId: string;
  featureId: string;
  story: Story;
  onClose: () => void;
  onSaved: (updated: Story) => void;
}

const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;
const STATUS_OPTIONS = ["todo", "in_progress", "review", "done"] as const;
const STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

function EditStoryModal({ projectId, capabilityId, featureId, story, onClose, onSaved }: Props) {
  const { darkMode } = useTheme();
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description ?? "");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(story.acceptanceCriteria ?? "");
  const [priority, setPriority] = useState(story.priority ?? "medium");
  const [status, setStatus] = useState(story.status ?? "todo");
  const [storyPoints, setStoryPoints] = useState(
    story.storyPoints != null ? String(story.storyPoints) : "",
  );
  const [ownerId, setOwnerId] = useState<number | "">(story.ownerId ?? "");
  const [users, setUsers] = useState<ApiUser[]>([]);
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

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Failed to load users:", err));
    // If the story is missing full fields (came from list endpoint), fetch the full record.
    if (story.ownerId == null && story.acceptanceCriteria == null) {
      getStory(projectId, capabilityId, featureId, story.id)
        .then((full) => {
          setDescription(full.description ?? "");
          setAcceptanceCriteria(full.acceptanceCriteria ?? "");
          setOwnerId(full.ownerId ?? "");
          if (full.storyPoints != null) setStoryPoints(String(full.storyPoints));
        })
        .catch(() => {});
    }
  }, [projectId, capabilityId, featureId, story]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: Partial<Omit<Story, "id">> = {
        title: title.trim(),
        priority,
        status,
        description: description.trim() || undefined,
        acceptanceCriteria: acceptanceCriteria.trim() || undefined,
        ownerId: ownerId !== "" ? ownerId : undefined,
      };
      const pts = parseInt(storyPoints, 10);
      if (storyPoints.trim() && !Number.isNaN(pts)) body.storyPoints = pts;

      const updated = await updateStory(projectId, capabilityId, featureId, story.id, body);
      onSaved({ ...story, ...updated });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save changes. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = `text-[10px] tracking-[1.2px] uppercase font-semibold mb-1.5 block ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;
  const fieldClass = `w-full rounded border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a9ec2]/30 focus:border-[#5a9ec2] transition-colors ${
    darkMode
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
      : "bg-[#f4f9fc] border-[#e1eef6] text-slate-700 placeholder:text-slate-400"
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
        className={`relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-lg p-8 shadow-2xl ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-[#fbfdfe] text-slate-800"
        }`}
      >
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <h2 className={`mb-6 text-2xl font-semibold ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
          Edit User Story
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="As a user, I want to…"
              className={fieldClass}
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="More detail (optional)."
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Acceptance Criteria</label>
            <textarea
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="Given… when… then… (optional)."
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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
                onChange={(e) => setStatus(e.target.value)}
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-[110px]">
              <label className={labelClass}>Points</label>
              <input
                type="number"
                min={0}
                step={1}
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="—"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Owner</label>
            <select
              value={ownerId}
              onChange={(e) =>
                setOwnerId(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={fieldClass}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{ background: "#3a7fa0" }}
            className="w-full py-3.5 text-white text-[12px] font-semibold tracking-[1.5px] uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditStoryModal;
