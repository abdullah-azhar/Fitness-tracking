import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/lib/date";
import type { Database } from "@/types/database.types";

type MealRow = Database["public"]["Tables"]["meals"]["Row"];
type WaterLogRow = Database["public"]["Tables"]["water_logs"]["Row"];
type BodyMetricRow = Database["public"]["Tables"]["body_metrics"]["Row"];
type MedicationLogRow = Database["public"]["Tables"]["medication_logs"]["Row"];

interface TodayLogState {
  loadedDate: string | null;
  fetchedUserId: string | null;
  meals: MealRow[];
  waterLogs: WaterLogRow[];
  loading: boolean;
  error: string | null;
  /** Fetches today's meals + water logs once per user/day; pass `force` to bypass the cache. */
  fetchToday: (userId: string, opts?: { force?: boolean }) => Promise<void>;
  addMeal: (row: MealRow) => void;
  addWaterLog: (row: WaterLogRow) => void;
  removeWaterLog: (id: string) => void;

  lastBodyMetric: BodyMetricRow | null;
  lastBodyMetricFetchedUserId: string | null;
  fetchLastBodyMetric: (userId: string) => Promise<void>;

  lastMedicationLog: MedicationLogRow | null;
  lastMedicationLogFetchedUserId: string | null;
  fetchLastMedicationLog: (userId: string) => Promise<void>;
}

export const useTodayLogStore = create<TodayLogState>((set, get) => ({
  loadedDate: null,
  fetchedUserId: null,
  meals: [],
  waterLogs: [],
  loading: false,
  error: null,

  fetchToday: async (userId, opts) => {
    const state = get();
    const today = todayDateString();
    if (
      !opts?.force &&
      state.fetchedUserId === userId &&
      state.loadedDate === today
    ) {
      return;
    }

    set({ loading: true, error: null });
    const supabase = createClient();

    const [mealsRes, waterRes] = await Promise.all([
      supabase.from("meals").select("*").eq("user_id", userId).eq("date", today),
      supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .order("created_at", { ascending: true }),
    ]);

    if (mealsRes.error) {
      set({ error: mealsRes.error.message, loading: false });
      return;
    }
    if (waterRes.error) {
      set({ error: waterRes.error.message, loading: false });
      return;
    }

    set({
      meals: mealsRes.data ?? [],
      waterLogs: waterRes.data ?? [],
      fetchedUserId: userId,
      loadedDate: today,
      loading: false,
    });
  },

  addMeal: (row) => set((state) => ({ meals: [...state.meals, row] })),

  addWaterLog: (row) =>
    set((state) => ({ waterLogs: [...state.waterLogs, row] })),

  removeWaterLog: (id) =>
    set((state) => ({
      waterLogs: state.waterLogs.filter((log) => log.id !== id),
    })),

  lastBodyMetric: null,
  lastBodyMetricFetchedUserId: null,

  fetchLastBodyMetric: async (userId) => {
    if (get().lastBodyMetricFetchedUserId === userId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("body_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("test_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      set({ lastBodyMetric: data, lastBodyMetricFetchedUserId: userId });
    }
  },

  lastMedicationLog: null,
  lastMedicationLogFetchedUserId: null,

  fetchLastMedicationLog: async (userId) => {
    if (get().lastMedicationLogFetchedUserId === userId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("medication_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      set({ lastMedicationLog: data, lastMedicationLogFetchedUserId: userId });
    }
  },
}));

export function selectProteinTotal(state: TodayLogState) {
  return state.meals.reduce((sum, meal) => sum + (meal.protein_g ?? 0), 0);
}

export function selectWaterTotal(state: TodayLogState) {
  return state.waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
}
