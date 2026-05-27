import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTheme } from "@/contexts/useTheme";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const USER_COLORS = [
  "#C2D4D4",
  "#69777B",
  "#2a4a5a",
  "#8FBFD0",
  "#c74634",
  "#5C926D",
  "#DEB068",
];

const fallbackData = [
  { sprintNumber: "Sprint 1", Dev1: 186, Dev2: 80 },
  { sprintNumber: "Sprint 2", Dev1: 305, Dev2: 200 },
  { sprintNumber: "Sprint 3", Dev1: 237, Dev2: 120 },
  { sprintNumber: "Sprint 4", Dev1: 73, Dev2: 190 },
];
const fallbackUsers = ["Dev1", "Dev2"];

interface RealTimeHoursPerSprintProps {
  data?: Record<string, number | string>[];
  users?: string[];
}

export function RealTimeHoursPerSprint({
  data,
  users,
}: RealTimeHoursPerSprintProps) {
  const chartData = data ?? fallbackData;
  const chartUsers = users ?? fallbackUsers;
  const { darkMode } = useTheme();

  const chartConfig: ChartConfig = Object.fromEntries(
    chartUsers.map((name, i) => [
      name,
      { label: name, color: USER_COLORS[i % USER_COLORS.length] },
    ]),
  );

  return (
    <Card className={`flex flex-col gap-0 overflow-hidden rounded-lg border shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-[#C2D4D4] bg-white text-slate-900'}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Tasks Completed by Developer per Sprint
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tasks completed per developer each sprint, use it to monitor workload
          and balance effort.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 14, right: 16, left: -10, bottom: 2 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              width={90}
              label={{
                value: "Tasks Completed",
                angle: -90,
                position: "insideLeft",
                offset: 24,
                style: { fontWeight: 700, textAnchor: "middle" },
              }}
            />
            <XAxis
              dataKey="sprintNumber"
              height={50}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              label={{
                value: "Sprints",
                position: "bottom",
                offset: -16,
                style: { fontWeight: 700 },
              }}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {chartUsers.map((name, i) => (
              <Bar
                key={name}
                dataKey={name}
                fill={USER_COLORS[i % USER_COLORS.length]}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default RealTimeHoursPerSprint;
