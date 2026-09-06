"use client";

import { useEffect } from "react";
import { useBodyMetricsStore } from "@/store/useBodyMetricsStore";
import { METRICS } from "@/lib/bodyMetrics";
import { MetricLineChart } from "@/components/charts/MetricLineChart";
import { SummaryCard } from "./SummaryCard";
import { BodyMetricsTable } from "./BodyMetricsTable";

export function BodyMetricsTrendsView({ userId }: { userId: string }) {
  const { entries, loading, error, fetchEntries } = useBodyMetricsStore();

  useEffect(() => {
    fetchEntries(userId);
  }, [userId, fetchEntries]);

  if (loading && entries.length === 0) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Couldn&apos;t load body metrics: {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No body metrics logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SummaryCard entries={entries} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {METRICS.map((metric) => (
          <MetricLineChart
            key={metric.key}
            label={metric.label}
            unit={metric.unit}
            color={metric.color}
            data={entries.map((e) => ({
              test_date: e.test_date,
              value: e[metric.key],
            }))}
          />
        ))}
      </div>

      <BodyMetricsTable entries={entries} />
    </div>
  );
}
