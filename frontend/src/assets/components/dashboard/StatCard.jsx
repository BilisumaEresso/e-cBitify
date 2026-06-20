export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient = "from-blue-500 to-blue-600",
  iconBg = "bg-white/20",
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} text-white rounded-2xl shadow-lg p-5 relative overflow-hidden`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-sm opacity-90 font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          {sub && <p className="text-xs opacity-80 mt-2">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
