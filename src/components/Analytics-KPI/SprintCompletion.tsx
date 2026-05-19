
{/*BURRRRRRRRRNDOWWWWWWWWWWWWWWWWWN*/}
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card";
import {ChartContainer,ChartTooltip,ChartTooltipContent,type ChartConfig,} from "@/components/ui/chart";
import type { DashboardBurndownPoint } from "@/types/api";

const fallbackData: DashboardBurndownPoint[] = [
  { day: "Mon", ideal: 100, actual: 95 },
  { day: "Tue", ideal: 83, actual: 88 },
  { day: "Wed", ideal: 67, actual: 60 },
  { day: "Thu", ideal: 50, actual: 55 },
  { day: "Fri", ideal: 33, actual: 25 },
];

const chartConfig = {
  ideal: {
    label: "Ideal",
    color: "#C74634",
  },
  actual: {
    label: "Actual",
    color: "#8FBFD0",
  },
} satisfies ChartConfig;

interface SprintCompletionRateProps {
  data?: DashboardBurndownPoint[];
}

export function SprintCompletionRate({ data }: SprintCompletionRateProps) {
  const chartData = data ?? fallbackData;
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Sprint Completion Rate
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          burndown chart
        </CardDescription>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full border-t-2 border-dashed border-[#C74634]" />
            <span>Ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full border-t-2 border-[#8FBFD0]" />
            <span>Actual</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <LineChart
            data={chartData}
            margin={{ left: 24, right: 24, top: 4, bottom: 16 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            {/*leyendas de los ejes de la graficasadadsfs*/}
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              label={{
                value: "Sprint",
                position: "bottom",
                offset: 2,
                style: { fontWeight: 700 },
              }}
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
              label={{
                value: "Remaining Stories (%)",
                angle: -90,
                position: "insideLeft",
                offset: -8,
                style: { fontWeight: 700, textAnchor: "middle" },
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="ideal"
              type="monotone"
              stroke="#C74634"
              strokeWidth={3}
              strokeDasharray="4 4"
              dot={{ r: 2 }}
              strokeOpacity={1}
            />
            <Line
              dataKey="actual"
              type="monotone"
              stroke="#8FBFD0"
              strokeWidth={3}
              dot={{ r: 2 }}
              strokeOpacity={1}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
export default SprintCompletionRate;
