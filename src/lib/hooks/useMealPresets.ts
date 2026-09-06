"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type MealPreset = Database["public"]["Tables"]["meal_presets"]["Row"];

const DEFAULT_PRESETS = [
  { name: "2 eggs", protein_g: 12 },
  { name: "Chicken breast 100g", protein_g: 31 },
];

export function useMealPresets(userId: string) {
  const [presets, setPresets] = useState<MealPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("meal_presets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (data && data.length === 0) {
      // First visit: seed a couple of starter presets the user can edit or delete.
      const { data: seeded } = await supabase
        .from("meal_presets")
        .insert(DEFAULT_PRESETS.map((p) => ({ user_id: userId, ...p })))
        .select();
      setPresets(seeded ?? []);
    } else {
      setPresets(data ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPreset = useCallback(
    async (name: string, proteinG: number) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("meal_presets")
        .insert({ user_id: userId, name, protein_g: proteinG })
        .select()
        .single();
      if (!error && data) setPresets((prev) => [...prev, data]);
      return { data, error };
    },
    [userId]
  );

  const removePreset = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("meal_presets").delete().eq("id", id);
    if (!error) setPresets((prev) => prev.filter((p) => p.id !== id));
    return { error };
  }, []);

  return { presets, loading, addPreset, removePreset };
}
