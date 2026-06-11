import { useEffect } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { ApiProject } from "../../../types/api";

interface Props {
  project: ApiProject;
  onClose: () => void;
  onSelectCapabilities: () => void;
  onSelectSprints: () => void;
}

// Shown first when opening a non-empty project: a split chooser between the
// Capabilities (architecture) view and the Sprints view.
function ProjectEntryModal({
  project,
  onClose,
  onSelectCapabilities,
  onSelectSprints,
}: Props) {
  const { darkMode } = useTheme();

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

  const panelBase = `flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border px-8 py-16 text-center transition-all duration-150 cursor-pointer`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-[720px] overflow-hidden rounded-lg shadow-2xl ${
          darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute right-5 top-4 z-10 leading-none transition-colors ${
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

        {/* header */}
        <div className="px-8 pt-7 pb-1 text-center">
          <p
            className={`mb-1 text-[16px] font-semibold uppercase tracking-[1.2px] ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {project.name}
          </p>
          <h2 className={`text-xl font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
            What would you like to open?
          </h2>
        </div>

        {/* two halves */}
        <div className="flex flex-col gap-4 p-6 sm:flex-row">
          {/* Capabilities */}
          <button
            type="button"
            onClick={onSelectCapabilities}
            className={`${panelBase} ${
              darkMode
                ? "border-slate-700 bg-slate-800/40 hover:border-[#1a3a4a] hover:bg-slate-800"
                : "border-[#cdd8db] bg-[#E4F1F7] hover:border-[#1a3a4a] hover:shadow-md"
            }`}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                darkMode ? "bg-slate-700 text-[#7fb0c8]" : "bg-[#cfe6f2] text-[#1a3a4a]"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l9 5-9 5-9-5 9-5z" />
                <path d="M3 13l9 5 9-5" />
              </svg>
            </span>
            <span className={`text-[16px] font-semibold ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
              Capabilities
            </span>
            <span className={`text-[14px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Hierarchical capabilities, features and stories.
            </span>
          </button>

          {/* Sprints */}
          <button
            type="button"
            onClick={onSelectSprints}
            className={`${panelBase} ${
              darkMode
                ? "border-slate-700 bg-slate-800/40 hover:border-[#c74634] hover:bg-slate-800"
                : "border-[#f3dcd6] bg-[#fdf4f2] hover:border-[#c74634] hover:shadow-md"
            }`}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                darkMode ? "bg-slate-700 text-[#e88a78]" : "bg-[#f5ddd6] text-[#c74634]"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V4" />
                <path d="M4 4h13l-2 4 2 4H4" />
              </svg>
            </span>
            <span className={`text-[16px] font-semibold ${darkMode ? "text-slate-100" : "text-[#c74634]"}`}>
              Sprints
            </span>
            <span className={`text-[14px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Plan and track work across sprints.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectEntryModal;
