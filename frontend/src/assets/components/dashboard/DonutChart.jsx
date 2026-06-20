export default function DonutChart({ segments = [], size = 140 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const stops = segments.map((seg) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex items-center gap-6">
      <div
        className="rounded-full shrink-0"
        style={{
          width: size,
          height: size,
          background: total
            ? `conic-gradient(${stops.join(", ")})`
            : "#e5e7eb",
        }}
      >
        <div
          className="rounded-full bg-white m-auto flex items-center justify-center"
          style={{
            width: size * 0.62,
            height: size * 0.62,
            margin: size * 0.19,
          }}
        >
          <span className="text-lg font-bold text-gray-800">{total}</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-600">{seg.label}</span>
            </div>
            <span className="font-semibold text-gray-800">
              {seg.value}{" "}
              <span className="text-gray-400 font-normal">
                ({Math.round((seg.value / total) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
