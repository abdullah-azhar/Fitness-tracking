import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutRow } from "@/lib/workouts";

interface WorkoutState {
  entries: WorkoutRow[];
  fetchedUserId: string | null;
  loading: boolean;
  error: string | null;
  fetchEntries: (userId: string, opts?: { force?: boolean }) => Promise<void>;
  addEntry: (row: WorkoutRow) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  entries: [],
  fetchedUserId: null,
  loading: false,
  error: null,

  fetchEntries: async (userId, opts) => {
    const state = get();
    if (!opts?.force && state.fetchedUserId === userId && state.entries.length > 0) {
      return;
    }

    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    set({ entries: data ?? [], fetchedUserId: userId, loading: false });
  },

  addEntry: (row) => set((state) => ({ entries: [row, ...state.entries] })),
}));

/** Most recent weight logged for this exercise (any day), or null if never logged. */
export function selectLastUsedWeight(
  entries: WorkoutRow[],
  exerciseName: string
): number | null {
  const match = entries
    .filter((e) => e.exercise === exerciseName && e.weight != null)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return match?.weight ?? null;
}

/**
 * Weight used on the last `limit` sessions for this exercise, oldest first
 * (for a sparkline). Pass `asOfDate` when rendering a past session so its
 * sparkline reflects the trend up to that point, not later sessions too.
 */
export function selectRecentWeights(
  entries: WorkoutRow[],
  exerciseName: string,
  limit = 5,
  asOfDate?: string
): { date: string; weight: number }[] {
  return entries
    .filter(
      (e) =>
        e.exercise === exerciseName &&
        e.weight != null &&
        (!asOfDate || e.date <= asOfDate)
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .reverse()
    .map((e) => ({ date: e.date, weight: e.weight as number }));
}

export interface WorkoutSession {
  date: string;
  entries: WorkoutRow[];
}

/** Groups all entries into sessions by date, most recent first. */
export function selectSessionsByDate(entries: WorkoutRow[]): WorkoutSession[] {
  const grouped = new Map<string, WorkoutRow[]>();
  for (const row of entries) {
    const list = grouped.get(row.date) ?? [];
    list.push(row);
    grouped.set(row.date, list);
  }
  return Array.from(grouped.entries())
    .map(([date, entries]) => ({ date, entries }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
