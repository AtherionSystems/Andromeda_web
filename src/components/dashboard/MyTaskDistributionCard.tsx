import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import Skeleton from "./Skeleton";

export interface MyTaskStatusCounts {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

const STATUS_CONFIG = [
  { key: "todo",        label: "To Do",       color: "#94a3b8" },
  { key: "in_progress", label: "In Progress", color: "#f97316" },
  { key: "review",      label: "Review",      color: "#3b82f6" },
  { key: "done",        label: "Done",        color: "#22c55e" },
] as const;

const chartConfig = {
  todo:        { label: "To Do",       color: "#94a3b8" },
  in_progress: { label: "In Progress", color: "#f97316" },
  review:      { label: "Review",      color: "#3b82f6" },
  done:        { label: "Done",        color: "#22c55e" },
} satisfies ChartConfig;

interface Props {
  darkMode: boolean;
  loading: boolean;
  counts: MyTaskStatusCounts;
}

export default function MyTaskDistributionCard({ darkMode, loading, counts }: Props) {
  const total = counts.todo + counts.in_progress + counts.review + counts.done;
  const data = STATUS_CONFIG.map((s) => ({
    name: s.label,
    value: counts[s.key],
    color: s.color,
  }));

  return (
    <div className={`rounded-[10px] px-[18px] py-4 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <p className={`m-0 mb-0.5 text-[16px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
        My Task Distribution
      </p>
      <p className={`m-0 mb-4 text-[10px] uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
        Personal tasks grouped by status
      </p>

      {loading ? (
        <Skeleton h={180} darkMode={darkMode} />
      ) : total === 0 ? (
        <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          You have no tasks assigned yet.
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <ChartContainer config={chartConfig} className="h-[180px] aspect-square">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={78}
                strokeWidth={2}
                stroke={darkMode ? "#0f172a" : "#ffffff"}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex-1 flex flex-col gap-2">
            {STATUS_CONFIG.map((s) => {
              const value = counts[s.key];
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className={`text-[11px] font-medium truncate ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className={`text-[14px] font-bold ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
                      {value}
                    </span>
                    <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
            <div className={`mt-1 pt-2 border-t flex items-baseline justify-between ${darkMode ? "border-slate-700" : "border-slate-100"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Total
              </span>
              <span className={`text-[14px] font-bold ${darkMode ? "text-slate-100" : "text-[#1a3a4a]"}`}>
                {total}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
