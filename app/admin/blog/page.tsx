import AdminStationShell from "@/app/admin/components/station/AdminStationShell";
import AdminBlogSection from "@/app/admin/components/station/modules/AdminBlogSection";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdmin("/admin/blog");
  return (
    <AdminStationShell activeSection="blog">
      <AdminBlogSection />
    </AdminStationShell>
  );
}
