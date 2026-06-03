import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/useTheme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: { before?: Date };
  captionLayout?: "label";
  className?: string;
}

function Calendar({ selected, onSelect, disabled, className }: CalendarProps) {
  const { darkMode } = useTheme();
  const [viewMonth, setViewMonth] = React.useState(
    selected?.getMonth() ?? new Date().getMonth(),
  );
  const [viewYear, setViewYear] = React.useState(
    selected?.getFullYear() ?? new Date().getFullYear(),
  );

  const disabledBefore = React.useMemo(() => {
    if (!disabled?.before) return null;
    const d = new Date(disabled.before);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [disabled?.before]);

  const disabledBeforeStamp = React.useMemo(() => {
    if (!disabledBefore) return null;
    return new Date(
      disabledBefore.getFullYear(),
      disabledBefore.getMonth(),
      disabledBefore.getDate(),
    ).getTime();
  }, [disabledBefore]);

  function dateStamp(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function isDisabled(date: Date) {
    return disabledBeforeStamp !== null && dateStamp(date) < disabledBeforeStamp;
  }

  function isSelected(date: Date) {
    return (
      !!selected &&
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    );
  }

  function isToday(date: Date) {
    const t = new Date();
    return (
      date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate()
    );
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const canGoPrev = React.useMemo(() => {
    if (!disabledBefore) return true;
    const lastOfPrev = new Date(viewYear, viewMonth, 0); // last day of prev month
    return lastOfPrev >= disabledBefore;
  }, [viewMonth, viewYear, disabledBefore]);

  // Build day grid
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={cn("p-3 select-none w-fit text-black dark:text-slate-100", className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={cn(
            "p-1 rounded-md transition-colors",
            canGoPrev
              ? "!text-black dark:!text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              : "opacity-60 cursor-not-allowed text-slate-600 dark:text-slate-500",
          )}
        >
          <ChevronLeft size={16} />
        </button>

        <span className={cn("text-sm font-bold !opacity-100", darkMode ? "text-white" : "text-[#0b1220]")}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-md transition-colors !text-black dark:!text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold py-1 text-slate-700 dark:text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const dis = isDisabled(date);
          const sel = isSelected(date);
          const tod = isToday(date);

          return (
            <button
              key={i}
              type="button"
              disabled={dis}
              onClick={() => onSelect?.(sel ? undefined : date)}
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors",
                sel
                  ? "text-white font-semibold"
                  : dis
                  ? "!text-black dark:!text-slate-300 line-through cursor-not-allowed"
                  : tod
                  ? "font-bold !text-slate-400 dark:!text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  : "font-semibold !text-slate-400 dark:!text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer",
              )}
              style={
                sel
                  ? { background: "#C74634" }
                  : dis
                  ? { color: "#111827" }
                  : { color: "#94a3b8" }
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
