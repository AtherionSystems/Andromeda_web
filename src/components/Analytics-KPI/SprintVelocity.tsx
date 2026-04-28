import { TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SprintVelocityCardProps {
  velocity?: number
  velocityChange?: number
  completionRate?: number
}

export function SprintVelocityCard({
  velocity = 42.8,
  velocityChange = 12,
  completionRate = 94,
}: SprintVelocityCardProps) {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-[#8FBFD0]">
      {/* Sprint Velocity Section */}
      <CardContent className="flex flex-col gap-1 border-b border-border p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sprint Velocity
        </p>
        <p className="text-4xl font-bold text-foreground">{velocity}</p>
        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          <span>
            +{velocityChange}% from previous cycle
          </span>
        </div>
      </CardContent>

      {/* Completion Rate Section */}
      <CardContent className="flex flex-col gap-1 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Completion Rate
        </p>
        <p className="text-4xl font-bold text-foreground">
          {completionRate}
          <span className="text-2xl font-semibold text-muted-foreground">%</span>
        </p>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
export default SprintVelocityCard;