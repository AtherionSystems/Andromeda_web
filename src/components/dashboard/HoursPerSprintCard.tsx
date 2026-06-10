import { Bar, BarChart, Cell, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import Skeleton from "./Skeleton";

export interface SprintHourEntry {
  sprintName: string;
  estimated: number;
  actual: number;
}

const chartConfig = {
  deviation: { label: "Deviation", color: "#00688C" },
} satisfies ChartConfig;

const OVERRUN_COLOR  = "#c74634"; // actual > estimated
const UNDERRUN_COLOR = "#5C926D"; // actual < estimated
const ZERO_COLOR     = "#94a3b8"; // perfect estimate

function shorten(name: string): string {
  return name.length > 14 ? name.slice(0, 12) + "…" : name;
}

interface TooltipPayload {
  payload: {
    sprintName: string;
    estimated: number;
    actual: number;
    deviation: number;
    pct: number;
  };
}

function DeviationTooltip({ active, payload, darkMode }: { active?: boolean; payload?: TooltipPayload[]; darkMode: boolean }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sign = d.deviation > 0 ? "+" : "";
  return (
    <div className={`rounded-md border px-3 py-2 text-[11px] shadow-md ${darkMode ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}>
      <p className="font-bold mb-1">{d.sprintName}</p>
      <p>Estimated: <b>{d.estimated}h</b></p>
      <p>Actual:    <b>{d.actual}h</b></p>
      <p style={{ color: d.deviation > 0 ? OVERRUN_COLOR : d.deviation < 0 ? UNDERRUN_COLOR : ZERO_COLOR }}>
        Deviation: <b>{sign}{d.deviation}h ({sign}{d.pct}%)</b>
      </p>
    </div>
  );
}

interface Props {
  darkMode: boolean;
  loading: boolean;
  data: SprintHourEntry[];
}

export default function HoursPerSprintCard({ darkMode, loading, data }: Props) {
  // Build deviation series.
  const chartData = data.map((d) => {
    const deviation = d.actual - d.estimated;
    const pct = d.estimated > 0 ? Math.round((deviation / d.estimated) * 100) : 0;
    return {
      sprint: shorten(d.sprintName),
      sprintName: d.sprintName,
      estimated: d.estimated,
      actual: d.actual,
      deviation,
      pct,
    };
  });

  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

  // Headline metric: average absolute deviation %
  const avgDevPct = chartData.length > 0
    ? Math.round(chartData.reduce((a, b) => a + Math.abs(b.pct), 0) / chartData.length)
    : 0;

  // Are most sprints overrunning or underrunning?
  const overruns  = chartData.filter((d) => d.deviation > 0).length;
  const underruns = chartData.filter((d) => d.deviation < 0).length;
  const trend = overruns > underruns ? "overrun" : underruns > overruns ? "underrun" : "even";

  return (
    <div className={`rounded-[10px] px-[18px] py-4 border ${darkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-[#cdd8db]"}`}>
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <p className={`m-0 text-[16px] font-bold ${darkMode ? "text-slate-200" : "text-[#1a3a4a]"}`}>
          Hours Per Sprint
        </p>
        {!loading && chartData.length > 0 && (
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Avg drift</p>
              <p className="text-[13px] font-bold" style={{ color: avgDevPct > 20 ? OVERRUN_COLOR : avgDevPct > 5 ? "#FFB13F" : UNDERRUN_COLOR }}>
                ±{avgDevPct}%
              </p>
            </div>
            <div>
              <p className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Trend</p>
              <p className="text-[13px] font-bold" style={{
                color: trend === "overrun" ? OVERRUN_COLOR : trend === "underrun" ? UNDERRUN_COLOR : ZERO_COLOR,
              }}>
                {trend === "overrun" ? "Underestimating" : trend === "underrun" ? "Overestimating" : "Even"}
              </p>
            </div>
          </div>
        )}
      </div>
      <p className={`m-0 mb-4 text-[10px] uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
        Actual hours vs estimate per sprint — above zero is overrun
      </p>

      {loading ? (
        <Skeleton h={220} darkMode={darkMode} />
      ) : chartData.length === 0 ? (
        <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          No sprint hours logged yet.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={chartData} barSize={22} barCategoryGap="22%">
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: tickColor }}
              tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}h`}
            />
            <ReferenceLine y={0} stroke={darkMode ? "#475569" : "#94a3b8"} strokeWidth={1.5} />
            <ChartTooltip content={<DeviationTooltip darkMode={darkMode} />} />
            <Bar dataKey="deviation" radius={[4, 4, 4, 4]}>
              {chartData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.deviation > 0 ? OVERRUN_COLOR : d.deviation < 0 ? UNDERRUN_COLOR : ZERO_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
