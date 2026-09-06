"use client";

import { useEffect } from "react";
import { WATER_GOAL_ML } from "@/lib/goals";
import { createClient } from "@/lib/supabase/client";
import { useTodayLogStore, selectWaterTotal } from "@/store/useTodayLogStore";
import { useToastStore } from "@/store/useToastStore";
import { StatCard } from "@/components/dashboard/StatCard";
import { WaterQuickButtons } from "./WaterQuickButtons";

export function WaterLogView({ userId }: { userId: string }) {
  const { waterLogs, fetchToday, removeWaterLog } = useTodayLogStore();
  const waterTotal = useTodayLogStore(selectWaterTotal);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    fetchToday(userId);
  }, [userId, fetchToday]);

  async function handleUndo() {
    const last = waterLogs[waterLogs.length - 1];
    if (!last) return;

    const supabase = createClient();
    const { error } = await supabase.from("water_logs").delete().eq("id", last.id);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    removeWaterLog(last.id);
    showToast("Removed last entry");
  }

  return (
    <div className="space-y-6">
      <StatCard
        label="Water today"
        value={`${waterTotal.toLocaleString()}/${WATER_GOAL_ML.toLocaleString()}`}
        unit="ml"
        progress={(waterTotal / WATER_GOAL_ML) * 100}
      />

      <WaterQuickButtons userId={userId} size="lg" />

      <button
        type="button"
        onClick={handleUndo}
        disabled={waterLogs.length === 0}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Undo last entry
      </button>
    </div>
  );
}
