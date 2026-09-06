import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  // Already verified by the (protected) layout - re-fetched here (cached,
  // no extra network call) just to read the user's id/email.
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user.email}
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/body-metrics/log"
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          + Log body metrics
        </Link>
        <Link
          href="/blood-tests/history"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Blood tests
        </Link>
        <Link
          href="/medication/log"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Log injection
        </Link>
      </div>

      <DashboardView userId={user.id} />
    </main>
  );
}
