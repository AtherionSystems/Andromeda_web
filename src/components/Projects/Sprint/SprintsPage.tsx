import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { ApiProject, ApiSprint, ApiTask } from "../../../types/api";
import { getProjectSprints } from "../../../api/projects";
import { getSprintTasks } from "../../../api/tasks";
import AgendaSidebar from "../Capabilities/AgendaSidebar";
import SprintCard from "./SprintCard";

interface SprintsPageProps {
  project: ApiProject;
  onClose: () => void;
}

// Sort: active sprints first, then planned, then completed; by start date within.
const STATUS_ORDER: Record<string, number> = { active: 0, planned: 1, completed: 2 };

function SprintsPage({ project, onClose }: SprintsPageProps) {
  const { darkMode } = useTheme();
  const [sprints, setSprints] = useState<ApiSprint[]>([]);
  const [tasksBySprint, setTasksBySprint] = useState<Record<number, ApiTask[]>>({});
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
        const all = await getProjectSprints(project.id);
        if (signal.aborted) return;

        const sorted = [...all].sort((a, b) => {
          const d = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
          if (d !== 0) return d;
          return (a.startDate ?? "").localeCompare(b.startDate ?? "");
        });
        setSprints(sorted);

        // Load each sprint's tasks in parallel so progress bars and counts are
        // accurate up front (sprint counts are small for this project).
        const entries = await Promise.all(
          sorted.map(
            async (s) =>
              [s.id, await getSprintTasks(project.id, s.id).catch(() => [])] as const,
          ),
        );
        if (signal.aborted) return;
        setTasksBySprint(Object.fromEntries(entries));
      } catch (err) {
        if (signal.aborted) return;
        console.error("SprintsPage load error:", err);
        setError("Could not load sprints. Make sure the backend is running.");
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
        className={`mb-4 text-base font-semibold transition-colors ${
          darkMode ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"
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
        {/* left: sprint cycles */}
        <div className="min-w-0 flex-1">
          <div className="mb-6">
            
            <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {project.name}
            </h1>
            <p className={`mt-1 text-[14px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Manage your sprints and track progress here. Click on a sprint to see its tasks and details.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/Andromeda_web/Media/Animations/RedGearGIF.gif"
                  alt="Loading"
                  className="h-16 w-16 object-contain"
                />
                <p className="text-sm font-semibold tracking-wide text-[#C74634]">
                  Loading sprints...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sprints.map((sprint, i) => (
                <SprintCard
                  key={sprint.id}
                  sprint={sprint}
                  tasks={tasksBySprint[sprint.id] ?? []}
                  defaultOpen={i === 0}
                />
              ))}
              {sprints.length === 0 && (
                <p
                  className={`rounded-lg px-4 py-6 text-center text-sm ${
                    darkMode ? "bg-slate-800/40 text-slate-400" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  No sprints yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* right: calendar + agenda */}
        <AgendaSidebar projectId={project.id} />
      </div>
    </div>
  );
}

export default SprintsPage;
