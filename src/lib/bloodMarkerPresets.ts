export interface MarkerPreset {
  name: string;
  unit: string;
  category: string;
  /** Typical/standard clinical reference range - a starting point; edit per your lab's printed range. */
  refRangeLow: number | null;
  refRangeHigh: number | null;
}

export const BLOOD_MARKER_PRESETS: MarkerPreset[] = [
  { name: "HbA1c", unit: "%", category: "Metabolic Panel", refRangeLow: 4.0, refRangeHigh: 5.6 },
  { name: "Fasting Glucose", unit: "mg/dL", category: "Metabolic Panel", refRangeLow: 70, refRangeHigh: 99 },
  { name: "Total Cholesterol", unit: "mg/dL", category: "Lipid Panel", refRangeLow: 125, refRangeHigh: 200 },
  { name: "LDL Cholesterol", unit: "mg/dL", category: "Lipid Panel", refRangeLow: 0, refRangeHigh: 99 },
  { name: "HDL Cholesterol", unit: "mg/dL", category: "Lipid Panel", refRangeLow: 40, refRangeHigh: 100 },
  { name: "Triglycerides", unit: "mg/dL", category: "Lipid Panel", refRangeLow: 0, refRangeHigh: 149 },
  { name: "Non-HDL Cholesterol", unit: "mg/dL", category: "Lipid Panel", refRangeLow: 0, refRangeHigh: 129 },
  { name: "Creatinine", unit: "mg/dL", category: "Kidney Panel", refRangeLow: 0.6, refRangeHigh: 1.3 },
  { name: "eGFR", unit: "mL/min/1.73m²", category: "Kidney Panel", refRangeLow: 90, refRangeHigh: 200 },
  { name: "GGT", unit: "U/L", category: "Liver Panel", refRangeLow: 9, refRangeHigh: 48 },
  { name: "Vitamin D", unit: "ng/mL", category: "Vitamin", refRangeLow: 30, refRangeHigh: 100 },
  { name: "hs-CRP", unit: "mg/L", category: "Inflammation", refRangeLow: 0, refRangeHigh: 3.0 },
];

export const OTHER_MARKER = "Other";

export function getMarkerPreset(name: string): MarkerPreset | undefined {
  return BLOOD_MARKER_PRESETS.find((p) => p.name === name);
}
