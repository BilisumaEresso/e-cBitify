export default function BarChart({ data = [], color = "bg-blue-500", height = 160 }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <span className="text-xs font-semibold text-gray-600">{d.value}</span>
          <div
            className={`w-full rounded-t-lg ${color} transition-all duration-500 min-h-[4px]`}
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
