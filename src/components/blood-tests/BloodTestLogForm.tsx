"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  COMMON_CATEGORIES,
  FLAG_META,
  FLAG_OPTIONS,
  suggestFlag,
} from "@/lib/bloodMarkers";
import {
  BLOOD_MARKER_PRESETS,
  OTHER_MARKER,
  getMarkerPreset,
} from "@/lib/bloodMarkerPresets";
import { todayDateString } from "@/lib/date";
import type {
  BloodMarkerFlag,
  Database,
} from "@/types/database.types";

type BloodMarkerRow = Database["public"]["Tables"]["blood_markers"]["Row"];

export function BloodTestLogForm({ userId }: { userId: string }) {
  const [testDate, setTestDate] = useState(todayDateString());
  const [selectedMarker, setSelectedMarker] = useState("");
  const [customMarkerName, setCustomMarkerName] = useState("");
  const [category, setCategory] = useState("Other");
  const [result, setResult] = useState("");
  const [unit, setUnit] = useState("");
  const [refLow, setRefLow] = useState("");
  const [refHigh, setRefHigh] = useState("");
  const [refRangeText, setRefRangeText] = useState("");
  const [flag, setFlag] = useState<BloodMarkerFlag>("normal");
  const [flagTouched, setFlagTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedEntries, setLoggedEntries] = useState<BloodMarkerRow[]>([]);
  const [knownCustomMarkers, setKnownCustomMarkers] = useState<string[]>([]);

  const markerSelectRef = useRef<HTMLSelectElement>(null);
  const presetNames = new Set(BLOOD_MARKER_PRESETS.map((p) => p.name));

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blood_markers")
      .select("marker_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (!data) return;
        const customOnly = data
          .map((row) => row.marker_name)
          .filter((name) => !presetNames.has(name));
        setKnownCustomMarkers(Array.from(new Set(customOnly)));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (flagTouched) return;
    const parsedResult = Number(result);
    if (result === "" || Number.isNaN(parsedResult)) return;
    const low = refLow === "" ? null : Number(refLow);
    const high = refHigh === "" ? null : Number(refHigh);
    setFlag(suggestFlag(parsedResult, low, high));
  }, [result, refLow, refHigh, flagTouched]);

  function handleMarkerSelect(name: string) {
    setSelectedMarker(name);
    setCustomMarkerName("");

    const preset = getMarkerPreset(name);
    if (preset) {
      setCategory(preset.category);
      setUnit(preset.unit);
      setRefLow(preset.refRangeLow != null ? String(preset.refRangeLow) : "");
      setRefHigh(preset.refRangeHigh != null ? String(preset.refRangeHigh) : "");
    } else {
      // "Other" (or nothing selected yet) - leave for manual entry.
      setCategory("Other");
      setUnit("");
      setRefLow("");
      setRefHigh("");
    }
    setFlagTouched(false);
  }

  function resetMarkerFields() {
    setSelectedMarker("");
    setCustomMarkerName("");
    setCategory("Other");
    setResult("");
    setUnit("");
    setRefLow("");
    setRefHigh("");
    setRefRangeText("");
    setFlag("normal");
    setFlagTouched(false);
    markerSelectRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const markerName =
      selectedMarker === OTHER_MARKER ? customMarkerName.trim() : selectedMarker;
    const parsedResult = Number(result);

    if (!markerName || result === "" || Number.isNaN(parsedResult) || !unit.trim()) {
      setError("Marker, result, and unit are required.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blood_markers")
      .insert({
        user_id: userId,
        test_date: testDate,
        marker_name: markerName,
        category,
        result: parsedResult,
        unit: unit.trim(),
        flag,
        ref_range_low: refLow === "" ? null : Number(refLow),
        ref_range_high: refHigh === "" ? null : Number(refHigh),
        ref_range_text: refRangeText.trim() || null,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setLoggedEntries((prev) => [data, ...prev]);
    if (selectedMarker === OTHER_MARKER) {
      setKnownCustomMarkers((prev) =>
        prev.includes(data.marker_name) ? prev : [...prev, data.marker_name]
      );
    }
    resetMarkerFields();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Test date
          </label>
          <input
            type="date"
            required
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Marker
          </label>
          <select
            ref={markerSelectRef}
            required
            value={selectedMarker}
            onChange={(e) => handleMarkerSelect(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="" disabled>
              Select a marker
            </option>
            {BLOOD_MARKER_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
            <option value={OTHER_MARKER}>Other</option>
          </select>
        </div>

        {selectedMarker === OTHER_MARKER && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Custom marker name
            </label>
            <input
              list="known-custom-markers"
              required
              value={customMarkerName}
              onChange={(e) => setCustomMarkerName(e.target.value)}
              placeholder="e.g. Ferritin"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
            <datalist id="known-custom-markers">
              {knownCustomMarkers.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <input
            list="categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
          <datalist id="categories">
            {COMMON_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Result
            </label>
            <input
              type="number"
              step="any"
              required
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Unit
            </label>
            <input
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="mg/dL"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reference low
            </label>
            <input
              type="number"
              step="any"
              value={refLow}
              onChange={(e) => setRefLow(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reference high
            </label>
            <input
              type="number"
              step="any"
              value={refHigh}
              onChange={(e) => setRefHigh(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-slate-400 dark:text-slate-500">
          Pre-filled with a standard reference range where available — edit to match your
          lab report.
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Reference range (text, optional)
          </label>
          <input
            value={refRangeText}
            onChange={(e) => setRefRangeText(e.target.value)}
            placeholder="e.g. Negative, or <5.0"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Flag
          </label>
          <select
            value={flag}
            onChange={(e) => {
              setFlag(e.target.value as BloodMarkerFlag);
              setFlagTouched(true);
            }}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
          >
            {FLAG_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {FLAG_META[f].label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Auto-calculated from the reference range; change it if needed.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save marker"}
        </button>
      </form>

      {loggedEntries.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Logged for {testDate}
          </h2>
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {loggedEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-slate-700 dark:text-slate-300">
                  {entry.marker_name}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    {entry.result} {entry.unit}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: FLAG_META[entry.flag].color }}
                  >
                    {FLAG_META[entry.flag].label}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
