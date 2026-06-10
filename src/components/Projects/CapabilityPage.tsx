import { useEffect } from "react";
import { useTheme } from "../../contexts/useTheme";
import type { ApiProject } from "../../types/api";
import { SEED_CAPABILITIES, SEED_TASKS } from "./Capabilities/mockData";
import CapabilityCard from "./Capabilities/CapabilityCard";
import TaskCard from "./Capabilities/TaskCard";
import AgendaSidebar from "./Capabilities/AgendaSidebar";

interface CapabilityPageProps {
  project: ApiProject;
  onClose: () => void;
}

function CapabilityPage({ project, onClose }: CapabilityPageProps) {
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

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* izq jerarquía de capabilities*/}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {project.name}
              </h1>
              <p className={`mt-1 text-[14px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Manage hierarchical capabilities, features, and stories.
              </p>
            </div>
            <button
              type="button"
              style={{ background: "#c74634" }}
              className="flex shrink-0 items-center justify-center gap-2 rounded px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 min-w-[160px]"
            >
              + Add Capability
            </button>
          </div>

          <div className="space-y-4">
            {SEED_CAPABILITIES.map((cap, i) => (
              <CapabilityCard key={cap.id} capability={cap} defaultOpen={i === 0} />
            ))}
          </div>

          {/* tasks no linkeadas a capabilities o features */}
          <div className="mt-8">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className={`text-[19px] font-bold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  Tasks
                </h2>
                <p className={`mt-1 text-[14px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Standalone tasks not linked to a capability or feature.
                </p>
              </div>
              <button
                type="button"
                style={{ background: "#c74634" }}
                className="flex shrink-0 items-center justify-center gap-2 rounded px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 min-w-[160px]"
              >
                + Add Task
              </button>
            </div>

            <div className="space-y-3">
              {SEED_TASKS.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* calendario y agenda*/}
        <AgendaSidebar />
      </div>
    </div>
  );
}

export default CapabilityPage;
