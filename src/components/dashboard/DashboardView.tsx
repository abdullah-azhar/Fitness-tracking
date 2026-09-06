"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  useTodayLogStore,
  selectProteinTotal,
  selectWaterTotal,
} from "@/store/useTodayLogStore";
import { PROTEIN_GOAL_G, WATER_GOAL_ML } from "@/lib/goals";
import { parseLocalDate } from "@/lib/date";
import { WaterQuickButtons } from "@/components/water/WaterQuickButtons";
import { MealPresetQuickButtons } from "@/components/meals/MealPresetQuickButtons";
import { StatCard } from "./StatCard";
import { MedicationReminderCard } from "./MedicationReminderCard";
import { HealthMarkersCard } from "./HealthMarkersCard";

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function DashboardView({ userId }: { userId: string }) {
  const {
    loading,
    error,
    lastBodyMetric,
    lastMedicationLog,
    fetchToday,
    fetchLastBodyMetric,
    fetchLastMedicationLog,
  } = useTodayLogStore();
  const proteinTotal = useTodayLogStore(selectProteinTotal);
  const waterTotal = useTodayLogStore(selectWaterTotal);

  useEffect(() => {
    fetchToday(userId);
    fetchLastBodyMetric(userId);
    fetchLastMedicationLog(userId);
  }, [userId, fetchToday, fetchLastBodyMetric, fetchLastMedicationLog]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Couldn&apos;t load your dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Protein today"
          value={loading ? "—" : `${proteinTotal.toFixed(0)}/${PROTEIN_GOAL_G}`}
          unit="g"
          progress={loading ? undefined : (proteinTotal / PROTEIN_GOAL_G) * 100}
        />
        <StatCard
          label="Water today"
          value={
            loading
              ? "—"
              : `${waterTotal.toLocaleString()}/${WATER_GOAL_ML.toLocaleString()}`
          }
          unit="ml"
          progress={loading ? undefined : (waterTotal / WATER_GOAL_ML) * 100}
        />
        <StatCard
          href="/body-metrics/trends"
          label="Last body metrics"
          value={
            lastBodyMetric?.weight != null
              ? lastBodyMetric.weight.toFixed(1)
              : "No entries yet"
          }
          unit={lastBodyMetric?.weight != null ? "kg" : undefined}
          helpText={
            lastBodyMetric
              ? `Logged ${formatDate(lastBodyMetric.test_date)}`
              : "Log your first body metrics entry"
          }
        />
        <MedicationReminderCard lastLog={lastMedicationLog} />
        <HealthMarkersCard userId={userId} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Quick log
        </h2>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Water
            </p>
            <WaterQuickButtons userId={userId} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Meals
              </p>
              <Link
                href="/meals/log"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Log a meal →
              </Link>
            </div>
            <MealPresetQuickButtons userId={userId} limit={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
