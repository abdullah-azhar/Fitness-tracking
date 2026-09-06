import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

/**
 * Route-group guard: every page under (protected) requires a signed-in
 * user. Middleware already redirects unauthenticated requests, but this is
 * the real authorization boundary - it runs regardless of matcher config.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
