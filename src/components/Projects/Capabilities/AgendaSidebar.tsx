import { useTheme } from "../../../contexts/useTheme";
import CalendarWidget from "./CalendarWidget";

function SectionLabel({ children, darkMode }: { children: string; darkMode: boolean }) {
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
          highlight ? "bg-[#c74634] text-white" : darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
        }`}
      >
        <span className="text-[8px] font-semibold leading-none">{meridiem}</span>
        <span className="text-[12px] font-bold leading-tight">{time}</span>
      </div>
      <div className="min-w-0">
        <p className={`truncate text-[12px] font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          {title}
        </p>
        <p className={`truncate text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function AgendaSidebar() {
  const { darkMode } = useTheme();

  return (
    <aside className="w-full shrink-0 space-y-8 lg:w-[300px]">
      <CalendarWidget />

      <div>
        <SectionLabel darkMode={darkMode}>Coming up</SectionLabel>
        <div className="space-y-2">
          <UpcomingItem
            meridiem="AM"
            time="10:00"
            title="Stakeholder Review"
            subtitle="Cloud Infrastructure V1"
            highlight
            darkMode={darkMode}
          />
          <UpcomingItem
            meridiem="PM"
            time="02:30"
            title="Sprint Retrospective"
            subtitle="Team Alpha Room"
            darkMode={darkMode}
          />
        </div>
      </div>
    </aside>
  );
}

export default AgendaSidebar;
