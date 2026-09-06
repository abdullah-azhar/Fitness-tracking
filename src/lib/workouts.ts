import type { Database } from "@/types/database.types";

export type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];
export type WorkoutTemplateRow =
  Database["public"]["Tables"]["workout_templates"]["Row"];

/** Plank/side-plank targets are logged in seconds, not reps - same numeric columns. */
export function isTimeBased(exerciseName: string) {
  return /plank/i.test(exerciseName);
}

export function formatTargetRange(template: WorkoutTemplateRow) {
  const { target_sets, target_rep_range_low, target_rep_range_high } = template;
  const range =
    target_rep_range_low === target_rep_range_high
      ? `${target_rep_range_high}`
      : `${target_rep_range_low}–${target_rep_range_high}`;
  const unit = isTimeBased(template.exercise_name) ? "s" : "";
  return `${target_sets} × ${range}${unit}`;
}

/** True once the logged reps reach the top of the target range (progressive overload signal). */
export function hitTopOfRange(template: WorkoutTemplateRow, reps: number | null) {
  return reps != null && reps >= template.target_rep_range_high;
}
