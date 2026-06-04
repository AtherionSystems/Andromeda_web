import SystemConfigCard from "./SystemConfigCard";

const MOCK_EVENTS = [
  { day: "16", month: "Apr", title: "Stakeholder Review", tag: null as string | null, tagColor: null as string | null, sub: "7:00 AM" },
  { day: "17", month: "Apr", title: "Sprint Retrospective", tag: null as string | null, tagColor: null as string | null, sub: "10:00 AM" },
];

function EventItem({ ev }: { ev: typeof MOCK_EVENTS[0] }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f0f4f5" }}>
      <div style={{
        flexShrink: 0, textAlign: "center",
        background: "#f0f4f5", borderRadius: 6,
        padding: "4px 8px", minWidth: 32,
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a3a4a", lineHeight: 1 }}>{ev.day}</p>
        <p style={{ margin: "1px 0 0", fontSize: 8, color: "#6a8a9a", textTransform: "uppercase", letterSpacing: 0.5 }}>{ev.month}</p>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1a3a4a" }}>{ev.title}</p>
          {ev.tag && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              padding: "2px 6px", borderRadius: 3,
              background: "#fef2f2", color: ev.tagColor ?? "#c74634", letterSpacing: 0.3,
            }}>
              {ev.tag}
            </span>
          )}
        </div>
        {ev.sub && <p style={{ margin: "2px 0 0", fontSize: 10, color: "#6a8a9a" }}>{ev.sub}</p>}
      </div>
    </div>
  );
}

interface UpcomingCardProps {
  darkMode: boolean;
  healthUp: boolean | null;
}

export default function UpcomingCard({ darkMode, healthUp }: UpcomingCardProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ background: darkMode ? "#0f172a" : "#fff", border: `1px solid ${darkMode ? "#1e293b" : "#cdd8db"}`, borderRadius: 10, padding: "14px 16px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: darkMode ? "#e2e8f0" : "#1a3a4a" }}>Upcoming</span>
        <div style={{ marginTop: 4 }}>
          {MOCK_EVENTS.map((ev) => <EventItem key={ev.title} ev={ev} />)}
        </div>
      </div>
      <SystemConfigCard healthUp={healthUp} />
    </div>
  );
}
