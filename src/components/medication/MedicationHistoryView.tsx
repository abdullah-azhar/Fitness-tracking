"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseLocalDate } from "@/lib/date";
import { daysSince } from "@/lib/medication";
import type { Database } from "@/types/database.types";

type MedicationLogRow = Database["public"]["Tables"]["medication_logs"]["Row"];

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function siteLabel(site: string | null) {
  if (!site) return null;
  return site.charAt(0).toUpperCase() + site.slice(1);
}

export function MedicationHistoryView({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<MedicationLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("medication_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEntries(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Couldn&apos;t load medication history: {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No injections logged yet.
      </div>
    );
  }

  const [current, ...past] = entries;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 shadow-sm dark:bg-emerald-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Current dose
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {current.dose_mg}mg
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {formatDate(current.date)}
          {siteLabel(current.injection_site) && ` · ${siteLabel(current.injection_site)}`}
          {` · ${daysSince(current.date)} day${daysSince(current.date) === 1 ? "" : "s"} ago`}
        </p>
        {current.notes && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{current.notes}</p>
        )}
      </div>

      {past.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {past.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(entry.date)}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">{entry.notes}</p>
                  )}
                </div>
                <div className="text-right text-slate-500 dark:text-slate-400">
                  <p>{entry.dose_mg}mg</p>
                  {siteLabel(entry.injection_site) && (
                    <p className="text-xs">{siteLabel(entry.injection_site)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
