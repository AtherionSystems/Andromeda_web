import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ProjectEffortData } from "./types";
import Skeleton from "./Skeleton";

const chartConfig = {
  done:        { label: "Done",        color: "#5C926D" },
  in_progress: { label: "In Progress", color: "#2a4a5a" },
  review:      { label: "Review",      color: "#f9a94e" },
  todo:        { label: "To Do",       color: "#c74634" },
} satisfies ChartConfig;

function abbr(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.slice(0, 12);
  return words[0] + " " + words.slice(1).map((w) => w[0]).join("").toUpperCase();
}

interface SprintVelocityChartProps {
  darkMode: boolean;
  data: ProjectEffortData[];
  loading: boolean;
}

export default function SprintVelocityChart({ darkMode, data, loading }: SprintVelocityChartProps) {
  const chartData = data
    .map((d) => ({ ...d, project: abbr(d.project) }))
    .sort((a, b) => (a.done + a.in_progress + a.review + a.todo) - (b.done + b.in_progress + b.review + b.todo));
  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

  return (
    <div className={`rounded-[10px] px-[18px] py-4 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <p className={`m-0 mb-0.5 text-[16px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
        Project Effort
      </p>
      <p className={`m-0 mb-4 text-[10px] uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
        Task distribution by status across all projects
      </p>

      {loading ? (
        <Skeleton h={140} darkMode={darkMode} />
      ) : data.length === 0 ? (
        <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          No data available.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart data={chartData} barSize={14} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="project"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              height={60}
              tick={{ fontSize: 10, fill: tickColor, angle: -35, textAnchor: "end" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: tickColor }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="done"        fill="var(--color-done)"        radius={4} />
            <Bar dataKey="review"      fill="var(--color-review)"      radius={4} />
            <Bar dataKey="in_progress" fill="var(--color-in_progress)" radius={4} />
            <Bar dataKey="todo"        fill="var(--color-todo)"        radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
