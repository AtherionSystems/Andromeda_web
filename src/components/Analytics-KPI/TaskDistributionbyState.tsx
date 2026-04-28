import { Pie, PieChart, Cell } from "recharts"
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card"
import {ChartContainer,ChartTooltip,ChartTooltipContent,ChartLegend,ChartLegendContent,type ChartConfig,} from "@/components/ui/chart"

const chartData = [
  { state:"done",tasks: 275, fill:"#5C926D" },
  { state:"inProgress",tasks: 200, fill:"#DEB068" },
  { state:"todo",tasks: 187, fill:"#36677D" },
  { state:"blocked",tasks: 90,  fill:"#C74634" },
]

const chartConfig = {
  tasks:{ label: "Tasks" },
  done:{ label: "Done",color:"var(--chart-1)" },
  inProgress:{ label: "In Progress",color: "var(--chart-2)" },
  todo:{ label: "To Do",color: "var(--chart-3)" },
  blocked:{ label: "Blocked",color: "var(--chart-4)" },
} satisfies ChartConfig

export function TaskDistributionByState() {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold">
          Task Distribution by State
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Visualize the state of the tasks available in the current sprint.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="h-[260px] w-full"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="tasks"
              nameKey="state"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.state} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="state" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
export default TaskDistributionByState;