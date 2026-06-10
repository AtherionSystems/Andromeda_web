import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { updateProject } from "../../api/projects";
import type { ApiProject } from "../../types/api";
import type { Member } from "../../types/project";
import ProjectCard from "./ProjectCard";

interface Props {
  project: ApiProject;
  members: Member[];
  index: number;
  onClose: () => void;
  onSaved: (project: ApiProject) => void;
}

function EditProjectModal({ project, members, index, onClose, onSaved }: Props) {
  const { darkMode } = useTheme();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [saving, setSaving] = useState(false);
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

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Partial update — only the fields the user can change here.
      const updated = await updateProject(project.id, {
        name: name.trim(),
        description: description.trim(),
      });
      onSaved({ ...project, ...updated });
      onClose();
    } catch (err) {
      console.error("Failed to update project:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  // Live preview reflecting the edited fields.
  const previewProject: ApiProject = {
    ...project,
    name,
    description: description || null,
  };

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
        className={`relative flex w-full max-w-[800px] overflow-hidden rounded-lg shadow-2xl ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-5 z-10 leading-none transition-colors ${
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

        {/* Left: edit form */}
        <div className="flex-1 p-8 min-w-0">
          <h2 className={`mb-6 text-2xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
            Edit Project
          </h2>

          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className={labelClass}>Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter the project name"
                maxLength={255}
                className={fieldClass}
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className={labelClass}>Project Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the project goals and scope."
                rows={5}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                style={{ background: "#C74634" }}
                className="rounded px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className={`rounded px-4 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-60 ${
                  darkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className={`w-px self-stretch ${darkMode ? "bg-slate-700" : "bg-slate-100"}`} />

        {/* Right: live preview */}
        <div
          className={`hidden w-[300px] shrink-0 flex-col justify-center p-6 sm:flex ${
            darkMode ? "bg-slate-800/40" : "bg-slate-50"
          }`}
        >
          <p
            className={`mb-3 text-[10px] font-semibold uppercase tracking-[1.2px] ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Preview
          </p>
          {/* Non-interactive preview of the card */}
          <div className="pointer-events-none">
            <ProjectCard project={previewProject} members={members} index={index} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProjectModal;
