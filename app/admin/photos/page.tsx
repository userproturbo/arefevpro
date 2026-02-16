import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

export default async function AdminPhotosLegacyPage() {
  await requireAdmin("/admin/photos");
  redirect("/admin/photo");
}
