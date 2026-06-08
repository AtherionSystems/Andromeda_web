import { useTheme } from "../contexts/useTheme";
import type { ThemeMode } from "../contexts/themeContextValue";

type ThemeOption = {
  mode: ThemeMode;
  label: string;
  previewClassName: string;
  previewToneClassName: string;
  accentClassName: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    mode: "light",
    label: "Light Mode",
    previewClassName: "bg-slate-50",
    previewToneClassName: "bg-[#d8d8d8]",
    accentClassName: "text-[#c74634]",
  },
  {
    mode: "dark",
    label: "Dark Mode",
    previewClassName: "bg-[#111b33]",
    previewToneClassName: "bg-[#334155]",
    accentClassName: "text-slate-200",
  },
  {
    mode: "system",
    label: "System Default",
    previewClassName: "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-700",
    previewToneClassName: "bg-white/75",
    accentClassName: "text-slate-600",
  },
];

function ThemePreview({ option, active, onClick }: { option: ThemeOption; active: boolean; onClick: () => void }) {
  const { darkMode } = useTheme();
  const isSystem = option.mode === "system";
  const labelClassName = darkMode ? "text-slate-200" : "text-[#5d7180]";
  const previewLineLight = darkMode ? "bg-slate-200/75" : "bg-[#d8d8d8]";
  const previewLineDark = darkMode ? "bg-slate-400/50" : "bg-slate-900/60";
  const cardSurfaceClassName = darkMode ? "bg-slate-950/90" : "bg-slate-100";
  const previewFrameClassName = darkMode
    ? "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]"
    : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex min-h-[160px] flex-1 flex-col overflow-hidden rounded-[10px] border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${cardSurfaceClassName} ${
        active
          ? "border-[#c74634] shadow-[0_0_0_1px_rgba(199,70,52,0.2)]"
          : darkMode
            ? "border-slate-700/70"
            : "border-transparent"
      }`}
      style={{ minWidth: 0 }}
    >
      <div className={`relative flex h-[105px] flex-col rounded-[4px] ${option.previewClassName} px-5 py-4 ${previewFrameClassName}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-28 rounded-full ${isSystem ? (darkMode ? "bg-slate-200/75" : "bg-white/70") : previewLineLight}`} />
          <span className={`h-2.5 w-24 rounded-full ${isSystem ? (darkMode ? "bg-slate-400/50" : "bg-slate-900/60") : previewLineDark}`} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`h-2.5 w-28 rounded-full ${isSystem ? (darkMode ? "bg-slate-200/75" : "bg-white/70") : previewLineLight}`} />
          <span className={`h-2.5 w-24 rounded-full ${isSystem ? (darkMode ? "bg-slate-400/50" : "bg-slate-900/60") : previewLineDark}`} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`h-2.5 w-36 rounded-full ${isSystem ? (darkMode ? "bg-slate-200/65" : "bg-white/65") : previewLineLight}`} />
        </div>

        {active ? (
          <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#c74634] text-[12px] font-semibold text-white shadow-sm">
            ✓
          </span>
        ) : null}
      </div>

      <span className={`mt-5 text-center text-[15px] font-medium ${active ? option.accentClassName : labelClassName}`}>
        {option.label}
      </span>
    </button>
  );
}

function Configuration() {
  const { darkMode, themeMode, setThemeMode } = useTheme();
  const headingClassName = darkMode ? "text-slate-100" : "text-slate-900";
  const subheadingClassName = darkMode ? "text-slate-400" : "text-slate-700";

  return (
    <div className="w-full px-0 pb-4 pt-3">
      <div className="mb-8 px-6">
        <h1 className={`text-2xl font-bold tracking-tight transition-colors duration-200 ${headingClassName}`}>
          Settings
        </h1>
        <p className={`mt-2 max-w-2xl text-sm leading-6 transition-colors duration-200 ${subheadingClassName}`}>
          Manage your platform preferences regarding appearance, notifications, and other configurations. Changes are applied immediately and persist across sessions.
        </p>
      </div>

      <section
        className="card-entrance mx-6 rounded-[14px] border p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-colors duration-200"
        style={{
          backgroundColor: darkMode ? "#0f172a" : "#ffffff",
          borderColor: darkMode ? "#1e293b" : "rgba(0,0,0,0.06)",
        }}
      >
        <div className="mb-6">
          <h2 className={`text-[20px] font-bold tracking-tight transition-colors duration-200 ${headingClassName}`}>
            Interface Appearance
          </h2>

        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {THEME_OPTIONS.map((option) => (
            <ThemePreview
              key={option.mode}
              option={option}
              active={themeMode === option.mode}
              onClick={() => setThemeMode(option.mode)}
            />
          ))}
        </div>

        <div
          className="mt-7 rounded-xl border px-4 py-3 text-[16px] leading-6 transition-colors duration-200"
          style={{
            backgroundColor: darkMode ? "rgba(30,41,59,0.75)" : "#f7fafb",
            borderColor: darkMode ? "#1e293b" : "rgba(0,0,0,0.06)",
            color: darkMode ? "#cbd5e1" : "#5d7180",
          }}
        >
          Changes are shared across the full workspace, including dashboards, backlog, analytics, and login pages.
        </div>
      </section>
    </div>
  );
}

export default Configuration;