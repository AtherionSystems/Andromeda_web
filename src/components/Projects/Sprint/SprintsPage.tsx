import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { ApiProject, ApiSprint, ApiTask } from "../../../types/api";
import { getProjectSprints } from "../../../api/projects";
import { getSprintTasks } from "../../../api/tasks";
import AgendaSidebar from "../Capabilities/AgendaSidebar";
import SprintCard from "./SprintCard";
import NewSprintModal from "../Sprint/NewSprintModal";

interface SprintsPageProps {
  project: ApiProject;
  onClose: () => void;
}

interface SprintTaskEntry {
  sprintId: number;
  sprintName: string;
  tasks?: ApiTask[];
}

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  planned: 1,
  completed: 2,
};

const STATUS_BAR: Record<string, string> = {
  active: "#1D9E75",
  planned: "#378ADD",
  completed: "#888780",
};

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  active: { bg: "#dcfce7", text: "#15803d", label: "Active" },
  planned: { bg: "#dbeafe", text: "#2563eb", label: "Planning" },
  completed: { bg: "#f1f5f9", text: "#64748b", label: "Completed" },
};

const STATUS_CARD_STYLE: Record<string, { border: string; bg: string }> = {
  active: { border: "border-l-[#1D9E75] border-[#9FE1CB]", bg: "bg-[#E1F5EE]" },
  planned: {
    border: "border-l-[#378ADD] border-[#B5D4F4]",
    bg: "bg-[#E6F1FB]",
  },
  completed: {
    border: "border-l-[#888780] border-[#D3D1C7]",
    bg: "bg-[#F1EFE8]",
  },
};

function formatRange(sprint: ApiSprint): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  if (sprint.startDate && sprint.dueDate)
    return `${fmt(sprint.startDate)} – ${fmt(sprint.dueDate)}`;
  if (sprint.dueDate) return `Due ${fmt(sprint.dueDate)}`;
  if (sprint.startDate) return `Starts ${fmt(sprint.startDate)}`;
  return "No dates";
}

function SprintGridCard({
  sprint,
  tasks,
  active,
  onClick,
}: {
  sprint: ApiSprint;
  tasks: ApiTask[];
  active: boolean;
  onClick: () => void;
}) {
  const { darkMode } = useTheme();
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const badge = STATUS_BADGE[sprint.status] ?? {
    bg: "#f1f5f9",
    text: "#64748b",
    label: sprint.status,
  };
  const bar = STATUS_BAR[sprint.status] ?? "#888780";
  const cardStyle = STATUS_CARD_STYLE[sprint.status] ?? {
    border: "border-[#D3D1C7] border-l-[#888780]",
    bg: "bg-[#F1EFE8]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border-l-4 border transition-all ${
        darkMode
          ? active
            ? "border-slate-500 bg-slate-700 border-l-[var(--status-color)]"
            : "border-slate-700 bg-slate-800/60 hover:bg-slate-800"
          : `${cardStyle.border} ${cardStyle.bg} ${active ? "ring-2 ring-offset-1 ring-[#9cc6df]" : "hover:brightness-95"}`
      } ${sprint.status === "completed" ? "opacity-70" : ""}`}
      style={{ padding: "14px" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: badge.bg, color: badge.text }}
        >
          {badge.label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={darkMode ? "text-slate-500" : "text-slate-400"}
          />
        </svg>
      </div>
      <p
        className={`text-[13px] font-semibold truncate mb-1 ${darkMode ? "text-slate-100" : "text-slate-800"}`}
      >
        {sprint.name}
      </p>
      <p
        className={`text-[11px] mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
      >
        {formatRange(sprint)}
      </p>
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 rounded-full h-1.5 overflow-hidden ${darkMode ? "bg-slate-700" : "bg-white/70"}`}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: bar }}
          />
        </div>
        <span
          className={`text-[11px] shrink-0 tabular-nums ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          {done}/{total}
        </span>
      </div>
    </button>
  );
}

