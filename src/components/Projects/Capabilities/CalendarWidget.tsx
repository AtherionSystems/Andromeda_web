import { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import type { ApiSprint } from "../../../types/api";

function buildGrid(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--)
    cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, current: false });

  const weeks: { day: number; current: boolean }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarWidgetProps {
  /** Sprint list from the parent — used to show dots on days with sprint activity */
  sprints?: ApiSprint[];
}

function CalendarWidget({ sprints = [] }: CalendarWidgetProps) {
  const { darkMode } = useTheme();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const weeks = buildGrid(year, month);

  // Build a set of days-of-month that have a sprint starting or ending this month
  const sprintDays = new Set<number>();
  sprints.forEach((s) => {
    for (const iso of [s.startDate, s.dueDate, s.actualEnd]) {
      if (!iso) continue;
      const d = new Date(iso);
      if (d.getFullYear() === year && d.getMonth() === month)
        sprintDays.add(d.getDate());
    }
  });

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p
          className={`text-sm font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}
        >
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className={`flex h-6 w-6 items-center justify-center rounded text-sm ${
              darkMode
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className={`flex h-6 w-6 items-center justify-center rounded text-sm ${
              darkMode
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span
            key={i}
            className={`text-[10px] font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            {d}
          </span>
        ))}

        {weeks.flat().map((cell, i) => {
          const today_ = cell.current && isToday(cell.day);
          const hasDot = cell.current && sprintDays.has(cell.day);
          return (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded text-[12px] ${
                  today_
                    ? "bg-[#c74634] font-semibold text-white"
                    : !cell.current
                      ? darkMode
                        ? "text-slate-700"
                        : "text-slate-300"
                      : darkMode
                        ? "text-slate-300"
                        : "text-slate-600"
                }`}
              >
                {cell.day}
              </span>
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${
                  hasDot ? "bg-[#c74634]" : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarWidget;
