"use client";

import { useState } from "react";
import { useMealPresets } from "@/lib/hooks/useMealPresets";
import { logMeal } from "@/lib/logging";
import { useTodayLogStore } from "@/store/useTodayLogStore";
import { useToastStore } from "@/store/useToastStore";

export function MealPresetQuickButtons({
  userId,
  limit,
}: {
  userId: string;
  limit?: number;
}) {
  const { presets, loading } = useMealPresets(userId);
  const addMeal = useTodayLogStore((state) => state.addMeal);
  const showToast = useToastStore((state) => state.showToast);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleTap(preset: { id: string; name: string; protein_g: number }) {
    setPendingId(preset.id);
    const { data, error } = await logMeal(userId, {
      meal_name: preset.name,
      protein_g: preset.protein_g,
    });
    setPendingId(null);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    addMeal(data);
    showToast(`Logged ${preset.name}`);
  }

  if (loading || presets.length === 0) return null;
  const shown = limit ? presets.slice(0, limit) : presets;

  return (
    <div className="flex flex-wrap gap-2">
      {shown.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => handleTap(preset)}
          disabled={pendingId !== null}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {pendingId === preset.id ? "…" : `${preset.name} · ${preset.protein_g}g`}
        </button>
      ))}
    </div>
  );
}
