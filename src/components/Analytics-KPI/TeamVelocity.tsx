import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts"
import type { BarShapeProps } from "recharts/types/cartesian/Bar"
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card"
import {ChartContainer,ChartTooltip,ChartTooltipContent,type ChartConfig,} from "@/components/ui/chart"

const chartData = [
  { team: "chrome",points: 187, fill: "var(--color-chrome)" },
  { team: "safari",points: 200, fill: "var(--color-safari)" },
  { team: "firefox",points: 275, fill: "var(--color-firefox)" },
  { team: "edge",points: 173, fill: "var(--color-edge)" },
  { team: "other", points: 90,  fill: "var(--color-other)" },
]

const chartConfig = {
  points: { label: "Story Points" },
  chrome:  { label: "Chrome",color: "var(--chart-1)" },
  safari:  { label: "Safari",color: "var(--chart-2)" },
  firefox: { label: "Firefox",color: "var(--chart-1)" },
  edge:    { label: "Edge",color: "var(--chart-2)" },
  other:   { label: "Other",color: "var(--chart-3)" },
} satisfies ChartConfig

const ACTIVE_INDEX = 2

export function TeamVelocity() {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Team Velocity</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          bar chart · January – June 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[160px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="team"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label ?? value
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="points"
              strokeWidth={2}
              radius={6}
              shape={({ index, ...props }: BarShapeProps) =>
                index === ACTIVE_INDEX ? (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                  />
                ) : (
                  <Rectangle {...props} />
                )
              }
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
export default TeamVelocity;