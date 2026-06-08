import { useState } from "react";
import type { EnrichedTask } from "./types";
import TaskDetailModal from "../Backlog/TaskDetailModal";

const PRIORITY_ACCENT: Record<string, string> = {
  critical: "#c74634",
  high:     "#1a3a4a",
  medium:   "#2a4a5a",
  low:      "#4a3f7a",
};

function resolveDate(t: EnrichedTask): Date | null {
  const raw = t.dueDate ?? t.startDate ?? t.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function getUpcomingTasks(tasks: EnrichedTask[]): EnrichedTask[] {
  return tasks
    .filter((t) => resolveDate(t) !== null)
    .sort((a, b) => resolveDate(a)!.getTime() - resolveDate(b)!.getTime());
}

interface EventItemProps {
  task: EnrichedTask;
  highlight: boolean;
  darkMode: boolean;
  onSelect: (task: EnrichedTask) => void;
}

function EventItem({ task, highlight, darkMode, onSelect }: EventItemProps) {
  const due         = resolveDate(task)!;
  const day         = due.getDate();
  const month       = due.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const accentColor = PRIORITY_ACCENT[task.priority] ?? "#2a4a5a";

  return (
    <div
      onClick={() => onSelect(task)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 cursor-pointer transition-colors hover:bg-[rgba(42,106,90,0.1)]
        ${highlight
          ? darkMode ? "bg-[rgba(42,106,90,0.18)]" : "bg-[#e8f4f2]"
          : "bg-transparent"}`}
    >
      <div className="shrink-0 w-14 rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
        <div className="py-1 text-center" style={{ background: accentColor }}>
          <span className="text-[10px] font-extrabold text-white tracking-[1px]">{month}</span>
        </div>
        <div className="bg-white text-center py-1">
          <span className="text-[22px] font-extrabold text-[#1a3a4a] leading-none">{day}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`m-0 text-[14px] font-bold leading-snug truncate ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
          {task.title}
        </p>
        <p className={`m-0 mt-1 text-[12px] truncate ${darkMode ? "text-slate-500" : "text-[#6a8a9a]"}`}>
          {task.projectName} &bull; {task.priority.toUpperCase()} &bull; {task.status.replace("_", " ")}
        </p>
      </div>
    </div>
  );
}

interface UpcomingCardProps {
  darkMode: boolean;
  tasks: EnrichedTask[];
  loading?: boolean;
}

const PAGE_SIZE = 5;

export default function UpcomingCard({ darkMode, tasks, loading }: UpcomingCardProps) {
  const [selectedTask, setSelectedTask] = useState<EnrichedTask | null>(null);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [page, setPage] = useState(0);

  const monthLabel = viewDate.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const yearLabel  = viewDate.getFullYear();

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setPage(0);
  }
  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setPage(0);
  }

  const upcoming = getUpcomingTasks(tasks).filter((t) => {
    const due = resolveDate(t)!;
    return due.getFullYear() === viewDate.getFullYear() && due.getMonth() === viewDate.getMonth();
  });
  const totalPages = Math.max(1, Math.ceil(upcoming.length / PAGE_SIZE));
  const visible    = upcoming.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const btnBase = `w-7 h-7 rounded-md border text-[11px] font-semibold flex items-center justify-center cursor-pointer transition-colors`;
  const btnActive = darkMode ? "bg-[#1a3a4a] border-[#1a3a4a] text-white" : "bg-[#1a3a4a] border-[#1a3a4a] text-white";
  const btnIdle   = darkMode ? "bg-transparent border-[#1e293b] text-slate-400 hover:border-slate-500" : "bg-transparent border-[#dce8ea] text-[#6a8a9a] hover:border-[#a0bfc4]";
  const btnDisabled = "opacity-30 cursor-default";

  return (
    <>
    <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    <div className={`rounded-[10px] overflow-hidden border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-[#E4F1F7] border-[#cdd8db]"}`}>
      {/* Calendar header strip */}
      <div className="bg-[#1a3a4a] px-4 py-2.5 flex items-center justify-between">
        <button onClick={prevMonth} className="text-white/70 hover:text-white bg-transparent border-0 cursor-pointer p-0 leading-none text-lg">‹</button>
        <p className="m-0 text-[12px] font-extrabold text-white tracking-[1.5px]">
          {monthLabel} {yearLabel}
        </p>
        <button onClick={nextMonth} className="text-white/70 hover:text-white bg-transparent border-0 cursor-pointer p-0 leading-none text-lg">›</button>
      </div>

      {/* Title row */}
      <div className="flex justify-between items-center px-3.5 pt-3 pb-1">
        <span className={`text-[13px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
          Upcoming Due Dates
        </span>
        <span className={`text-[10px] font-semibold tracking-[0.3px] ${darkMode ? "text-slate-500" : "text-[#6a8a9a]"}`}>
          {upcoming.length} task{upcoming.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Events */}
      <div className="px-2 pt-1 min-h-[340px]">
        {loading ? (
          <div className="flex flex-col gap-2 px-2 pt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-14 rounded-[10px] animate-[shimmer_1.4s_infinite] ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className={`text-[12px] font-medium ${darkMode ? "text-slate-500" : "text-[#6a8a9a]"}`}>No due dates this month</p>
            <p className={`text-[10px] ${darkMode ? "text-slate-600" : "text-slate-400"}`}>Try navigating to another month.</p>
          </div>
        ) : (
          visible.map((task, i) => (
            <EventItem key={task.id} task={task} highlight={i === 0 && page === 0} darkMode={darkMode} onSelect={setSelectedTask} />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-inherit">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className={`${btnBase} ${page === 0 ? btnDisabled + " " + btnIdle : btnIdle}`}
          >‹</button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`${btnBase} ${i === page ? btnActive : btnIdle}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
            className={`${btnBase} ${page === totalPages - 1 ? btnDisabled + " " + btnIdle : btnIdle}`}
          >›</button>
        </div>
      )}

    </div>
    </>
  );
}
