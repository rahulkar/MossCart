/**
 * @param {{ score: number; dark?: boolean; size?: "sm" | "md" }} props
 */
export default function EcoDots({ score, dark = false, size = "sm" }) {
  const n = Math.min(5, Math.max(0, Number(score) || 0));
  const filled = dark ? "bg-white/80" : "bg-apple-nearBlack";
  const empty = dark ? "bg-white/25" : "bg-black/15";
  const dotSize = size === "md" ? "h-2 w-2" : "h-1.5 w-1.5";

  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`${dotSize} rounded-full ${i < n ? filled : empty}`} />
      ))}
    </div>
  );
}
