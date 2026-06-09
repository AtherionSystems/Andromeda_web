import { Bar, BarChart, CartesianGrid, Line, ComposedChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import Skeleton from "./Skeleton";

export interface SprintPersonalEntry {
  sprintName: string;
  completed: number;
  velocity: number;
}

const chartConfig = {
  completed: { label: "Tasks Done", color: "#4a3f7a" },
  velocity:  { label: "Velocity",   color: "#c74634" },
} satisfies ChartConfig;

function shorten(name: string): string {
  return name.length > 14 ? name.slice(0, 12) + "…" : name;
}

interface Props {
  darkMode: boolean;
  loading: boolean;
  data: SprintPersonalEntry[];
}

export default function MyTasksPerSprintCard({ darkMode, loading, data }: Props) {
  const chartData = data.map((d) => ({
    sprint: shorten(d.sprintName),
    completed: d.completed,
    velocity: d.velocity,
  }));
  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

  const avgVelocity = data.length > 0
    ? Math.round((data.reduce((a, b) => a + b.velocity, 0) / data.length) * 10) / 10
    : 0;
  const totalDone = data.reduce((a, b) => a + b.completed, 0);

  return (
    <div className={`rounded-[10px] px-[18px] py-4 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <p className={`m-0 text-[16px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
          My Tasks Per Sprint
        </p>
        {!loading && data.length > 0 && (
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Avg velocity</p>
              <p className="text-[13px] font-bold text-[#c74634]">{avgVelocity} pts</p>
            </div>
            <div>
              <p className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Total done</p>
              <p className="text-[13px] font-bold text-[#4a3f7a]">{totalDone}</p>
            </div>
          </div>
        )}
      </div>
      <p className={`m-0 mb-4 text-[10px] uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
        Tasks completed and personal velocity by sprint
      </p>

      {loading ? (
        <Skeleton h={200} darkMode={darkMode} />
      ) : data.length === 0 ? (
        <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          No completed tasks tracked yet.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <ComposedChart data={chartData} barSize={16} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="sprint"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              height={50}
              tick={{ fontSize: 10, fill: tickColor, angle: -25, textAnchor: "end" }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: tickColor }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            <Line
              type="monotone"
              dataKey="velocity"
              stroke="var(--color-velocity)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-velocity)" }}
            />
          </ComposedChart>
        </ChartContainer>
      )}
    </div>
  );
}
