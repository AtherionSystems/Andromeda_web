import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import MemberAvatars from "@/components/Projects/MemberAvatars";
import { useTheme } from "@/contexts/useTheme";
import type { Member } from "@/types/project";

interface TeamMember {
  id: string;
  name: string;
  completion: number;
  avatarColor?: string;
}

interface TeamTaskCompletionProps {
  members?: TeamMember[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const defaultMembers: TeamMember[] = [
  {
    id: "1",
    name: "Developer 1",
    completion: 88,
    avatarColor: "bg-[#99C2A6]",
  },
  {
    id: "2",
    name: "Developer 2",
    completion: 66,
    avatarColor: "bg-[#69777B]",
  },
];

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3 w-40 rounded bg-muted" />
        <div className="h-1.5 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

export function TeamTaskCompletion({
  members,
  isLoading = false,
  emptyMessage = "No team completion data yet.",
}: TeamTaskCompletionProps) {
  const resolvedMembers = members ?? defaultMembers;
  const { darkMode } = useTheme();

  return (
    <Card className={`flex flex-col gap-0 rounded-lg border shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-[#C2D4D4] bg-white text-slate-900'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Team Task Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-4">
        {isLoading && (
          <>
            <RowSkeleton />
            <RowSkeleton />
          </>
        )}
        {!isLoading && resolvedMembers.length === 0 && (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
        {!isLoading &&
          resolvedMembers.map((member) => {
            const safeCompletion = Math.max(
              0,
              Math.min(100, member.completion),
            );
            const m: Member = {
              initials: member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              color: member.avatarColor ?? "bg-primary",
              name: member.name,
            };

            return (
              <div key={member.id} className="flex items-center gap-3">
                <MemberAvatars members={[m]} max={1} />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {member.name}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {safeCompletion}%
                    </span>
                  </div>
                  <Progress
                    value={safeCompletion}
                    className="h-1.5 [&>div]:bg-[#C74634]"
                  />
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}

export default TeamTaskCompletion;
