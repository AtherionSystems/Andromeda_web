import { useState } from "react";

function TwoFactorInput({ onChange, error }: { onChange: (val: string) => void; error?: string }) {
  const [values, setValues] = useState(Array(6).fill(""));

  const handleChange = (val: string, index: number) => {
    const newValues = [...values];
    newValues[index] = val.slice(-1);
    setValues(newValues);
    onChange(newValues.join(""));
  };

  return (
    <div className="my-5 flex flex-col gap-2.5">
      <h3 className="m-0 flex items-center gap-2 text-base font-semibold text-slate-800">
        <img src="/Media/Icons/lockIcon.png" alt="Lock icon" className="h-5 w-5" />
        2FA Verification Required
      </h3>
      <div className="flex gap-2.5">
        {values.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={(e) => handleChange(e.target.value, i)}
            maxLength={1}
            className={`h-10 w-10 rounded-md border text-center text-base font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 focus:border-[#C74634] focus:ring-[#C74634]/20"
            }`}
          />
        ))}
      </div>
      <p className="m-0 text-sm text-slate-600">Enter the 6-digit code from your authenticator app.</p>
      {error ? <p className="m-0 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default TwoFactorInput;