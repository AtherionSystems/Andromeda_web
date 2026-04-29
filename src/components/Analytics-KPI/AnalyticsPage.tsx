import { SprintVelocityCard, CompletionRateCard } from "./SprintVelocity"
import { SprintCompletionRate } from "./SprintCompletion"
import { TeamVelocity } from "./TeamVelocity"
import { RealTimeHoursPerSprint } from "./RealTimeHoursSprint"
import { TaskDistributionByState } from "./TaskDistributionbyState"
import { TeamTaskCompletion } from "./TeamTaskCompletion"
import { TeamManagement } from "./TeamManagement"

export function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Analytics Dashboard
      </h1>
      <div className="flex flex-col gap-4">
        {/* KPI Cards + Burndown Chart */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          {/* KPI Stack (left column) */}
          <div className="flex flex-col gap-4">
            <SprintVelocityCard />
            <CompletionRateCard />
          </div>
          {/* Burndown Chart (right column) */}
          <SprintCompletionRate />
        </div>
        {/*Team Velocity + Real-Time Hours */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TeamVelocity />
          <RealTimeHoursPerSprint />
        </div>
        {/*Pie chart + Task completion */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TaskDistributionByState />
          <TeamTaskCompletion />
        </div>
        {/* Row 4 — Team Management calendars */}
        <TeamManagement />
      </div>
    </div>
  )
}
