import Skeleton from "./Skeleton";

interface KpiCardsProps {
  loading: boolean;
  darkMode: boolean;
  completionPct: number;
  activeBlocks: number;
}

export default function KpiCards({ loading, darkMode, completionPct, activeBlocks }: KpiCardsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: "#c74634", borderRadius: 10, padding: "16px 16px", flex: 1, boxShadow: darkMode ? "0 1px 0 rgba(255,255,255,0.04) inset" : "none" }}>
        <p style={{ margin: "0 0 4px", fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          Completion Rate
        </p>
        {loading ? (
          <Skeleton w={90} h={36} darkMode={darkMode} />
        ) : (
          <p style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
            {completionPct}%
          </p>
        )}
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
          Task completion across all projects.
        </p>
      </div>

      <div style={{ background: "#2a4a5a", borderRadius: 10, padding: "14px 16px", boxShadow: darkMode ? "0 1px 0 rgba(255,255,255,0.04) inset" : "none" }}>
        <p style={{ margin: "0 0 4px", fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
          Active Blocks
        </p>
        {loading ? (
          <Skeleton w={50} h={30} darkMode={darkMode} />
        ) : (
          <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
            {String(activeBlocks).padStart(2, "0")}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
          Critical tasks pending across all projects.
        </p>
      </div>
    </div>
  );
}
