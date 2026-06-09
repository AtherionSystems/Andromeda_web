import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import Skeleton from "./Skeleton";

export interface SprintHourEntry {
  sprintName: string;
  estimated: number;
  actual: number;
}

const chartConfig = {
  estimated: { label: "Estimated", color: "#00688C" },
  actual:    { label: "Actual",    color: "#FFB13F" },
} satisfies ChartConfig;

function shorten(name: string): string {
  return name.length > 14 ? name.slice(0, 12) + "…" : name;
}

interface Props {
  darkMode: boolean;
  loading: boolean;
  data: SprintHourEntry[];
}

export default function HoursPerSprintCard({ darkMode, loading, data }: Props) {
  const chartData = data.map((d) => ({
    sprint: shorten(d.sprintName),
    estimated: d.estimated,
    actual: d.actual,
  }));
  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

  const totalEstimated = data.reduce((a, b) => a + b.estimated, 0);
  const totalActual = data.reduce((a, b) => a + b.actual, 0);
  const deviation = totalEstimated > 0
    ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100)
    : 0;

  return (
    <div className={`rounded-[10px] px-[18px] py-4 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <p className={`m-0 text-[16px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
          Hours Per Sprint
        </p>
        {!loading && data.length > 0 && (
          <span
            className="text-[11px] font-bold"
            style={{ color: deviation > 10 ? "#c74634" : deviation < -10 ? "#5C926D" : "#00688C" }}
          >
            {deviation > 0 ? "+" : ""}{deviation}% vs estimated
          </span>
        )}
      </div>
      <p className={`m-0 mb-4 text-[10px] uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
        Estimated vs actual hours — your work, by sprint
      </p>

      {loading ? (
        <Skeleton h={200} darkMode={darkMode} />
      ) : data.length === 0 ? (
        <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          No sprint hours logged yet.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={chartData} barSize={14} barCategoryGap="22%">
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
            <Bar dataKey="estimated" fill="var(--color-estimated)" radius={4} />
            <Bar dataKey="actual"    fill="var(--color-actual)"    radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
