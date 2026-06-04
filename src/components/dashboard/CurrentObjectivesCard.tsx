import { useState } from "react";
import type { EnrichedTask } from "./types";
import { PRIORITY_BADGE, taskCode } from "./types";
import Skeleton from "./Skeleton";

function ObjectiveItem({ task }: { task: EnrichedTask }) {
  const pb = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium;
  return (
    <div style={{ padding: "11px 0", borderBottom: "1px solid #f0f4f5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 9, letterSpacing: 0.8, color: "#6a8a9a", textTransform: "uppercase" }}>
            {taskCode(task)}
          </p>
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 600, color: "#1a3a4a", lineHeight: 1.4,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {task.title}
          </p>
          {task.description && (
            <p style={{
              margin: "3px 0 0", fontSize: 10, color: "#6a8a9a", lineHeight: 1.4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {task.description}
            </p>
          )}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, flexShrink: 0,
          padding: "2px 7px", borderRadius: 4,
          background: pb.bg, color: pb.color, letterSpacing: 0.3,
        }}>
          {task.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

interface CurrentObjectivesCardProps {
  loading: boolean;
  darkMode: boolean;
  objectives: EnrichedTask[];
}

export default function CurrentObjectivesCard({ loading, darkMode, objectives }: CurrentObjectivesCardProps) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div style={{ background: darkMode ? "#0f172a" : "#fff", border: `1px solid ${darkMode ? "#1e293b" : "#cdd8db"}`, borderRadius: 10, padding: "14px 16px", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: darkMode ? "#e2e8f0" : "#1a3a4a" }}>Current Objectives</span>
        <span style={{
          fontSize: 9, fontWeight: 700,
          padding: "3px 8px", borderRadius: 4,
          background: darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff", color: "#2563eb", letterSpacing: 0.4,
        }}>
          OPEN
        </span>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} h={48} darkMode={darkMode} />)}
        </div>
      ) : objectives.length === 0 ? (
        <p style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#6a8a9a", textAlign: "center", padding: "16px 0" }}>
          All tasks are completed.
        </p>
      ) : (
        <>
          {(showAll ? objectives : objectives.slice(0, 3)).map((t) => (
            <ObjectiveItem key={t.id} task={t} />
          ))}
          {objectives.length > 3 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              style={{
                marginTop: 12, width: "100%", fontSize: 10,
                color: "#c74634", background: "none", border: "none",
                cursor: "pointer", fontWeight: 700, letterSpacing: 0.5,
                textTransform: "uppercase", textAlign: "center", padding: 0,
              }}
            >
              {showAll ? "Hide Objectives" : `View All Objectives (${objectives.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
