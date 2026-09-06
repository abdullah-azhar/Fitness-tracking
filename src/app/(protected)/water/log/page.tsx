import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { WaterLogView } from "@/components/water/WaterLogView";

export default async function WaterLogPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Log water
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tap an amount to log it instantly.
        </p>
      </header>

      <WaterLogView userId={user.id} />
    </main>
  );
}
