import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

export default async function NewAlbumPage() {
  await requireAdmin("/admin/photos/new");
  redirect("/admin/photo?create=1");
}
