import Link from "next/link";
import { parseLocalDate } from "@/lib/date";
import { daysSince, isInjectionDueSoon } from "@/lib/medication";
import type { Database } from "@/types/database.types";

type MedicationLogRow = Database["public"]["Tables"]["medication_logs"]["Row"];

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function MedicationReminderCard({
  lastLog,
}: {
  lastLog: MedicationLogRow | null;
}) {
  const dueSoon = lastLog ? isInjectionDueSoon(lastLog.date) : false;

  return (
    <Link
      href="/medication/log"
      className={`block rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
        dueSoon
          ? "border-amber-300 bg-amber-50 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-950"
          : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
      }`}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Medication
      </p>
      {lastLog ? (
        <>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {daysSince(lastLog.date)}
            <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              day{daysSince(lastLog.date) === 1 ? "" : "s"} ago
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Last dose {lastLog.dose_mg}mg on {formatDate(lastLog.date)}
          </p>
          {dueSoon && (
            <p className="mt-2 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
              Injection due soon
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Log your first injection
        </p>
      )}
    </Link>
  );
}
