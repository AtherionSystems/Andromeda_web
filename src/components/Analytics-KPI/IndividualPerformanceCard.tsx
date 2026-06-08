import { useState } from "react";
import { useTheme } from "@/contexts/useTheme";
import type { ApiHoursPerUserItem, ApiUserTasksPerSprintItem } from "@/types/api";
import { HoursPerSprint } from "./HoursPerUser";
import { RealTimeHoursPerSprint } from "./RealTimeHoursSprint";

function shortSprintName(name: string): string {
  return name.match(/Sprint \d+/)?.[0] ?? name;
}

function pivotHoursPerUser(raw: ApiHoursPerUserItem[]) {
  const sprintOrder: string[] = [];
  raw.forEach((r) => {
    if (!sprintOrder.includes(r.sprintName)) sprintOrder.push(r.sprintName);
  });
  const users = Array.from(new Set(raw.map((r) => r.userName)));
  const chartData = sprintOrder.map((sprint) => {
    const entry: Record<string, number | string> = { sprintNumber: shortSprintName(sprint) };
    raw.filter((r) => r.sprintName === sprint).forEach((r) => {
      entry[r.userName] = Number(r.actualHours ?? r.hours ?? 0);
    });
    return entry;
  });
  return { chartData, users };
}

function pivotUserTasksPerSprint(raw: ApiUserTasksPerSprintItem[]) {
  const sprintOrder: string[] = [];
  raw.forEach((r) => {
    if (!sprintOrder.includes(r.sprintName)) sprintOrder.push(r.sprintName);
  });
  const users = Array.from(new Set(raw.map((r) => r.userName)));
  const chartData = sprintOrder.map((sprint) => {
    const entry: Record<string, number | string> = { sprintNumber: shortSprintName(sprint) };
    raw.filter((r) => r.sprintName === sprint).forEach((r) => {
      entry[r.userName] = r.tasksCompleted;
    });
    return entry;
  });
  return { chartData, users };
}

interface IndividualPerformanceCardProps {
  hoursRaw?: ApiHoursPerUserItem[];
  tasksRaw?: ApiUserTasksPerSprintItem[];
  loading: boolean;
}

export function IndividualPerformanceCard({ hoursRaw, tasksRaw, loading: _loading }: IndividualPerformanceCardProps) {
  const { darkMode } = useTheme();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const allUsers = Array.from(new Set([
    ...(hoursRaw ?? []).map((r) => r.userName),
    ...(tasksRaw ?? []).map((r) => r.userName),
  ]));

  const filteredHours = selectedUser
    ? (hoursRaw ?? []).filter((r) => r.userName === selectedUser)
    : (hoursRaw ?? []);

  const filteredTasks = selectedUser
    ? (tasksRaw ?? []).filter((r) => r.userName === selectedUser)
    : (tasksRaw ?? []);

  const { chartData: hoursData, users: hoursUsers } = filteredHours.length
    ? pivotHoursPerUser(filteredHours)
    : { chartData: undefined, users: undefined };

  const { chartData: tasksData, users: tasksUsers } = filteredTasks.length
    ? pivotUserTasksPerSprint(filteredTasks)
    : { chartData: undefined, users: undefined };

  const selectClass = `rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 w-82 ${
    darkMode
      ? "border-slate-700 bg-slate-800 text-slate-100 focus:ring-slate-500"
      : "border-[#C2D4D4] bg-white text-slate-900 focus:ring-[#2a4a5a]"
  }`;

  return (
    <div className={`rounded-lg border shadow-sm ${darkMode ? "border-slate-600 bg-slate-900" : "border-[#98ADB3] bg-[#dde6e8]"}`}>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 pt-4 pb-1">
        <h2 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
          Individual & Team Performance
        </h2>

        {allUsers.length > 0 && (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Filter by Developer:
            </span>
            <select
              value={selectedUser ?? ""}
              onChange={(e) => setSelectedUser(e.target.value || null)}
              className={`w-full sm:w-auto ${selectClass}`}
            >
              <option value="">All Developers</option>
              {allUsers.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <p className={`px-5 py-1 text-sm/[17px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Analyze workload, effort, and contributions at both team and developer levels.
      </p>

      {/* Graficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <HoursPerSprint data={hoursData} users={hoursUsers} />
        <RealTimeHoursPerSprint data={tasksData} users={tasksUsers} />
      </div>
    </div>
  );
}
