import { notFound } from "next/navigation";
import AdminStationShell from "@/app/admin/components/station/AdminStationShell";
import { getAdminSection } from "@/app/admin/components/station/adminSections";
import AdminIdleSection from "@/app/admin/components/station/modules/AdminIdleSection";
import AdminProjectsSection from "@/app/admin/components/station/modules/AdminProjectsSection";
import AdminPhotoSection from "@/app/admin/components/station/modules/AdminPhotoSection";
import AdminVideoSection from "@/app/admin/components/station/modules/AdminVideoSection";
import AdminAudioSection from "@/app/admin/components/station/modules/AdminAudioSection";
import AdminBlogSection from "@/app/admin/components/station/modules/AdminBlogSection";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ section }, query] = await Promise.all([params, searchParams]);
  const sectionConfig = getAdminSection(section);

  if (!sectionConfig) {
    notFound();
  }

  const rawSearch = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    const single = getSingleValue(value);
    if (single) rawSearch.set(key, single);
  });
  const requestedPath = `${sectionConfig.href}${
    rawSearch.size > 0 ? `?${rawSearch.toString()}` : ""
  }`;
  await requireAdmin(requestedPath);

  const createFlag = getSingleValue(query?.create);
  const editParam = getSingleValue(query?.edit);
  const editId =
    editParam && Number.isFinite(Number(editParam)) ? Number(editParam) : null;

  const moduleContent = (() => {
    switch (sectionConfig.key) {
      case "idle":
        return <AdminIdleSection />;
      case "projects":
        return <AdminProjectsSection />;
      case "photo":
        return <AdminPhotoSection />;
      case "video":
        return <AdminVideoSection createMode={createFlag === "1"} editId={editId} />;
      case "audio":
        return <AdminAudioSection />;
      case "blog":
        return <AdminBlogSection />;
      default:
        return <AdminIdleSection />;
    }
  })();

  return (
    <AdminStationShell activeSection={sectionConfig.key}>
      {moduleContent}
    </AdminStationShell>
  );
}
