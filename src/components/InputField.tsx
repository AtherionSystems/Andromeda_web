import { useTheme } from "../contexts/useTheme";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  rightIconSrc?: string;
  rightIconAlt?: string;
  rightIconAriaLabel?: string;
  onRightIconClick?: () => void;
};

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  rightIconSrc,
  rightIconAlt,
  rightIconAriaLabel,
  onRightIconClick,
}: Props) {
  const { darkMode } = useTheme();

  return (
    <div className="mb-5">
      <label className={`text-sm font-medium ${darkMode ? "text-slate-100" : "text-slate-700"}`}>{label}</label>
      <div className="relative mt-1.5">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
            darkMode
              ? "bg-slate-800 text-white placeholder:text-slate-300"
              : "text-slate-800 placeholder:text-slate-400"
          } ${
            rightIconSrc ? "pr-10" : ""
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : darkMode
                ? "border-slate-600 focus:border-[#C74634] focus:ring-[#C74634]/20"
                : "border-slate-300 focus:border-[#C74634] focus:ring-[#C74634]/20"
          }`}
        />
        {rightIconSrc && onRightIconClick ? (
          <button
            type="button"
            onClick={onRightIconClick}
            aria-label={rightIconAriaLabel ?? "Toggle visibility"}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <img src={rightIconSrc} alt={rightIconAlt ?? "visibility icon"} className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      {error ? <p className={`mt-1 text-xs ${darkMode ? "text-red-300" : "text-red-600"}`}>{error}</p> : null}
    </div>
  );
}

export default InputField;