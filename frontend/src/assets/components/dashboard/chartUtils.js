/** Build last N days of { label, value } from dated records */
export function buildDailySeries(records, days = 7, getValue = (items) => items.length) {
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const label = start.toLocaleDateString("en-US", { weekday: "short" });
    const dayItems = records.filter((r) => {
      const t = new Date(r.createdAt || r.date);
      return t >= start && t < end;
    });
    series.push({ label, value: getValue(dayItems) });
  }
  return series;
}

export function formatCurrency(n) {
  return `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
