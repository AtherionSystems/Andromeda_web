import { useEffect } from "react";
import { useTheme } from "../../contexts/useTheme";
import type { ApiProject } from "../../types/api";

interface EmptyProjectScreenProps {
  project: ApiProject;
  onClose: () => void;
}

function EmptyProjectScreen({ project, onClose }: EmptyProjectScreenProps) {
  const { darkMode } = useTheme();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <img
        src={
          darkMode
            ? "/Andromeda_web/Media/Images/AtherionSVGWhite.svg"
            : "/Andromeda_web/Media/Images/AtherionSVGBlue.svg"
        }
        alt="Atherion"
        className="atherion-pop w-28 h-28 sm:w-36 sm:h-36 object-contain opacity-90"
      />

      <h2
        className={`mt-5 text-xl font-semibold ${
          darkMode ? "text-slate-100" : "text-[#1a3a4a]"
        }`}
      >
        {project.name}
      </h2>
      <p
        className={`mt-2 text-sm ${
          darkMode ? "text-slate-400" : "text-[#6a8a9a]"
        }`}
      >
        This project has no members or tasks yet.
      </p>

      <button
        type="button"
        style={{ background: "#c74634" }}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
      >
        + Start adding capabilities
      </button>

      <button
        onClick={onClose}
        className={`mt-3 text-sm font-medium transition-colors ${
          darkMode
            ? "text-slate-400 hover:text-slate-100"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        ← Back to projects
      </button>
    </div>
  );
}

export default EmptyProjectScreen;
