import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card"
import {ChartContainer,ChartTooltip,ChartTooltipContent,type ChartConfig,} from "@/components/ui/chart"

const chartData = [
  { month: "Jan", ideal: 100, actual: 95 },
  { month: "Feb", ideal: 83,  actual: 88 },
  { month: "Mar", ideal: 67,  actual: 60 },
  { month: "Apr", ideal: 50,  actual: 55 },
  { month: "May", ideal: 33,  actual: 25 },
  { month: "Jun", ideal: 17,  actual: 18 },
]

const chartConfig = {
  ideal: {
    label: "Ideal",
    color: "var(--chart-2)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function SprintCompletionRate() {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Sprint completion rate</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          burndown chart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <LineChart
            data={chartData}
            margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="ideal"
              type="monotone"
              stroke="var(--color-ideal)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              dataKey="actual"
              type="monotone"
              stroke="var(--color-actual)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
export default SprintCompletionRate;