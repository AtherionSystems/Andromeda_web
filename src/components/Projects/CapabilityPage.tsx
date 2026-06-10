import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import type { ApiProject } from "../../types/api";
import type { Capability, Task } from "./Capabilities/types";
import { getCapabilities } from "../../api/capabilities";
import { getProjectTasks } from "../../api/tasks";
import CapabilityCard from "./Capabilities/CapabilityCard";
import TaskCard from "./Capabilities/TaskCard";
import AgendaSidebar from "./Capabilities/AgendaSidebar";

interface CapabilityPageProps {
  project: ApiProject;
  onClose: () => void;
}

function CapabilityPage({ project, onClose }: CapabilityPageProps) {
  const { darkMode } = useTheme();
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const ac = new AbortController();

    async function load(signal: AbortSignal) {
      setLoading(true);
      setError(null);
      try {
        const [caps, rawTasks] = await Promise.all([
          getCapabilities(project.id, signal),
          getProjectTasks(project.id, signal),
        ]);

        if (signal.aborted) return;

        setCapabilities(
          caps.map((cap) => ({
            ...cap,
            features: (cap.features ?? []).map((f) => ({
              ...f,
              stories: f.stories ?? [],
            })),
          })),
        );

        // Standalone tasks: those not linked to any capability or feature
        // Adapt the filter condition to match your API's shape if needed
        const standalone = rawTasks
          .filter((t) => !t.capabilityId && !t.featureId)
          .map((t) => ({
            id: String(t.id),
            title: t.title,
            priority: t.priority.toUpperCase() as Task["priority"],
            status: t.status.toUpperCase() as Task["status"],
            assignee: { initials: "?", color: "#69777B" }, // replace when assignments are available
          }));

        setTasks(standalone);
      } catch (err) {
        if (signal.aborted) return;
        console.error("CapabilityPage load error:", err);
        setError(
          "Could not load project data. Make sure the backend is running.",
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    load(ac.signal);
    return () => ac.abort();
  }, [project.id]);

  return (
    <div>
      <button
        onClick={onClose}
        className={`mb-4 text-sm font-medium transition-colors ${
          darkMode
            ? "text-slate-400 hover:text-slate-100"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        ← Back to projects
      </button>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#c74634] text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* izq jerarquía de capabilities */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1
                className={`text-2xl font-bold tracking-tight ${
                  darkMode ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {project.name}
              </h1>
              <p
                className={`mt-1 text-[14px] ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
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

          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="Andromeda_web/Media/Animations/RedGearGIF.gif"
                  alt="Loading"
                  className="h-16 w-16 object-contain"
                />
                <p className="text-sm font-semibold tracking-wide text-[#C74634]">
                  Loading capabilities...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {capabilities.map((cap, i) => (
                  <CapabilityCard
                    key={cap.id}
                    capability={cap}
                    defaultOpen={i === 0}
                  />
                ))}
                {capabilities.length === 0 && (
                  <p
                    className={`text-sm ${
                      darkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    No capabilities yet. Add one to get started.
                  </p>
                )}
              </div>

              {/* tasks no linkeadas a capabilities o features */}
              <div className="mt-8">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2
                      className={`text-[19px] font-bold tracking-tight ${
                        darkMode ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      Tasks
                    </h2>
                    <p
                      className={`mt-1 text-[14px] ${
                        darkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
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
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.length === 0 && (
                    <p
                      className={`text-sm ${
                        darkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      No standalone tasks.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* calendario y agenda */}
        <AgendaSidebar projectId={project.id} />
      </div>
    </div>
  );
}

export default CapabilityPage;
