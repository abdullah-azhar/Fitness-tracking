/** Today's date as a YYYY-MM-DD string in the viewer's local timezone, matching a Postgres `date` column. */
export function todayDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

/**
 * Parses a plain `YYYY-MM-DD` (Postgres `date` column) as a local calendar
 * date. `new Date("YYYY-MM-DD")` parses as UTC midnight, which shifts a day
 * back for any viewer behind UTC - this avoids that.
 */
export function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}
