import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const next = params?.next;

  if (user?.role === "ADMIN") {
    redirect(next || "/admin");
  }

  redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
}
