import React, { useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskCard from "./TaskCard";
import type { ApiTask } from "../../types/api";
import type { Member } from "../../types/project";

const TASKS_PER_PAGE = 5;

interface ColumnProps {
  title: string;
  subtitle?: string;
  tasks: ApiTask[];
  onTaskClick?: (task: ApiTask) => void;
  // Opcional: un mapa que relacione TaskID con Miembros si los tienes por separado
  taskAssignments?: Record<number, Member[]>; 
}

const BacklogColumn: React.FC<ColumnProps> = ({
  title,
  subtitle = "All Sprints",
  tasks,
  onTaskClick,
  taskAssignments = {},
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const { darkMode } = useTheme();

  const totalPages = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));
  const currentPage = Math.min(pageIndex, totalPages - 1);
  const startIndex = currentPage * TASKS_PER_PAGE;
  const visibleTasks = tasks.slice(startIndex, startIndex + TASKS_PER_PAGE);
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;

  return (
    <div className={`flex h-full min-h-0 w-full max-w-[360px] flex-col rounded-xl p-5 overflow-hidden ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-[#F4F7F9] text-slate-800'}`}>
      <div className="mb-6 px-1">
        <h3 className="font-serif text-2xl">{title}</h3>
        <div className="mt-2 flex flex-col items-start gap-2">
          <span className={`text-[10px] font-bold tracking-[0.15em] uppercase ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
            {subtitle}
          </span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
        {visibleTasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={(selectedTask) => onTaskClick?.(selectedTask)}
            assignedMembers={taskAssignments[task.id] || []}
            index={startIndex + i}
          />
        ))}
        {tasks.length === 0 && (
          <div className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
            <p className={`text-[11px] font-medium uppercase tracking-widest ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>No Tasks</p>
          </div>
        )}
      </div>

      <div className={`mt-4 flex items-center justify-center gap-1 rounded-full px-1 py-1 shadow-sm flex-shrink-0 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <button
          type="button"
          onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
          disabled={!hasPreviousPage}
          aria-label={`Previous ${title} tasks`}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className={`min-w-10 text-center text-[10px] font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
          {currentPage + 1}/{totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPageIndex((current) => Math.min(totalPages - 1, current + 1))}
          disabled={!hasNextPage}
          aria-label={`Next ${title} tasks`}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
export default BacklogColumn;