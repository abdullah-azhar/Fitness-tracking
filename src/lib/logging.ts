import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/lib/date";

export function logWater(userId: string, amountMl: number) {
  const supabase = createClient();
  return supabase
    .from("water_logs")
    .insert({ user_id: userId, date: todayDateString(), amount_ml: amountMl })
    .select()
    .single();
}

export function logMeal(
  userId: string,
  meal: { meal_name: string; protein_g: number | null; notes?: string | null }
) {
  const supabase = createClient();
  return supabase
    .from("meals")
    .insert({
      user_id: userId,
      date: todayDateString(),
      meal_name: meal.meal_name,
      protein_g: meal.protein_g,
      notes: meal.notes ?? null,
    })
    .select()
    .single();
}
