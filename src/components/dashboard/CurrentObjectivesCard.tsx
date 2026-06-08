import { useState } from "react";
import type { EnrichedTask } from "./types";
import { PRIORITY_BADGE, taskCode } from "./types";
import Skeleton from "./Skeleton";

function ObjectiveItem({ task }: { task: EnrichedTask }) {
  const pb = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium;
  return (
    <div className="py-[11px] border-b border-[#f0f4f5]">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="m-0 mb-0.5 text-[9px] tracking-[0.8px] text-[#6a8a9a] uppercase">
            {taskCode(task)}
          </p>
          <p className="m-0 text-[11px] font-semibold text-[#1a3a4a] leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-[3px] mb-0 text-[10px] text-[#6a8a9a] leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
              {task.description}
            </p>
          )}
        </div>
        <span
          className="text-[9px] font-bold shrink-0 px-[7px] py-[2px] rounded-[4px] tracking-[0.3px]"
          style={{ background: pb.bg, color: pb.color }}
        >
          {task.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

interface CurrentObjectivesCardProps {
  loading: boolean;
  darkMode: boolean;
  objectives: EnrichedTask[];
}

export default function CurrentObjectivesCard({ loading, darkMode, objectives }: CurrentObjectivesCardProps) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className={`rounded-[10px] px-4 py-[14px] min-w-0 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[13px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>Current Objectives</span>
        <span className={`text-[9px] font-bold px-2 py-[3px] rounded-[4px] text-[#2563eb] tracking-[0.4px] ${darkMode ? "bg-blue-500/15" : "bg-[#eff6ff]"}`}>
          OPEN
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 mt-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} h={48} darkMode={darkMode} />)}
        </div>
      ) : objectives.length === 0 ? (
        <p className={`text-xs text-center py-4 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          All tasks are completed.
        </p>
      ) : (
        <>
          {(showAll ? objectives : objectives.slice(0, 3)).map((t) => (
            <ObjectiveItem key={t.id} task={t} />
          ))}
          {objectives.length > 3 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-3 w-full text-[10px] text-[#c74634] bg-transparent border-none cursor-pointer font-bold tracking-[0.5px] uppercase text-center p-0"
            >
              {showAll ? "Hide Objectives" : `View All Objectives (${objectives.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
