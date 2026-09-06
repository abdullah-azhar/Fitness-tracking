import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { BodyMetricRow } from "@/lib/bodyMetrics";

function sortByTestDate(rows: BodyMetricRow[]) {
  return [...rows].sort((a, b) => a.test_date.localeCompare(b.test_date));
}

interface BodyMetricsState {
  entries: BodyMetricRow[];
  fetchedUserId: string | null;
  loading: boolean;
  error: string | null;
  /** Fetches once per user; pass `force` to bypass the cache (e.g. pull-to-refresh). */
  fetchEntries: (userId: string, opts?: { force?: boolean }) => Promise<void>;
  /** Merges a freshly-inserted row into the cache without a refetch. */
  addEntry: (entry: BodyMetricRow) => void;
}

export const useBodyMetricsStore = create<BodyMetricsState>((set, get) => ({
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
      .from("body_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("test_date", { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    set({ entries: data ?? [], fetchedUserId: userId, loading: false });
  },

  addEntry: (entry) => {
    set((state) => ({ entries: sortByTestDate([...state.entries, entry]) }));
  },
}));
