"use client";

import { useEffect, useRef, useState } from "react";
import { useMealPresets } from "@/lib/hooks/useMealPresets";
import { logMeal } from "@/lib/logging";
import { PROTEIN_GOAL_G } from "@/lib/goals";
import { useTodayLogStore, selectProteinTotal } from "@/store/useTodayLogStore";
import { StatCard } from "@/components/dashboard/StatCard";

export function MealsLogForm({ userId }: { userId: string }) {
  const { presets, addPreset, removePreset } = useMealPresets(userId);
  const { meals, fetchToday, addMeal } = useTodayLogStore();
  const proteinTotal = useTodayLogStore(selectProteinTotal);

  const [mealName, setMealName] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddPreset, setShowAddPreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetProtein, setPresetProtein] = useState("");

  const mealNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchToday(userId);
  }, [userId, fetchToday]);

  function applyPreset(preset: { name: string; protein_g: number }) {
    setMealName(preset.name);
    setProteinG(String(preset.protein_g));
    mealNameRef.current?.focus();
  }

  async function handleSavePreset() {
    const protein = Number(presetProtein);
    if (!presetName.trim() || presetProtein === "" || Number.isNaN(protein)) return;
    const { error } = await addPreset(presetName.trim(), protein);
    if (!error) {
      setPresetName("");
      setPresetProtein("");
      setShowAddPreset(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!mealName.trim()) {
      setError("Meal name is required.");
      return;
    }
    const protein = proteinG === "" ? null : Number(proteinG);
    if (proteinG !== "" && Number.isNaN(protein)) {
      setError("Protein must be a number.");
      return;
    }

    setSubmitting(true);
    const { data, error } = await logMeal(userId, {
      meal_name: mealName.trim(),
      protein_g: protein,
      notes: notes.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    addMeal(data);
    setMealName("");
    setProteinG("");
    setNotes("");
    mealNameRef.current?.focus();
  }

  const todaysMeals = [...meals].reverse();

  return (
    <div className="space-y-4">
      <StatCard
        label="Protein today"
        value={`${proteinTotal.toFixed(0)}/${PROTEIN_GOAL_G}`}
        unit="g"
        progress={(proteinTotal / PROTEIN_GOAL_G) * 100}
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Quick-add presets
          </p>
          <button
            type="button"
            onClick={() => setShowAddPreset((v) => !v)}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            {showAddPreset ? "Cancel" : "+ Add preset"}
          </button>
        </div>

        {showAddPreset && (
          <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400">Name</label>
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="mt-1 w-40 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400">Protein (g)</label>
              <input
                type="number"
                step="any"
                value={presetProtein}
                onChange={(e) => setPresetProtein(e.target.value)}
                className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <button
              type="button"
              onClick={handleSavePreset}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <span
              key={preset.id}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 pl-3 pr-1 py-1 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              <button
                type="button"
                onClick={() => applyPreset(preset)}
                className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {preset.name} · {preset.protein_g}g
              </button>
              <button
                type="button"
                onClick={() => removePreset(preset.id)}
                aria-label={`Remove ${preset.name} preset`}
                className="rounded-full px-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Meal name
          </label>
          <input
            ref={mealNameRef}
            required
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Protein (g)
          </label>
          <input
            type="number"
            step="any"
            value={proteinG}
            onChange={(e) => setProteinG(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Notes (optional)
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save meal"}
        </button>
      </form>

      {todaysMeals.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Logged today
          </h2>
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {todaysMeals.map((meal) => (
              <li key={meal.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700 dark:text-slate-300">{meal.meal_name}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {meal.protein_g != null ? `${meal.protein_g}g` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
