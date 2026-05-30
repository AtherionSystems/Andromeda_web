import type { ApiTask, TaskPriority } from "../../types/api";

const PRIORITY: Record<
  TaskPriority,
  { bg: string; text: string; label: string }
> = {
  low: { bg: "#f0fdf4", text: "#16a34a", label: "Low" },
  medium: { bg: "#eff6ff", text: "#2563eb", label: "Medium" },
  high: { bg: "#fff7ed", text: "#d97706", label: "High" },
  critical: { bg: "#fef2f2", text: "#c74634", label: "Critical" },
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function TaskCard({ task }: { task: ApiTask }) {
  const p = PRIORITY[task.priority] ?? PRIORITY.medium;

  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #cdd8db",
        borderRadius: 8,
        padding: "12px 14px",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow = "none")
      }
    >
      {/* Project label */}
      {task.projectName && (
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 10,
            fontWeight: 600,
            color: "#6a8a9a",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {task.projectName}
        </p>
      )}

      {/* Title */}
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 13,
          fontWeight: 600,
          color: "#1a3a4a",
          lineHeight: 1.4,
        }}
      >
        {task.title}
      </p>

      {/* Priority + due date row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: 99,
            background: p.bg,
            color: p.text,
            letterSpacing: 0.3,
          }}
        >
          {p.label}
        </span>
        <span style={{ fontSize: 10, color: "#6a8a9a" }}>
          Due {fmt(task.dueDate)}
        </span>
      </div>

      {/* Story points badge */}
      {task.storyPoints != null && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 10, color: "#6a8a9a" }}>SP</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#f0f4f5",
              color: "#1a3a4a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {task.storyPoints}
          </span>
        </div>
      )}
    </article>
  );
}

export default TaskCard;
