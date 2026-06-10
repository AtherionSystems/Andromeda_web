import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { useAuth } from "../../../contexts/auth";
import { createStory } from "../../../api/capabilities";
import { getUsers } from "../../../api/auth";
import type { ApiUser } from "../../../types/api";
import type { Story } from "./types";

interface Props {
  projectId: number;
  capabilityId: string;
  featureId: string;
  onClose: () => void;
  onCreated: (story: Story) => void;
}

const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;
const STATUS_OPTIONS = ["todo", "in_progress", "review", "done"] as const;
const STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

function NewStoryModal({ projectId, capabilityId, featureId, onClose, onCreated }: Props) {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [status, setStatus] = useState<string>("todo");
  const [storyPoints, setStoryPoints] = useState("");
  const [ownerId, setOwnerId] = useState<number | "">("");
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
    getUsers().then(setUsers).catch((err) => console.error("Failed to load users:", err));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!user) {
      setError("You must be signed in to create a story.");
      return;
    }

    // OCI-authenticated users carry id: 0 in the auth context, so resolve the
    // real backend user id by matching the logged-in account against /api/users.
    const createdById =
      user.id ||
      users.find(
        (u) =>
          (!!user.email && u.email?.toLowerCase() === user.email.toLowerCase()) ||
          (!!user.username &&
            u.username?.toLowerCase() === user.username.toLowerCase()) ||
          (!!user.name && u.name?.toLowerCase() === user.name.toLowerCase()),
      )?.id;

    if (createdById == null) {
      setError(
        "Couldn't match your account to a backend user, so the story has no valid creator. Make sure your user exists in the system.",
      );
      return;
    }

    // projectId/capabilityId/featureId go in the URL, not the body.
    const body: Partial<Omit<Story, "id">> = {
      title: title.trim(),
      createdById,
      priority,
      status,
    };
    if (description.trim()) body.description = description.trim();
    if (acceptanceCriteria.trim()) body.acceptanceCriteria = acceptanceCriteria.trim();
    const pts = parseInt(storyPoints, 10);
    if (storyPoints.trim() && !Number.isNaN(pts)) body.storyPoints = pts;
    if (ownerId !== "") body.ownerId = ownerId;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createStory(projectId, capabilityId, featureId, body);
      onCreated(created);
      onClose();
    } catch (err) {
      console.error("Failed to create story:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not create the story. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = `text-[10px] tracking-[1.2px] uppercase font-semibold mb-1.5 block ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;

  // Lightest tones (story level): soft blue tint fields + light-blue accent.
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

        <h2 className={`mb-6 text-2xl font-semibold ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
          New User Story
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
            {submitting ? "Creating..." : "Create Story"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewStoryModal;
