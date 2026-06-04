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
  done:        { label: "Done",        color: "#c74634" },
  in_progress: { label: "In Progress", color: "#2a4a5a" },
  review:      { label: "Review",      color: "#d97706" },
  todo:        { label: "To Do",       color: "#dce8ea" },
} satisfies ChartConfig;

function abbr(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.slice(0, 6);
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 5);
}

interface SprintVelocityChartProps {
  darkMode: boolean;
  data: ProjectEffortData[];
  loading: boolean;
}

export default function SprintVelocityChart({ darkMode, data, loading }: SprintVelocityChartProps) {
  const chartData = data.map((d) => ({ ...d, project: abbr(d.project) }));

  return (
    <div style={{
      background: darkMode ? "#0f172a" : "#fff",
      border: `1px solid ${darkMode ? "#1e293b" : "#cdd8db"}`,
      borderRadius: 10, padding: "16px 18px",
    }}>
      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: darkMode ? "#e2e8f0" : "#1a3a4a" }}>
        Project Effort
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", color: darkMode ? "#94a3b8" : "#6a8a9a" }}>
        Task distribution by status across all projects
      </p>

      {loading ? (
        <Skeleton h={140} darkMode={darkMode} />
      ) : data.length === 0 ? (
        <p style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#6a8a9a", textAlign: "center", padding: "40px 0" }}>
          No data available.
        </p>
      ) : (
        <ChartContainer config={chartConfig} style={{ height: 240, width: "100%" }}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid vertical={false} stroke={darkMode ? "#1e293b" : "#f0f4f5"} />
            <XAxis
              dataKey="project"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#6a8a9a" }}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="done"        stackId="a" fill="var(--color-done)"        radius={[0, 0, 0, 0]} />
            <Bar dataKey="review"      stackId="a" fill="var(--color-review)"      radius={[0, 0, 0, 0]} />
            <Bar dataKey="in_progress" stackId="a" fill="var(--color-in_progress)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="todo"        stackId="a" fill="var(--color-todo)"        radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
