"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutTemplates } from "@/lib/hooks/useWorkoutTemplates";
import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/lib/date";
import { formatTargetRange, hitTopOfRange, isTimeBased } from "@/lib/workouts";
import type { WorkoutTemplateRow } from "@/lib/workouts";
import { useWorkoutStore, selectLastUsedWeight } from "@/store/useWorkoutStore";
import { useToastStore } from "@/store/useToastStore";

interface RowState {
  sets: string;
  reps: string;
  weight: string;
}

export function WorkoutLogForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { days, loading: templatesLoading } = useWorkoutTemplates();
  const { entries, fetchEntries, addEntry } = useWorkoutStore();
  const showToast = useToastStore((state) => state.showToast);

  const [sessionDate, setSessionDate] = useState(todayDateString());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries(userId);
  }, [userId, fetchEntries]);

  const day = days.find((d) => d.dayName === selectedDay) ?? null;

  function selectDay(dayName: string) {
    const target = days.find((d) => d.dayName === dayName);
    if (!target) return;

    setSelectedDay(dayName);
    setError(null);
    const initial: Record<string, RowState> = {};
    for (const exercise of target.exercises) {
      const lastWeight = selectLastUsedWeight(entries, exercise.exercise_name);
      initial[exercise.exercise_name] = {
        sets: String(exercise.target_sets),
        reps: "",
        weight: lastWeight != null ? String(lastWeight) : "",
      };
    }
    setRows(initial);
  }

  function updateRow(exerciseName: string, field: keyof RowState, value: string) {
    setRows((prev) => ({
      ...prev,
      [exerciseName]: { ...prev[exerciseName], [field]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!day) return;

    const toInsert = day.exercises
      .filter((exercise) => rows[exercise.exercise_name]?.reps !== "")
      .map((exercise) => {
        const row = rows[exercise.exercise_name];
        return {
          user_id: userId,
          date: sessionDate,
          exercise: exercise.exercise_name,
          sets: row.sets === "" ? null : Number(row.sets),
          reps: Number(row.reps),
          weight: row.weight === "" ? null : Number(row.weight),
        };
      });

    if (toInsert.length === 0) {
      setError("Log at least one exercise (enter its reps) before saving.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("workouts").insert(toInsert).select();
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    for (const row of data ?? []) addEntry(row);
    showToast(`Workout saved — ${toInsert.length} exercise${toInsert.length === 1 ? "" : "s"} logged`);
    router.push("/workouts/history");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Session date
        </label>
        <input
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
        />

        <p className="mb-2 mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
          Day
        </p>
        {templatesLoading ? (
          <p className="text-sm text-slate-400">Loading templates…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d.dayName}
                type="button"
                onClick={() => selectDay(d.dayName)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                  selectedDay === d.dayName
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {d.dayName}
              </button>
            ))}
          </div>
        )}
      </div>

      {day && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {day.exercises.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              template={exercise}
              row={rows[exercise.exercise_name]}
              onChange={(field, value) => updateRow(exercise.exercise_name, field, value)}
            />
          ))}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save session"}
          </button>
        </form>
      )}
    </div>
  );
}

function ExerciseRow({
  template,
  row,
  onChange,
}: {
  template: WorkoutTemplateRow;
  row: RowState;
  onChange: (field: keyof RowState, value: string) => void;
}) {
  const repsUnit = isTimeBased(template.exercise_name) ? "sec" : "reps";
  const overload = hitTopOfRange(template, row.reps === "" ? null : Number(row.reps));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {template.exercise_name}
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Target: {formatTargetRange(template)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">Sets</label>
          <input
            type="number"
            min={0}
            value={row?.sets ?? ""}
            onChange={(e) => onChange("sets", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">
            {repsUnit === "sec" ? "Seconds" : "Reps"}
          </label>
          <input
            type="number"
            min={0}
            value={row?.reps ?? ""}
            onChange={(e) => onChange("reps", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">Weight (kg)</label>
          <input
            type="number"
            step="any"
            min={0}
            value={row?.weight ?? ""}
            onChange={(e) => onChange("weight", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      </div>

      {overload && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          You hit the top of your range — consider adding 2.5–5% weight next session.
        </p>
      )}
    </div>
  );
}
