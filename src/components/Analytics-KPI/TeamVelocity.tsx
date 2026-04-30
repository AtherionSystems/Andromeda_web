import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card"
import {ChartContainer,ChartTooltip,ChartTooltipContent,type ChartConfig,} from "@/components/ui/chart"

const fallbackData = [
  { sprintNumber: "Sprint 1", pointsCompleted: 186, pointsPlanned: 220 },
  { sprintNumber: "Sprint 2", pointsCompleted: 305, pointsPlanned: 320 },
  { sprintNumber: "Sprint 3", pointsCompleted: 237, pointsPlanned: 260 },
  { sprintNumber: "Sprint 4", pointsCompleted: 73,  pointsPlanned: 100 },
]

const chartConfig = {
  pointsCompleted: { label: "Completed", color: "#C2D4D4" },
  pointsPlanned:   { label: "Planned",   color: "#69777B" },
} satisfies ChartConfig

interface TeamVelocityProps {
  data?: Record<string, number | string>[]
}

export function TeamVelocity({ data }: TeamVelocityProps) {
  const chartData = data ?? fallbackData
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader>
        <CardTitle>Team Velocity</CardTitle>
        <CardDescription>Story points planned vs completed per sprint.</CardDescription>
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
                value: "Story Points",
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
              label={{ value: "Sprints", position: "bottom", offset: -16, style: { fontWeight: 700 } }}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="pointsCompleted" fill="#C2D4D4" radius={4} />
            <Bar dataKey="pointsPlanned"   fill="#69777B" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TeamVelocity
