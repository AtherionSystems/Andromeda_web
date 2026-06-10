import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import type { ApiProject } from "../../types/api";
import type { Capability, Task } from "./Capabilities/types";
import { getCapabilities, getFeatures, getStories } from "../../api/capabilities";
import { getProjectTasks } from "../../api/tasks";
import CapabilityCard from "./Capabilities/CapabilityCard";
import TaskCard from "./Capabilities/TaskCard";
import AgendaSidebar from "./Capabilities/AgendaSidebar";
import NewCapabilityModal from "./Capabilities/NewCapabilityModal";
import NewFeatureModal from "./Capabilities/NewFeatureModal";
import NewStoryModal from "./Capabilities/NewStoryModal";

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
  const [taskPage, setTaskPage] = useState(0);
  const [addCapabilityOpen, setAddCapabilityOpen] = useState(false);
  const [addFeatureCapId, setAddFeatureCapId] = useState<string | null>(null);
  const [addStoryTarget, setAddStoryTarget] = useState<{
    capabilityId: string;
    featureId: string;
  } | null>(null);
  // Feature ids whose stories are currently being fetched (for the spinner).
  const [storiesLoading, setStoriesLoading] = useState<Set<string>>(new Set());
  // Feature ids whose stories have already been loaded (avoid refetching).
  const loadedStoriesRef = useRef<Set<string>>(new Set());

  const TASKS_PER_PAGE = 5;
  const taskPageCount = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));
  const safeTaskPage = Math.min(taskPage, taskPageCount - 1);
  const visibleTasks = tasks.slice(
    safeTaskPage * TASKS_PER_PAGE,
    safeTaskPage * TASKS_PER_PAGE + TASKS_PER_PAGE,
  );

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

        // Capabilities and features live in separate endpoints. Load features
        // per capability; stories are loaded lazily when a feature is expanded.
        const enrichedCaps = await Promise.all(
          caps.map(async (cap) => {
            const feats = await getFeatures(project.id, cap.id).catch(() => []);
            return { ...cap, features: feats.map((f) => ({ ...f, stories: [] })) };
          }),
        );

        if (signal.aborted) return;

        setCapabilities(enrichedCaps);

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

  // Lazily fetch a feature's stories the first time it's expanded.
  async function handleExpandFeature(capabilityId: string, featureId: string) {
    if (loadedStoriesRef.current.has(featureId)) return;
    loadedStoriesRef.current.add(featureId);
    setStoriesLoading((prev) => new Set(prev).add(featureId));
    try {
      const stories = await getStories(project.id, capabilityId, featureId);
      setCapabilities((prev) =>
        prev.map((c) =>
          c.id === capabilityId
            ? {
                ...c,
                features: c.features.map((f) =>
                  f.id === featureId ? { ...f, stories } : f,
                ),
              }
            : c,
        ),
      );
    } catch (err) {
      console.error("Failed to load stories:", err);
      loadedStoriesRef.current.delete(featureId); // allow a retry
    } finally {
      setStoriesLoading((prev) => {
        const next = new Set(prev);
        next.delete(featureId);
        return next;
      });
    }
  }

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
              onClick={() => setAddCapabilityOpen(true)}
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
                    onAddFeature={setAddFeatureCapId}
                    onAddStory={(capabilityId, featureId) =>
                      setAddStoryTarget({ capabilityId, featureId })
                    }
                    onExpandFeature={handleExpandFeature}
                    loadingStoryIds={storiesLoading}
                  />
                ))}
                {capabilities.length === 0 && (
                  <p
                    className={`rounded-lg px-4 py-6 text-center text-sm ${
                      darkMode
                        ? "bg-slate-800/40 text-slate-400"
                        : "bg-slate-200 text-slate-600"
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
                  {visibleTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.length === 0 && (
                    <p
                      className={`rounded-lg px-4 py-6 text-center text-sm ${
                        darkMode
                          ? "bg-slate-800/40 text-slate-400"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      No standalone tasks.
                    </p>
                  )}
                </div>

                {taskPageCount > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTaskPage((p) => Math.max(0, p - 1))}
                      disabled={safeTaskPage === 0}
                      aria-label="Previous page"
                      className={`flex h-7 w-7 items-center justify-center rounded text-lg leading-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        darkMode
                          ? "text-slate-400 hover:bg-slate-800"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      ‹
                    </button>

                    {Array.from({ length: taskPageCount }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTaskPage(i)}
                        aria-label={`Page ${i + 1}`}
                        aria-current={i === safeTaskPage}
                        className={`flex h-7 min-w-[28px] items-center justify-center rounded px-1 text-[12px] font-medium transition-colors ${
                          i === safeTaskPage
                            ? "bg-[#c74634] text-white"
                            : darkMode
                              ? "text-slate-400 hover:bg-slate-800"
                              : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setTaskPage((p) => Math.min(taskPageCount - 1, p + 1))
                      }
                      disabled={safeTaskPage === taskPageCount - 1}
                      aria-label="Next page"
                      className={`flex h-7 w-7 items-center justify-center rounded text-lg leading-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        darkMode
                          ? "text-slate-400 hover:bg-slate-800"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* calendario y agenda */}
        <AgendaSidebar projectId={project.id} />
      </div>

      {addCapabilityOpen && (
        <NewCapabilityModal
          projectId={project.id}
          onClose={() => setAddCapabilityOpen(false)}
          onCreated={(cap) => setCapabilities((prev) => [...prev, cap])}
        />
      )}

      {addFeatureCapId && (
        <NewFeatureModal
          projectId={project.id}
          capabilityId={addFeatureCapId}
          onClose={() => setAddFeatureCapId(null)}
          onCreated={(feature) =>
            setCapabilities((prev) =>
              prev.map((c) =>
                c.id === addFeatureCapId
                  ? { ...c, features: [...c.features, feature] }
                  : c,
              ),
            )
          }
        />
      )}

      {addStoryTarget && (
        <NewStoryModal
          projectId={project.id}
          capabilityId={addStoryTarget.capabilityId}
          featureId={addStoryTarget.featureId}
          onClose={() => setAddStoryTarget(null)}
          onCreated={(story) =>
            setCapabilities((prev) =>
              prev.map((c) =>
                c.id === addStoryTarget.capabilityId
                  ? {
                      ...c,
                      features: c.features.map((f) =>
                        f.id === addStoryTarget.featureId
                          ? { ...f, stories: [...f.stories, story] }
                          : f,
                      ),
                    }
                  : c,
              ),
            )
          }
        />
      )}
    </div>
  );
}

export default CapabilityPage;
