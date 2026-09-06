"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutTemplateRow } from "@/lib/workouts";

export interface WorkoutDay {
  dayName: string;
  exercises: WorkoutTemplateRow[];
}

export function useWorkoutTemplates() {
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("workout_templates")
      .select("*")
      .order("day_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const grouped = new Map<string, WorkoutTemplateRow[]>();
        for (const row of data ?? []) {
          const list = grouped.get(row.day_name) ?? [];
          list.push(row);
          grouped.set(row.day_name, list);
        }
        setDays(
          Array.from(grouped.entries()).map(([dayName, exercises]) => ({
            dayName,
            exercises,
          }))
        );
        setLoading(false);
      });
  }, []);

  return { days, loading };
}
