import { TrendingUp } from "lucide-react"

interface SprintVelocityCardProps {
  velocity?: number
  velocityChange?: number
  loading?: boolean
  index?: number
}

interface CompletionRateCardProps {
  completionRate?: number
  loading?: boolean
  index?: number
}

function Skeleton({ w = "100%", h = 14, radius = 4 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  )
}

export function SprintVelocityCard({ velocity = 42.8, velocityChange = 12, loading = false, index }: SprintVelocityCardProps) {
  return (
    <div className={`card-entrance flex-1 rounded-[10px] bg-[#2a4a5a] p-[12px_16px_8px_16px]`} style={{ animationDelay: `${(index ?? 0) * 70}ms` }}>
      <p style={{ margin: "0 0 4px", fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
        Sprint Velocity
      </p>
      {loading ? (
        <Skeleton w={50} h={30} />
      ) : (
        <>
          <p style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
            {velocity}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
            <TrendingUp className="h-3 w-3" />
            <span>+{velocityChange}% from previous cycle</span>
          </div>
        </>
      )}
    </div>
  )
}

export function CompletionRateCard({ completionRate = 94, loading = false, index }: CompletionRateCardProps) {
  return (
    <div className={`card-entrance flex-1 rounded-[10px] bg-[#c74634] p-[14px_16px_8px_16px]`} style={{ animationDelay: `${(index ?? 0) * 70}ms` }}>
      <p style={{ margin: "0 0 4px", fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
        Completion Rate
      </p>
      {loading ? (
        <Skeleton w={90} h={36} />
      ) : (
        <>
          <p style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
            {completionRate}%
          </p>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
            Task completion for the current project.
          </p>
        </>
      )}
    </div>
  )
}

export default SprintVelocityCard