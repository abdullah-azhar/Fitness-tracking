"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/lib/date";
import { DEFAULT_DOSE_MG, INJECTION_SITES } from "@/lib/medication";
import { useTodayLogStore } from "@/store/useTodayLogStore";
import { useToastStore } from "@/store/useToastStore";
import type { InjectionSite } from "@/types/database.types";

export function MedicationLogForm({ userId }: { userId: string }) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [date, setDate] = useState(todayDateString());
  const [doseMg, setDoseMg] = useState(String(DEFAULT_DOSE_MG));
  const [injectionSite, setInjectionSite] = useState<InjectionSite | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedDose = Number(doseMg);
    if (doseMg === "" || Number.isNaN(parsedDose)) {
      setError("Dose is required.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("medication_logs")
      .insert({
        user_id: userId,
        date,
        dose_mg: parsedDose,
        injection_site: injectionSite || null,
        notes: notes.trim() || null,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    useTodayLogStore.setState({
      lastMedicationLog: data,
      lastMedicationLogFetchedUserId: userId,
    });
    showToast("Injection logged");
    router.push("/medication/history");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Date
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Dose (mg)
        </label>
        <input
          type="number"
          step="any"
          min={0}
          required
          value={doseMg}
          onChange={(e) => setDoseMg(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Defaults to {DEFAULT_DOSE_MG}mg — edit if your dose has increased.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Injection site (optional)
        </label>
        <select
          value={injectionSite}
          onChange={(e) => setInjectionSite(e.target.value as InjectionSite | "")}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">Not specified</option>
          {INJECTION_SITES.map((site) => (
            <option key={site} value={site}>
              {site.charAt(0).toUpperCase() + site.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes (optional)
        </label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. mild nausea"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save injection"}
      </button>
    </form>
  );
}
