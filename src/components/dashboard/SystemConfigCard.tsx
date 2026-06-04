interface SystemConfigCardProps {
  healthUp: boolean | null;
}

export default function SystemConfigCard({ healthUp }: SystemConfigCardProps) {
  const healthColor = healthUp === null ? "#94a3b8" : healthUp ? "#4ade80" : "#f87171";
  const healthLabel = healthUp === null ? "Checking" : healthUp ? "Operational" : "Unavailable";

  return (
    <div className="bg-[#1a3a4a] rounded-lg px-4 py-3.5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
          <svg viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" width="13" height="13">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
          </svg>
        </div>
        <span className="text-[12px] font-bold text-white/90">System Config</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/45">Availability</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: healthColor }} />
          <span className="text-[10px] font-semibold" style={{ color: healthColor }}>{healthLabel}</span>
        </div>
      </div>

      <div className="border-t border-white/10 mt-3 pt-2.5">
        <p className="m-0 mb-0.5 text-[8px] uppercase tracking-[1px] text-white/35">Last Deploy</p>
        <p className="m-0 text-[10px] font-medium text-white/70">Apr 14, 19:04:13</p>
      </div>
    </div>
  );
}
