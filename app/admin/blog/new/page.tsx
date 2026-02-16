import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

export default async function AdminBlogNewPage() {
  await requireAdmin("/admin/blog/new");
  redirect("/admin/blog?create=1");
}
