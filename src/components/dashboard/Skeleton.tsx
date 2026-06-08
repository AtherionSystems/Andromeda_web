interface SkeletonProps {
  w?: string | number;
  h?: number;
  radius?: number;
  darkMode?: boolean;
}

export default function Skeleton({ w = "100%", h = 14, radius = 4, darkMode }: SkeletonProps) {
  return (
    <div
      className="animate-[shimmer_1.4s_infinite]"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: darkMode
          ? "linear-gradient(90deg, #1f2937 25%, #334155 50%, #1f2937 75%)"
          : "linear-gradient(90deg, #f0f4f5 25%, #e4ecee 50%, #f0f4f5 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}
