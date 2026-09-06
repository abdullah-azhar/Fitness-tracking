import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { WorkoutLogForm } from "@/components/workouts/WorkoutLogForm";

export default async function WorkoutLogPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Log a workout
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pick a day, then log what you actually did.
          </p>
        </div>
        <Link
          href="/workouts/history"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          History
        </Link>
      </header>

      <WorkoutLogForm userId={user.id} />
    </main>
  );
}
