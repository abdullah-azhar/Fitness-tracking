import { parseLocalDate } from "@/lib/date";
import {
  METRICS,
  deltaTone,
  toneColor,
  type BodyMetricRow,
} from "@/lib/bodyMetrics";

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function SummaryCard({ entries }: { entries: BodyMetricRow[] }) {
  if (entries.length === 0) return null;

  const latest = entries[entries.length - 1];
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Latest entry
        </h2>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {formatDate(latest.test_date)}
          {previous && ` vs ${formatDate(previous.test_date)}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {METRICS.map((metric) => {
          const value = latest[metric.key];
          const prevValue = previous?.[metric.key] ?? null;
          const delta =
            value != null && prevValue != null ? value - prevValue : null;
          const tone = delta != null ? deltaTone(metric.goodDirection, delta) : "neutral";

          return (
            <div key={metric.key}>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
              <p className="mt-0.5 text-xl font-semibold text-slate-900 dark:text-slate-50">
                {value != null ? value : "—"}
                {value != null && (
                  <span className="ml-0.5 text-sm font-normal text-slate-400 dark:text-slate-500">
                    {metric.unit}
                  </span>
                )}
              </p>
              {delta != null && (
                <p
                  className="mt-0.5 text-xs font-medium"
                  style={{ color: toneColor(tone) }}
                >
                  {delta === 0 ? "→" : delta > 0 ? "↑" : "↓"}{" "}
                  {Math.abs(delta).toFixed(1)}
                  {metric.unit}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
