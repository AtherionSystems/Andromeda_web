import { useTheme } from "../../contexts/useTheme";

function BrandPanel() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`hidden flex-1 flex-col justify-between p-10 md:flex lg:p-[90px] ${
        darkMode ? "bg-slate-800" : "bg-[#D1E3E3]"
      }`}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <div>
            <img
              src="/Andromeda_web/Media/Images/OracleColour_Transparent.png"
              alt="Oracle Logo"
              className="h-auto w-56"
            />
          </div>

          <div>
            <span className={`block text-[58px] font-bold leading-[1.05] ${darkMode ? "text-slate-100" : "text-[#1B1C1B]"}`}>
              Andromeda
            </span>
            <h1 className={`mt-[25px] text-[34px] italic ${darkMode ? "text-slate-300" : "text-[#556666]"}`}>
              Atherion Systems
            </h1>
          </div>
        </div>

        <div>
          <p className={`max-w-[400px] ${darkMode ? "text-slate-400" : "text-[#516162]"}`}>
            Accessing the proprietary enterprise dashboard requires multi-factor authentication for
            dataintegrity and system security.
          </p>
        </div>
      </div>
      <div />
    </div>
  );
}

export default BrandPanel;