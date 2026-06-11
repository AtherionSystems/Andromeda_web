import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { updateFeature } from "../../../api/capabilities";
import { FEATURE_STATUSES } from "./types";
import type { Feature, FeatureStatus, Priority } from "./types";

interface Props {
  projectId: number;
  capabilityId: string;
  feature: Feature;
  onClose: () => void;
  onSaved: (updated: Feature) => void;
}

const PRIORITY_OPTIONS: Priority[] = ["HIGH", "MEDIUM", "LOW"];

function EditFeatureModal({ projectId, capabilityId, feature, onClose, onSaved }: Props) {
  const { darkMode } = useTheme();
  const [name, setName] = useState(feature.name);
  const [description, setDescription] = useState(feature.description ?? "");
  const [status, setStatus] = useState<FeatureStatus>(feature.status);
  const [priority, setPriority] = useState<Priority | "">(feature.priority ?? "");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: Partial<Omit<Feature, "id" | "stories">> = {
        name: name.trim(),
        status,
        description: description.trim() || undefined,
        ...(priority ? { priority } : {}),
      };
      const updated = await updateFeature(projectId, capabilityId, feature.id, body);
      onSaved({ ...feature, ...updated });
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
  const fieldClass = `w-full rounded border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7fa0]/30 focus:border-[#3a7fa0] transition-colors ${
    darkMode
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
      : "bg-[#eef4f8] border-[#dbe7f0] text-slate-700 placeholder:text-slate-400"
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
          darkMode ? "bg-slate-900 text-slate-100" : "bg-[#f7fbfd] text-slate-800"
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
          Edit Feature
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter feature title."
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
              placeholder="What does this feature cover? (optional)"
              rows={4}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FeatureStatus)}
                className={fieldClass}
              >
                {FEATURE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority | "")}
                className={fieldClass}
              >
                <option value="">—</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
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

export default EditFeatureModal;
