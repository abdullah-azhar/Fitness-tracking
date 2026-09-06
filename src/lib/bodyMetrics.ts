import type { Database } from "@/types/database.types";

export type BodyMetricRow = Database["public"]["Tables"]["body_metrics"]["Row"];

export function calcBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type MetricKey =
  | "weight"
  | "skeletal_muscle"
  | "body_fat_pct"
  | "visceral_fat";

/** Whether an increase in this metric is good, bad, or neither - drives delta coloring. */
type GoodDirection = "up" | "down" | "neutral";

export const METRICS: {
  key: MetricKey;
  label: string;
  unit: string;
  color: string; // categorical slot, one per chart (each is a single series)
  goodDirection: GoodDirection;
}[] = [
  { key: "weight", label: "Weight", unit: "kg", color: "#2a78d6", goodDirection: "neutral" },
  {
    key: "skeletal_muscle",
    label: "Skeletal Muscle Mass",
    unit: "kg",
    color: "#1baf7a",
    goodDirection: "up",
  },
  {
    key: "body_fat_pct",
    label: "Body Fat %",
    unit: "%",
    color: "#eb6834",
    goodDirection: "down",
  },
  {
    key: "visceral_fat",
    label: "Visceral Fat Level",
    unit: "",
    color: "#eda100",
    goodDirection: "down",
  },
];

// Status palette (fixed, reserved meaning) - green/red for good/bad delta, gray for neutral.
export const GOOD_COLOR = "#0ca30c";
export const BAD_COLOR = "#d03b3b";
export const NEUTRAL_COLOR = "#898781";

export function deltaTone(
  goodDirection: GoodDirection,
  delta: number
): "good" | "bad" | "neutral" {
  if (delta === 0 || goodDirection === "neutral") return "neutral";
  const increased = delta > 0;
  if (goodDirection === "up") return increased ? "good" : "bad";
  return increased ? "bad" : "good";
}

export function toneColor(tone: "good" | "bad" | "neutral") {
  if (tone === "good") return GOOD_COLOR;
  if (tone === "bad") return BAD_COLOR;
  return NEUTRAL_COLOR;
}
