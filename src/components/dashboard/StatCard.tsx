import Link from "next/link";

function StatCardContent({
  label,
  value,
  unit,
  helpText,
  progress,
}: {
  label: string;
  value: string;
  unit?: string;
  helpText?: string;
  progress?: number;
}) {
  return (
    <>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </p>
      {typeof progress === "number" && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {helpText && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {helpText}
        </p>
      )}
    </>
  );
}

export function StatCard({
  href,
  ...props
}: {
  label: string;
  value: string;
  unit?: string;
  helpText?: string;
  /** 0-100, renders a progress bar when provided */
  progress?: number;
  /** Wraps the card in a link, e.g. to a trends page. */
  href?: string;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
      >
        <StatCardContent {...props} />
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <StatCardContent {...props} />
    </div>
  );
}
