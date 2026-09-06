"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FLAG_META, rankMostOutOfRange, type BloodMarkerRow } from "@/lib/bloodMarkers";

export function HealthMarkersCard({ userId }: { userId: string }) {
  const [rows, setRows] = useState<BloodMarkerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blood_markers")
      .select("*")
      .eq("user_id", userId)
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return null;

  const outOfRange = rankMostOutOfRange(rows, 3);

  return (
    <Link
      href="/blood-tests/history"
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
    >
      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Health markers
      </h2>

      {outOfRange.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {rows.length === 0 ? "No blood tests logged yet." : "All markers in range."}
        </p>
      ) : (
        <ul className="space-y-2">
          {outOfRange.map((marker) => (
            <li key={marker.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">{marker.marker_name}</span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: FLAG_META[marker.flag].color }}
              >
                {marker.result} {marker.unit} · {FLAG_META[marker.flag].label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
