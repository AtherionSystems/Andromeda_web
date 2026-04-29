import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card"
import {ChartContainer,ChartTooltip,ChartTooltipContent,type ChartConfig,} from "@/components/ui/chart"

const chartData = [
  { sprintNumber: "Sprint 1", devOne: 186, devTwo: 80 },
  { sprintNumber: "Sprint 2", devOne: 305, devTwo: 200 },
  { sprintNumber: "Sprint 3", devOne: 237, devTwo: 120 },
  { sprintNumber: "Sprint 4", devOne: 73, devTwo: 190 },

]

const chartConfig = {
  devOne: {
    label: "Dev1",
    color: "#C2D4D4",
  },
  devTwo: {
    label: "Dev2",
    color: "#69777B",
  },
} satisfies ChartConfig

export function RealTimeHoursPerSprint() {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader>
        <CardTitle>Real-Time Hours per user per sprint</CardTitle>
        <CardDescription>Hours worked per user each sprint, use it to monitor workload and balance effort.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 8, right: 8, left: 2, bottom: 2 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              width={90}  
              label={{ 
                value: "Total Hours Worked", 
                  angle: -90, 
                  position: "insideLeft",
                  offset: 26,  
                  style: { fontWeight: 700, textAnchor: "middle" } 
              }}
            />
            <XAxis
              dataKey="sprintNumber"
              height={50}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              label={{value: "Sprints",position: "bottom",offset: -16,style: { fontWeight: 700 },}}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="devOne" fill="#C2D4D4" radius={4} />
            <Bar dataKey="devTwo" fill="#69777B" radius={4} />
          </BarChart>
      </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default RealTimeHoursPerSprint;