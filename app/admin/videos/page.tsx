import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

export default async function AdminVideosLegacyPage() {
  await requireAdmin("/admin/videos");
  redirect("/admin/video");
}
