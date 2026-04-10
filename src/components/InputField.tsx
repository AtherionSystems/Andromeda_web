type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
};

function InputField({ label, value, onChange, type = "text", placeholder, error }: Props) {
  return (
    <div className="mb-5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
       className={`mt-1.5 w-full rounded-md border px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-300 focus:border-[#C74634] focus:ring-[#C74634]/20"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default InputField;