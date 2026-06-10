import { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { ApiSprint, ApiTask } from "../../../types/api";
import { Chevron } from "../Capabilities/shared";
import SprintTaskRow from "./SprintTaskRow";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-100 text-blue-600",
  planned: "bg-amber-100 text-amber-600",
  completed: "bg-emerald-100 text-emerald-600",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  planned: "Planning",
  completed: "Completed",
};

function formatRange(sprint: ApiSprint): string | null {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (sprint.startDate && sprint.dueDate)
    return `${fmt(sprint.startDate)} – ${fmt(sprint.dueDate)}`;
  if (sprint.dueDate) return `Due ${fmt(sprint.dueDate)}`;
  if (sprint.startDate) return `Starts ${fmt(sprint.startDate)}`;
  return null;
}

interface Props {
  sprint: ApiSprint;
  tasks: ApiTask[];
  defaultOpen?: boolean;
}

// One sprint card: header (toggle) + goal + progress bar (always visible),
// expanding to reveal the sprint's task list. Styled to match CapabilityCard.
function SprintCard({ sprint, tasks, defaultOpen }: Props) {
  const { darkMode } = useTheme();
  const [open, setOpen] = useState(Boolean(defaultOpen));

  const total = tasks.length;
  const range = formatRange(sprint);

  return (
    <div
      className={`overflow-hidden rounded-lg border-l-4 border border-l-[#1a3a4a] ${
        darkMode ? "bg-slate-800/40 border-slate-700" : "bg-[#D7E9E9] border-[#a9c0c0]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className={darkMode ? "text-slate-400" : "text-slate-400"}>
          <Chevron open={open} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[16px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            Sprint
          </p>
          <p className={`truncate text-[16px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
            {sprint.name}
          </p>
          <p className={`mt-1 text-[13px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {range ? `${range} · ` : ""}
            {total} {total === 1 ? "task" : "tasks"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide ${
            STATUS_STYLES[sprint.status] ?? "bg-slate-100 text-slate-500"
          }`}
        >
          {STATUS_LABEL[sprint.status] ?? sprint.status}
        </span>
      </button>

      {/* goal — always visible */}
      {sprint.goal && (
        <div className="px-4 pb-3 pl-11">
          <p className={`text-[14px] leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            {sprint.goal}
          </p>
        </div>
      )}

      {open && (
        <div className="space-y-2 px-4 pb-4 pl-11">
          <p className={`text-[14px] font-bold uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-slate-800"}`}>
            Tasks
          </p>
          {tasks.map((task) => (
            <SprintTaskRow key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <p className={`text-[13px] ${darkMode ? "text-slate-400" : "text-slate-800"}`}>
              No tasks in this sprint yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SprintCard;
