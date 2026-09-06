import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { MealsLogForm } from "@/components/meals/MealsLogForm";

export default async function MealsLogPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Log a meal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track protein from meals and snacks.
        </p>
      </header>

      <MealsLogForm userId={user.id} />
    </main>
  );
}
