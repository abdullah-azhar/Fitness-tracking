"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BloodMarkerTrendChart,
  type TrendPoint,
} from "@/components/charts/BloodMarkerTrendChart";
import type { Database } from "@/types/database.types";

type BloodMarkerRow = Database["public"]["Tables"]["blood_markers"]["Row"];

export function TrendsView({ userId }: { userId: string }) {
  const [rows, setRows] = useState<BloodMarkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blood_markers")
      .select("*")
      .eq("user_id", userId)
      .order("test_date", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setRows(data ?? []);
        }
        setLoading(false);
      });
  }, [userId]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.category)))],
    [rows]
  );

  const markerGroups = useMemo(() => {
    const filtered =
      categoryFilter === "All"
        ? rows
        : rows.filter((r) => r.category === categoryFilter);

    const groups = new Map<
      string,
      { category: string; unit: string; points: TrendPoint[] }
    >();

    for (const row of filtered) {
      const existing = groups.get(row.marker_name);
      const point: TrendPoint = {
        test_date: row.test_date,
        result: row.result,
        ref_range_low: row.ref_range_low,
        ref_range_high: row.ref_range_high,
        ref_range_text: row.ref_range_text,
        flag: row.flag,
      };
      if (existing) {
        existing.points.push(point);
      } else {
        groups.set(row.marker_name, {
          category: row.category,
          unit: row.unit,
          points: [point],
        });
      }
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows, categoryFilter]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Couldn&apos;t load trends: {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No blood test results logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label
          htmlFor="category-filter"
          className="text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          Category
        </label>
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {markerGroups.map(([markerName, group]) => (
          <BloodMarkerTrendChart
            key={markerName}
            markerName={markerName}
            category={group.category}
            unit={group.unit}
            points={group.points}
          />
        ))}
      </div>
    </div>
  );
}
