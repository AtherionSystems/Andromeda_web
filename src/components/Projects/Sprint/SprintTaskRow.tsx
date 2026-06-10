import { useTheme } from "../../../contexts/useTheme";
import type { ApiTask } from "../../../types/api";

// Small colored dot per task status — keeps the row scannable at a glance.
const STATUS_DOT: Record<string, string> = {
  done: "bg-emerald-500",
  in_progress: "bg-blue-500",
  review: "bg-amber-500",
  todo: "bg-slate-400",
};

// One task inside a sprint. Mirrors the StoryRow styling so the sprint board
// reads consistently with the capabilities hierarchy.
function SprintTaskRow({ task }: { task: ApiTask }) {
  const { darkMode } = useTheme();
  const meta = [task.status, task.priority].filter(Boolean).join(" · ");
  const dot = STATUS_DOT[task.status] ?? "bg-slate-400";

  return (
    <div
      className={`flex items-start gap-3 rounded-md border-l-4 border border-l-[#9cc4dc] px-3 py-2.5 ${
        darkMode ? "bg-slate-800/60 border-slate-700" : "bg-[#f6fafd] border-[#e6f0f7]"
      }`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Task
        </p>
        <p className={`text-[13px] leading-snug ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
          {task.title}
        </p>
        {meta && (
          <p
            className={`mt-1 text-[10px] font-semibold tracking-[1px] capitalize ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {meta.replace(/_/g, " ")}
          </p>
        )}
      </div>

      {typeof task.storyPoints === "number" && (
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
          }`}
        >
          {task.storyPoints} pts
        </span>
      )}
    </div>
  );
}

export default SprintTaskRow;
