import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { MedicationLogForm } from "@/components/medication/MedicationLogForm";

export default async function MedicationLogPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Log injection
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mounjaro dose tracking.
          </p>
        </div>
        <Link
          href="/medication/history"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          History
        </Link>
      </header>

      <MedicationLogForm userId={user.id} />
    </main>
  );
}
