import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { BodyMetricsTrendsView } from "@/components/body-metrics/BodyMetricsTrendsView";

export default async function BodyMetricsTrendsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Body metrics trends
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weight, muscle, fat, and visceral fat over time.
          </p>
        </div>
        <Link
          href="/body-metrics/log"
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Log entry
        </Link>
      </header>

      <BodyMetricsTrendsView userId={user.id} />
    </main>
  );
}
