import Skeleton from "./Skeleton";

interface KpiCardsProps {
  loading: boolean;
  darkMode: boolean;
  completionPct: number;
  activeBlocks: number;
}

export default function KpiCards({ loading, darkMode, completionPct, activeBlocks }: KpiCardsProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className={`bg-[#c74634] rounded-[10px] p-4 flex-1 ${darkMode ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : ""}`}>
        <p className="m-0 mb-1 text-[9px] tracking-[1.1px] uppercase text-white/70 font-semibold">
          Completion Rate
        </p>
        {loading ? (
          <Skeleton w={90} h={36} darkMode={darkMode} />
        ) : (
          <p className="m-0 mb-1.5 text-[32px] font-extrabold text-white leading-none tracking-[-1px]">
            {completionPct}%
          </p>
        )}
        <p className="m-0 text-[10px] text-white/75 leading-[1.5]">
          Task completion across all projects.
        </p>
      </div>

      <div className={`bg-[#2a4a5a] rounded-[10px] px-4 py-[14px] ${darkMode ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : ""}`}>
        <p className="m-0 mb-1 text-[9px] tracking-[1.1px] uppercase text-white/55 font-semibold">
          Active Blocks
        </p>
        {loading ? (
          <Skeleton w={50} h={30} darkMode={darkMode} />
        ) : (
          <p className="m-0 mb-1 text-[28px] font-extrabold text-white leading-none tracking-[-1px]">
            {String(activeBlocks).padStart(2, "0")}
          </p>
        )}
        <p className="m-0 text-[10px] text-white/60 leading-[1.5]">
          Critical tasks pending across all projects.
        </p>
      </div>
    </div>
  );
}
