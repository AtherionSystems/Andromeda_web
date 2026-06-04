interface SystemConfigCardProps {
  healthUp: boolean | null;
}

export default function SystemConfigCard({ healthUp }: SystemConfigCardProps) {
  const healthColor = healthUp === null ? "#94a3b8" : healthUp ? "#4ade80" : "#f87171";
  const healthLabel = healthUp === null ? "Checking" : healthUp ? "Operational" : "Unavailable";

  return (
    <div style={{ background: "#1a3a4a", borderRadius: 8, padding: "14px 16px", marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" width="13" height="13">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
          </svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>System Config</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Availability</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: healthColor, display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: healthColor }}>{healthLabel}</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 12, paddingTop: 10 }}>
        <p style={{ margin: "0 0 3px", fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          Last Deploy
        </p>
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
          Apr 14, 19:04:13
        </p>
      </div>
    </div>
  );
}
