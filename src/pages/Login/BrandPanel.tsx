function BrandPanel() {
  return (
    <div className="hidden flex-1 flex-col justify-between bg-[#D1E3E3] p-10 md:flex lg:p-[90px] dark:bg-slate-900">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2.5">
          <div>
            <img
              src="/Media/Images/OracleColour_Transparent.png"
              alt="Oracle Logo"
              className="h-auto w-56"
            />
          </div>

          <div>
            <span className="block text-[58px] font-bold leading-[1.05] text-[#1B1C1B] dark:text-slate-100">
              Atherion Systems
            </span>
            <h1 className="mt-[25px] text-[34px] italic text-[#556666] dark:text-slate-300">
              Secure Terminal Access
            </h1>
          </div>
        </div>

        <div>
          <p className="max-w-[400px] text-[#516162] dark:text-slate-400">
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