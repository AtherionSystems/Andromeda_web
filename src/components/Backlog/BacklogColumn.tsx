import React from "react";
import TaskCard from "./TaskCard";
import type { ApiTask } from "../../types/api";
import type { Member } from "../../types/project";

interface ColumnProps {
  title: string;
  tasks: ApiTask[];
  onTaskClick?: (task: ApiTask) => void;
  // Opcional: un mapa que relacione TaskID con Miembros si los tienes por separado
  taskAssignments?: Record<number, Member[]>; 
}

const BacklogColumn: React.FC<ColumnProps> = ({ title, tasks, onTaskClick, taskAssignments = {} }) => {
  return (
    <div className="flex w-full max-w-[360px] flex-col rounded-xl bg-[#F4F7F9] p-5">
      <div className="mb-6 flex items-center justify-between px-1">
        <h3 className="font-serif text-2xl text-slate-800">{title}</h3>
        <span className="text-[10px] font-bold tracking-[0.15em] text-red-700 uppercase">
          Sprint 1.2
        </span>
      </div>
      <div className="flex flex-col">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={(selectedTask) => onTaskClick?.(selectedTask)}
            assignedMembers={taskAssignments[task.id] || []} // Pasamos los miembros asignados
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">No Tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default BacklogColumn;