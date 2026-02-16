import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function requireAdmin(requestedPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
