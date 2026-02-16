import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

export default async function NewVideoPage() {
  await requireAdmin("/admin/videos/new");
  redirect("/admin/video?create=1");
}
