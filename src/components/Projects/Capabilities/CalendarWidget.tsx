import { useTheme } from "../../../contexts/useTheme";

// Static April 2024 mock to match the design.
function buildAprilGrid() {
  const year = 2024;
  const month = 3; // April (0-indexed)
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

const APRIL_WEEKS = buildAprilGrid();
const SELECTED_DAY = 7;
const DOT_DAYS = new Set([3, 12]);

function CalendarWidget() {
  const { darkMode } = useTheme();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className={`text-sm font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          April 2024
        </p>
        <div className="flex gap-1">
          {["‹", "›"].map((c) => (
            <button
              key={c}
              type="button"
              className={`flex h-6 w-6 items-center justify-center rounded text-sm ${
                darkMode
                  ? "text-slate-400 hover:bg-slate-800"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
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

        {APRIL_WEEKS.flat().map((cell, i) => {
          const isSelected = cell.current && cell.day === SELECTED_DAY;
          const hasDot = cell.current && DOT_DAYS.has(cell.day);
          return (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded text-[12px] ${
                  isSelected
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
