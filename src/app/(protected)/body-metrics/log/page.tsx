import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { BodyMetricsLogForm } from "@/components/body-metrics/BodyMetricsLogForm";

export default async function BodyMetricsLogPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Log body metrics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            From your scale or InBody scan.
          </p>
        </div>
        <Link
          href="/body-metrics/trends"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          View trends
        </Link>
      </header>

      <BodyMetricsLogForm userId={user.id} />
    </main>
  );
}
