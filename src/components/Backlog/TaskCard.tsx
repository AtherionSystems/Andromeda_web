import React from "react";
import { useTheme } from "../../contexts/useTheme";
import type { ApiTask } from "../../types/api";
import type { Member } from "../../types/project";
import MemberAvatars from "../Projects/MemberAvatars"; 

interface TaskCardProps {
  task: ApiTask;
  assignedMembers?: Member[]; // Recibimos los miembros asignados
  onClick: (task: ApiTask) => void;
  index?: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, assignedMembers = [], onClick, index }) => {
  const priorityStyles: Record<string, string> = {
    critical: "#C74634",
    high: "#FFB13F",
    medium: "#00688C",
    low: "#8FBFD0",
  };

  const barColor = priorityStyles[task.priority] || "#cbd5e1";

  const { darkMode } = useTheme();

  return (
    <div className="card-entrance mb-4" style={{ animationDelay: `${(index ?? 0) * 70}ms` }}>
    <div
      onClick={() => onClick(task)}
      className={`group relative flex flex-col border-l-2 border-transparent p-5 shadow-sm transition-all hover:shadow-md cursor-pointer backdrop-blur-sm ${darkMode ? 'bg-slate-900/75 text-slate-100' : 'bg-white/75 text-slate-900'} rounded`}
    >
      <div className="absolute left-0 top-0 h-full w-[3px] borderradius rounded-20px" style={{ backgroundColor: barColor }} />

      <div className="flex items-start justify-between mb-1">
        <div className="flex flex-col">
          <span className={`mb-1 text-[9px] font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-200' : 'text-black'}`}>
            Project: {task.projectName || `#${task.projectId ?? "N/A"}`}
          </span>
        </div>
        {(task.priority === "high" || task.priority === "critical") && (
          <span className={`${task.priority === "critical" ? "text-purple-600" : "text-red-600"} font-bold text-lg leading-none`}>
            !
          </span>
        )}
      </div>

      <h4 className={`mt-1 text-[14px] font-semibold leading-snug group-hover:text-[#69777B] transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
        {task.title}
      </h4>

      {task.description && (
        <p className={`mt-2 text-[11px] leading-relaxed line-clamp-2 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
          {task.description}
        </p>
      )}

      <div className={`mt-4 flex items-end justify-between border-t pt-3 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
        {/* Avatares de los miembros asignados */}
        <div className="flex flex-col">
          <span className={`text-[8px] font-bold uppercase tracking-tighter mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>Assignees</span>
          <MemberAvatars members={assignedMembers} max={3} />
        </div>

        <div className="flex flex-col items-end">
          {task.storyPoints && (
            <div className="flex items-center gap-1 mb-1">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-600'}`}>
                {task.storyPoints}
              </span>
              <span className="text-[8px] font-bold uppercase text-slate-400">Pts</span>
            </div>
          )}
          {task.dueDate && (
            <span className={`text-[9px] font-medium italic ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>
              Due: {new Date(task.dueDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default TaskCard;