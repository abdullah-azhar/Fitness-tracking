import type { BloodMarkerFlag, Database } from "@/types/database.types";

export type BloodMarkerRow = Database["public"]["Tables"]["blood_markers"]["Row"];

// Status palette (fixed, reserved meaning - never reused for series identity).
export const FLAG_META: Record<
  BloodMarkerFlag,
  { label: string; color: string }
> = {
  normal: { label: "Normal", color: "#0ca30c" },
  low: { label: "Low", color: "#fab219" },
  high: { label: "High", color: "#fab219" },
  critical_low: { label: "Critical low", color: "#d03b3b" },
  critical_high: { label: "Critical high", color: "#d03b3b" },
};

export const FLAG_OPTIONS: BloodMarkerFlag[] = [
  "critical_low",
  "low",
  "normal",
  "high",
  "critical_high",
];

/** Best-effort default flag from a numeric result and reference range. Users can still override it. */
export function suggestFlag(
  result: number,
  refLow: number | null,
  refHigh: number | null
): BloodMarkerFlag {
  if (refLow != null && result < refLow) return "low";
  if (refHigh != null && result > refHigh) return "high";
  return "normal";
}

/** Keeps only the most recent row per marker_name. */
export function getLatestPerMarker(rows: BloodMarkerRow[]): BloodMarkerRow[] {
  const latest = new Map<string, BloodMarkerRow>();
  for (const row of rows) {
    const existing = latest.get(row.marker_name);
    if (!existing || row.test_date > existing.test_date) {
      latest.set(row.marker_name, row);
    }
  }
  return Array.from(latest.values());
}

/** How far out of range a result is, as a fraction of the range bound (0 = in range). */
function severity(row: BloodMarkerRow): number {
  if (row.flag === "normal") return 0;
  if (row.ref_range_low != null && row.result < row.ref_range_low) {
    return row.ref_range_low === 0 ? 1 : (row.ref_range_low - row.result) / row.ref_range_low;
  }
  if (row.ref_range_high != null && row.result > row.ref_range_high) {
    return row.ref_range_high === 0 ? 1 : (row.result - row.ref_range_high) / row.ref_range_high;
  }
  // Flagged abnormal but no numeric range to measure against (e.g. a qualitative result).
  return 0.5;
}

/** The `limit` most out-of-range markers (by latest result), most severe first. Normal markers are excluded. */
export function rankMostOutOfRange(rows: BloodMarkerRow[], limit = 3): BloodMarkerRow[] {
  return getLatestPerMarker(rows)
    .filter((row) => row.flag !== "normal")
    .sort((a, b) => severity(b) - severity(a))
    .slice(0, limit);
}

export const COMMON_CATEGORIES = [
  "Lipid Panel",
  "Metabolic Panel",
  "Complete Blood Count",
  "Thyroid",
  "Hormone",
  "Vitamin",
  "Liver Panel",
  "Kidney Panel",
  "Inflammation",
  "Other",
];
