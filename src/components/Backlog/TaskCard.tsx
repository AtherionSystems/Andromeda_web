import React from "react";
import type { ApiTask } from "../../types/api";

interface TaskCardProps {
  task: ApiTask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // Mapeo de colores según tu tipo TaskPriority
  const priorityStyles: Record<string, string> = {
    critical: "bg-purple-600",
    high: "bg-red-500",
    medium: "bg-amber-400",
    low: "bg-slate-200",
  };

  const barColor = priorityStyles[task.priority] || "bg-slate-200";

  return (
    <div className="group relative mb-4 flex flex-col border-l-2 border-transparent bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* Barra lateral basada en tu TaskPriority */}
      <div className={`absolute left-0 top-0 h-full w-[3px] ${barColor}`} />

      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Task-{task.id.toString().padStart(3, '0')}
        </span>
        {(task.priority === "high" || task.priority === "critical") && (
          <span className={`${task.priority === "critical" ? "text-purple-600" : "text-red-600"} font-bold text-lg leading-none`}>
            !
          </span>
        )}
      </div>

      <h4 className="mt-2 text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="flex items-center gap-2">
          {task.storyPoints && (
            <div className="flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                {task.storyPoints}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-400">Pts</span>
            </div>
          )}
        </div>

        {task.dueDate && (
          <span className="text-[10px] font-medium text-slate-400">
            Due: {new Date(task.dueDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;