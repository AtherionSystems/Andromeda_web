import React from "react";
import type { ApiTask } from "../../types/api";
import type { Member } from "../../types/project";
import MemberAvatars from "../Projects/MemberAvatars"; // Ajusta la ruta según tu carpeta

interface TaskCardProps {
  task: ApiTask;
  assignedMembers?: Member[]; // Recibimos los miembros asignados
  onClick: (task: ApiTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, assignedMembers = [], onClick }) => {
  const priorityStyles: Record<string, string> = {
    critical: "#C74634",
    high: "#FFB13F",
    medium: "#00688C",
    low: "#8FBFD0",
  };

  const barColor = priorityStyles[task.priority] || "#cbd5e1";

  return (
    <div 
      onClick={() => onClick(task)}
      className="group relative mb-4 flex flex-col border-l-2 border-transparent bg-white p-5 shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      <div className="absolute left-0 top-0 h-full w-[3px]" style={{ backgroundColor: barColor }} />

      <div className="flex items-start justify-between mb-1">
        <div className="flex flex-col">
          <span className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-black">
            Project: {task.projectName || `#${task.projectId ?? "N/A"}`}
          </span>
        </div>
        {(task.priority === "high" || task.priority === "critical") && (
          <span className={`${task.priority === "critical" ? "text-purple-600" : "text-red-600"} font-bold text-lg leading-none`}>
            !
          </span>
        )}
      </div>

      <h4 className="mt-1 text-[14px] font-semibold leading-snug text-slate-900 group-hover:text-[#69777B] transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex items-end justify-between border-t border-slate-50 pt-3">
        {/* Avatares de los miembros asignados */}
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Assignees</span>
          <MemberAvatars members={assignedMembers} max={3} />
        </div>

        <div className="flex flex-col items-end">
          {task.storyPoints && (
            <div className="flex items-center gap-1 mb-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600">
                {task.storyPoints}
              </span>
              <span className="text-[8px] font-bold uppercase text-slate-400">Pts</span>
            </div>
          )}
          {task.dueDate && (
            <span className="text-[9px] font-medium text-slate-400 italic">
              Due: {new Date(task.dueDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;