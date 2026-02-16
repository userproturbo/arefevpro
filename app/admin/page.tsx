import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

export default async function AdminPage() {
  await requireAdmin("/admin");
  redirect("/admin/idle");
}
