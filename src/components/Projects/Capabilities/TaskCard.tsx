import { useTheme } from "../../../contexts/useTheme";
import type { Task } from "./types";
import { Avatar } from "./shared";
import { PRIORITY_COLOR } from "./styles";

function TaskCard({ task }: { task: Task }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-semibold tracking-[1px] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
          {task.id}
        </p>
        <p className={`mt-0.5 truncate text-[13px] font-medium ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          {task.title}
        </p>
        <p className={`text-[11px] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
          Prio:{" "}
          <span style={{ color: PRIORITY_COLOR[task.priority] }} className="font-semibold">
            {task.priority}
          </span>
        </p>
      </div>
      <Avatar initials={task.assignee.initials} color={task.assignee.color} />
    </div>
  );
}

export default TaskCard;
