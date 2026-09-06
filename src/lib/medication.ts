import type { InjectionSite } from "@/types/database.types";
import { parseLocalDate, todayDateString } from "@/lib/date";

export const DEFAULT_DOSE_MG = 2.5;

export const INJECTION_SITES: InjectionSite[] = ["abdomen", "thigh", "upper arm"];

/** Weekly dosing is the default course; adjust this if the prescribed schedule changes. */
export const INJECTION_REMINDER_DAYS = 6;

export function daysSince(dateString: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const today = parseLocalDate(todayDateString());
  const then = parseLocalDate(dateString);
  return Math.round((today.getTime() - then.getTime()) / msPerDay);
}

export function isInjectionDueSoon(lastInjectionDate: string | null): boolean {
  if (!lastInjectionDate) return false;
  return daysSince(lastInjectionDate) >= INJECTION_REMINDER_DAYS;
}
