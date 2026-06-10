import { useEffect } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { ApiProject } from "../../../types/api";

interface SprintsPageProps {
  project: ApiProject;
  onClose: () => void;
}

// Empty placeholder page reached from the "Sprints" option in the project
// chooser. Build the sprint board here later.
function SprintsPage({ project, onClose }: SprintsPageProps) {
  const { darkMode } = useTheme();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div>
      <button
        onClick={onClose}
        className={`mb-4 text-sm font-medium transition-colors ${
          darkMode ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        ← Back to projects
      </button>

      <div className="mb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
          {project.name}
        </h1>
        <p className={`mt-1 text-[14px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Plan and track work across sprints.
        </p>
      </div>

      <div
        className={`flex min-h-[40vh] items-center justify-center rounded-lg border border-dashed ${
          darkMode ? "border-slate-700 text-slate-500" : "border-slate-300 text-slate-400"
        }`}
      >
        <p className="text-sm">No sprints yet.</p>
      </div>
    </div>
  );
}

export default SprintsPage;
