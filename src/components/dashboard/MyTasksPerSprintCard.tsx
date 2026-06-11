import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import Skeleton from "./Skeleton";

export interface SprintPersonalEntry {
  sprintName: string;
  completed: number;
  velocity?: number;
}

const chartConfig = {
  completed: { label: "Tasks Done", color: "#4a3f7a" },
} satisfies ChartConfig;

function shorten(name: string): string {
  return name.length > 14 ? name.slice(0, 12) + "…" : name;
}

interface TooltipPayload {
  payload: {
    sprintName: string;
    completed: number;
    avg: number;
    delta: number;
  };
}

function TasksTooltip({ active, payload, darkMode }: { active?: boolean; payload?: TooltipPayload[]; darkMode: boolean }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sign = d.delta > 0 ? "+" : "";
  return (
    <div className={`rounded-md border px-3 py-2 text-[11px] shadow-md ${darkMode ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}>
      <p className="font-bold mb-1">{d.sprintName}</p>
      <p>Completed: <b>{d.completed}</b></p>
      <p>Average: <b>{d.avg.toFixed(1)}</b></p>
      <p style={{ color: d.delta > 0 ? "#5C926D" : d.delta < 0 ? "#c74634" : "#94a3b8" }}>
        vs avg: <b>{sign}{d.delta.toFixed(1)}</b>
      </p>
    </div>
  );
}

interface Props {
  darkMode: boolean;
  loading: boolean;
  data: SprintPersonalEntry[];
}

export default function MyTasksPerSprintCard({ darkMode, loading, data }: Props) {
  const avg = data.length > 0
    ? data.reduce((a, b) => a + b.completed, 0) / data.length
    : 0;
  const avgRounded = Math.round(avg * 10) / 10;

  const chartData = data.map((d) => ({
    sprint: shorten(d.sprintName),
    sprintName: d.sprintName,
    completed: d.completed,
    avg,
    delta: d.completed - avg,
  }));

  const lastSprint = chartData[chartData.length - 1];
  const lastDelta = lastSprint ? lastSprint.delta : 0;

  const tickColor = darkMode ? "#94a3b8" : "#6a8a9a";
  const gridColor = darkMode ? "#1e293b" : "#f0f4f5";

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
              <p className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Avg / sprint</p>
              <p className="text-[13px] font-bold text-[#4a3f7a]">{avgRounded}</p>
            </div>
            <div>
              <p className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Total done</p>
              <p className="text-[13px] font-bold text-[#1a3a4a]" style={{ color: darkMode ? "#e2e8f0" : undefined }}>{totalDone}</p>
            </div>
            {lastSprint && (
              <div>
                <p className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Last sprint</p>
                <p className="text-[13px] font-bold" style={{ color: lastDelta > 0 ? "#5C926D" : lastDelta < 0 ? "#c74634" : "#94a3b8" }}>
                  {lastDelta > 0 ? "+" : ""}{lastDelta.toFixed(1)} vs avg
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <p className={`m-0 mb-4 text-[10px] uppercase tracking-[1.2px] ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
        Completed tasks per sprint — your personal momentum
      </p>

      {loading ? (
        <Skeleton h={220} darkMode={darkMode} />
      ) : data.length === 0 ? (
        <p className={`text-xs text-center py-10 ${darkMode ? "text-slate-400" : "text-[#6a8a9a]"}`}>
          No completed tasks tracked yet.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--color-completed)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--color-completed)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
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
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: tickColor }} allowDecimals={false} />
            <ReferenceLine
              y={avg}
              stroke="#c74634"
              strokeDasharray="4 4"
              strokeWidth={1.2}
              label={{
                value: `avg ${avgRounded}`,
                fill: "#c74634",
                fontSize: 9,
                position: "insideTopRight",
              }}
            />
            <ChartTooltip content={<TasksTooltip darkMode={darkMode} />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="var(--color-completed)"
              strokeWidth={2.2}
              fill="url(#completedFill)"
              dot={{ r: 3, fill: "var(--color-completed)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
