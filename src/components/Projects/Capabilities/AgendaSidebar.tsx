import { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { getProjectSprints } from "../../../api/projects";
import type { ApiSprint } from "../../../types/api";
import CalendarWidget from "./CalendarWidget";

function SectionLabel({
  children,
  darkMode,
}: {
  children: string;
  darkMode: boolean;
}) {
  return (
    <p
      className={`mb-3 text-[10px] font-semibold uppercase tracking-[1.2px] ${
        darkMode ? "text-slate-500" : "text-slate-400"
      }`}
    >
      {children}
    </p>
  );
}

function UpcomingItem({
  time,
  meridiem,
  title,
  subtitle,
  highlight,
  darkMode,
}: {
  time: string;
  meridiem: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
        highlight
          ? darkMode
            ? "bg-[#3a2420] border-[#5a352e]"
            : "bg-[#fdf0ed] border-[#f3d8d1]"
          : darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded ${
          highlight
            ? "bg-[#c74634] text-white"
            : darkMode
              ? "bg-slate-700 text-slate-300"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        <span className="text-[8px] font-semibold leading-none">
          {meridiem}
        </span>
        <span className="text-[12px] font-bold leading-tight">{time}</span>
      </div>
      <div className="min-w-0">
        <p
          className={`truncate text-[12px] font-semibold ${
            darkMode ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {title}
        </p>
        <p
          className={`truncate text-[11px] ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/** Converts an ISO date string → { time: "10:00", meridiem: "AM" } */
function formatTime(iso: string | null): { time: string; meridiem: string } {
  if (!iso) return { time: "--:--", meridiem: "—" };
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return { time: `${hour}:${m}`, meridiem };
}

/** Subtitle label for a sprint */
function sprintSubtitle(sprint: ApiSprint): string {
  if (sprint.status === "active") return "Active sprint";
  if (sprint.dueDate) {
    const due = new Date(sprint.dueDate);
    return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return "Planned";
}

interface AgendaSidebarProps {
  projectId: number;
}

function AgendaSidebar({ projectId }: AgendaSidebarProps) {
  const { darkMode } = useTheme();
  const [sprints, setSprints] = useState<ApiSprint[]>([]);

  useEffect(() => {
    getProjectSprints(projectId)
      .then((all) =>
        setSprints(
          all
            .filter((s) => s.status === "active" || s.status === "planned")
            .sort((a, b) => {
              // active first, then by startDate
              if (a.status === "active" && b.status !== "active") return -1;
              if (b.status === "active" && a.status !== "active") return 1;
              return (a.startDate ?? "").localeCompare(b.startDate ?? "");
            })
            .slice(0, 4), // show at most 4 upcoming sprints
        ),
      )
      .catch(console.error);
  }, [projectId]);

  return (
    <aside className="w-full shrink-0 space-y-8 lg:w-[300px]">
      <CalendarWidget />

      <div>
        <SectionLabel darkMode={darkMode}>Coming up</SectionLabel>
        <div className="space-y-2">
          {sprints.length === 0 ? (
            <p
              className={`text-[12px] ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              No upcoming sprints.
            </p>
          ) : (
            sprints.map((sprint, i) => {
              const { time, meridiem } = formatTime(
                sprint.dueDate ?? sprint.startDate,
              );
              return (
                <UpcomingItem
                  key={sprint.id}
                  meridiem={meridiem}
                  time={time}
                  title={sprint.name}
                  subtitle={sprintSubtitle(sprint)}
                  highlight={sprint.status === "active" || i === 0}
                  darkMode={darkMode}
                />
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

export default AgendaSidebar;