function SprintsPage({ project, onClose }: SprintsPageProps) {
  const { darkMode } = useTheme();
  const [sprints, setSprints] = useState<ApiSprint[]>([]);
  const [tasksBySprint, setTasksBySprint] = useState<Record<number, ApiTask[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
          const d =
            (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
          if (d !== 0) return d;
          return (a.startDate ?? "").localeCompare(b.startDate ?? "");
        });
        setSprints(sorted);

        const first = sorted.find(
          (s) => s.status === "active" || s.status === "planned",
        );
        if (first) setSelectedId(first.id);

        const entries = await Promise.all(
          sorted.map(async (s) => {
            const raw = await getSprintTasks(project.id, s.id).catch(() => []);
            const tasks =
              Array.isArray(raw) &&
              (raw as SprintTaskEntry[])[0]?.tasks !== undefined
                ? (raw as SprintTaskEntry[]).flatMap((e) => e.tasks ?? [])
                : (raw as ApiTask[]);
            return [s.id, tasks] as const;
          }),
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

  // ── Add a newly created sprint to state without a full reload ──────────────
  function handleSprintCreated(sprint: ApiSprint) {
    setSprints((prev) => {
      const updated = [...prev, sprint].sort((a, b) => {
        const d = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
        if (d !== 0) return d;
        return (a.startDate ?? "").localeCompare(b.startDate ?? "");
      });
      return updated;
    });
    setTasksBySprint((prev) => ({ ...prev, [sprint.id]: [] }));
    setSelectedId(sprint.id);
  }

  const selectedSprint = sprints.find((s) => s.id === selectedId) ?? null;

  return (
    <div>
      <button
        onClick={onClose}
        className={`mb-4 text-base font-semibold transition-colors ${
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
        {/* ── Left: grid + selected sprint detail ── */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1
                className={`text-2xl font-bold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}
              >
                {project.name}
              </h1>
              <p
                className={`mt-1 text-[14px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Manage your sprints and track progress here. Click on a sprint
                to see its tasks and details.
              </p>
            </div>

            {/* New Sprint button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{ background: "#C74634" }}
              className="flex shrink-0 items-center gap-1.5 px-3.5 h-8 text-white border-none rounded text-[12px] font-medium cursor-pointer hover:opacity-90 transition-opacity"
            >
              + New Sprint
            </button>
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
          ) : sprints.length === 0 ? (
            <div
              className={`rounded-lg px-4 py-10 text-center ${darkMode ? "bg-slate-800/40" : "bg-slate-100"}`}
            >
              <p
                className={`text-sm mb-3 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                No sprints yet.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                style={{ background: "#C74634" }}
                className="px-4 py-2 text-white rounded text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                + Create first sprint
              </button>
            </div>
          ) : (
            <>
              {/* Compact grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
                {sprints.map((sprint) => (
                  <SprintGridCard
                    key={sprint.id}
                    sprint={sprint}
                    tasks={tasksBySprint[sprint.id] ?? []}
                    active={sprint.id === selectedId}
                    onClick={() =>
                      setSelectedId((prev) =>
                        prev === sprint.id ? null : sprint.id,
                      )
                    }
                  />
                ))}
              </div>

              {/* Selected sprint detail */}
              {selectedSprint && (
                <SprintCard
                  key={selectedSprint.id}
                  sprint={selectedSprint}
                  tasks={tasksBySprint[selectedSprint.id] ?? []}
                  project={project}
                  defaultOpen
                  onEdited={(updated) => {
                    setSprints((prev) =>
                      prev
                        .map((s) => (s.id === updated.id ? updated : s))
                        .sort((a, b) => {
                          const d = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
                          if (d !== 0) return d;
                          return (a.startDate ?? "").localeCompare(b.startDate ?? "");
                        }),
                    );
                  }}
                  onDeleted={(sprintId) => {
                    setSprints((prev) => prev.filter((s) => s.id !== sprintId));
                    setSelectedId(null);
                    setTasksBySprint((prev) => {
                      const next = { ...prev };
                      delete next[sprintId];
                      return next;
                    });
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* ── Right: calendar + agenda ── */}
        <AgendaSidebar projectId={project.id} />
      </div>

      {/* ── New Sprint Modal ── */}
      <NewSprintModal
        isOpen={modalOpen}
        project={project}
        onClose={() => setModalOpen(false)}
        onCreated={handleSprintCreated}
      />
    </div>
  );
}

export default SprintsPage;
