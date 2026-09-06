import { parseLocalDate } from "@/lib/date";
import type { BodyMetricRow } from "@/lib/bodyMetrics";

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cell(value: number | null) {
  return value != null ? value : "—";
}

export function BodyMetricsTable({ entries }: { entries: BodyMetricRow[] }) {
  const rows = [...entries].reverse(); // most recent first

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 font-medium">Weight (kg)</th>
            <th className="px-4 py-2 font-medium">Muscle (kg)</th>
            <th className="px-4 py-2 font-medium">Fat %</th>
            <th className="px-4 py-2 font-medium">Visceral fat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.id} className="text-slate-700 dark:text-slate-300">
              <td className="whitespace-nowrap px-4 py-2">{formatDate(row.test_date)}</td>
              <td className="px-4 py-2">{cell(row.weight)}</td>
              <td className="px-4 py-2">{cell(row.skeletal_muscle)}</td>
              <td className="px-4 py-2">{cell(row.body_fat_pct)}</td>
              <td className="px-4 py-2">{cell(row.visceral_fat)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
