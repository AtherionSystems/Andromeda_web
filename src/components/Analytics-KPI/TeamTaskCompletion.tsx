import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TeamMember {
  id: string
  name: string
  completion: number
  avatarColor?: string
}

interface TeamTaskCompletionProps {
  members?: TeamMember[]
}

const defaultMembers: TeamMember[] = [
  { id: "1", name: "Sarah Jenkins", completion: 88, avatarColor: "bg-rose-500" },
  { id: "2", name: "Sarah Jenkins", completion: 66, avatarColor: "bg-rose-400" },
]

export function TeamTaskCompletion({ members = defaultMembers }: TeamTaskCompletionProps) {
  return (
    <Card className="flex h-[160px] flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Team task completion</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${member.avatarColor ?? "bg-primary"}`}
            >
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>

            {/* Name + progress */}
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{member.name}</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {member.completion}%
                </span>
              </div>
              <Progress value={member.completion} className="h-1.5" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
export default TeamTaskCompletion;