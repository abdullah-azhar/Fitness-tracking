"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/lib/date";
import { calcBmi } from "@/lib/bodyMetrics";
import { useBodyMetricsStore } from "@/store/useBodyMetricsStore";
import { useToastStore } from "@/store/useToastStore";

function toNullableNumber(value: string): number | null {
  return value === "" ? null : Number(value);
}

export function BodyMetricsLogForm({ userId }: { userId: string }) {
  const router = useRouter();
  const addEntry = useBodyMetricsStore((state) => state.addEntry);
  const showToast = useToastStore((state) => state.showToast);

  const [testDate, setTestDate] = useState(todayDateString());
  const [weight, setWeight] = useState("");
  const [skeletalMuscle, setSkeletalMuscle] = useState("");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [visceralFat, setVisceralFat] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bmi, setBmi] = useState("");
  const [bmiTouched, setBmiTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("height_cm")
      .eq("user_id", userId)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (data?.height_cm != null) setHeightCm(String(data.height_cm));
        },
        () => {
          // Non-critical: BMI just falls back to manual entry.
        }
      );
  }, [userId]);

  useEffect(() => {
    if (bmiTouched) return;
    const w = Number(weight);
    const h = Number(heightCm);
    if (weight === "" || heightCm === "" || Number.isNaN(w) || Number.isNaN(h) || h <= 0) {
      return;
    }
    setBmi(calcBmi(w, h).toFixed(1));
  }, [weight, heightCm, bmiTouched]);

  async function saveHeight() {
    const h = Number(heightCm);
    if (heightCm === "" || Number.isNaN(h) || h <= 0) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .upsert({ user_id: userId, height_cm: h, updated_at: new Date().toISOString() });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedWeight = Number(weight);
    if (weight === "" || Number.isNaN(parsedWeight)) {
      setError("Weight is required.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("body_metrics")
      .insert({
        user_id: userId,
        test_date: testDate,
        weight: parsedWeight,
        skeletal_muscle: toNullableNumber(skeletalMuscle),
        body_fat_pct: toNullableNumber(bodyFatPct),
        visceral_fat: toNullableNumber(visceralFat),
        bmi: toNullableNumber(bmi),
      })
      .select()
      .single();

    if (error) {
      setSubmitting(false);
      setError(error.message);
      return;
    }

    addEntry(data);
    showToast("Body metrics saved");
    router.push("/body-metrics/trends");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Test date
        </label>
        <input
          type="date"
          required
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Weight (kg)
          </label>
          <input
            type="number"
            step="any"
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Skeletal muscle (kg)
          </label>
          <input
            type="number"
            step="any"
            value={skeletalMuscle}
            onChange={(e) => setSkeletalMuscle(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Body fat (%)
          </label>
          <input
            type="number"
            step="any"
            value={bodyFatPct}
            onChange={(e) => setBodyFatPct(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Visceral fat (level)
          </label>
          <input
            type="number"
            step="any"
            value={visceralFat}
            onChange={(e) => setVisceralFat(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Height (cm)
          </label>
          <input
            type="number"
            step="any"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            onBlur={saveHeight}
            placeholder="Saved to your profile"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            BMI
          </label>
          <input
            type="number"
            step="any"
            value={bmi}
            onChange={(e) => {
              setBmi(e.target.value);
              setBmiTouched(true);
            }}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {heightCm
              ? "Auto-calculated from height; edit to override."
              : "Add your height to auto-calculate, or enter it manually."}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save entry"}
      </button>
    </form>
  );
}
