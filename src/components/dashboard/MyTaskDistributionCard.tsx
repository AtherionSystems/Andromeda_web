import Skeleton from "./Skeleton";

export interface MyTaskStatusCounts {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

const STATUS_CONFIG = [
  { key: "todo",        label: "To Do",       short: "Todo",     color: "#94a3b8" },
  { key: "in_progress", label: "In Progress", short: "Progress", color: "#f97316" },
  { key: "review",      label: "Review",      short: "Review",   color: "#3b82f6" },
  { key: "done",        label: "Done",        short: "Done",     color: "#22c55e" },
] as const;

interface Props {
  darkMode: boolean;
  loading: boolean;
  counts: MyTaskStatusCounts;
}

export default function MyTaskDistributionCard({ darkMode, loading, counts }: Props) {
  const total = counts.todo + counts.in_progress + counts.review + counts.done;

  return (
    <div className={`rounded-[10px] px-[18px] py-4 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <div className="flex items-baseline justify-between gap-3 mb-0.5">
        <p className={`m-0 text-[16px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
          My Task Distribution
        </p>
        {!loading && total > 0 && (
          <span className={`text-[11px] font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {total} total
          </span>
        )}
      </div>
      <p className={`m-0 mb-4 text-[10px] uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
        Where your work is right now
      </p>

      {loading ? (
        <Skeleton h={140} darkMode={darkMode} />
      ) : total === 0 ? (
        <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          You have no tasks assigned yet.
        </p>
      ) : (
        <>
          {/* Horizontal stacked bar */}
          <div className={`relative flex h-7 w-full overflow-hidden rounded-md ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
            {STATUS_CONFIG.map((s) => {
              const value = counts[s.key];
              const pct = total > 0 ? (value / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={s.key}
                  className="group relative h-full flex items-center justify-center transition-all"
                  style={{ width: `${pct}%`, background: s.color }}
                  title={`${s.label}: ${value} (${Math.round(pct)}%)`}
                >
                  {pct >= 8 && (
                    <span className="text-[10px] font-bold text-white drop-shadow-sm">
                      {Math.round(pct)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* KPI tiles */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {STATUS_CONFIG.map((s) => {
              const value = counts[s.key];
              return (
                <div
                  key={s.key}
                  className={`rounded-lg border px-2.5 py-2 flex flex-col gap-1 ${
                    darkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-100 bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className={`text-[9px] font-bold uppercase tracking-wide truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {s.short}
                    </span>
                  </div>
                  <span className={`text-[20px] font-bold leading-none ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`} style={{ color: value > 0 ? s.color : undefined }}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
