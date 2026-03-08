import { requireAdmin } from "@/app/admin/lib/requireAdmin";
import { ADMIN_STATION_SECTIONS } from "@/app/admin/components/station/adminSections";
import AdminShell from "@/app/admin/components/foundation/AdminShell";
import AdminBlogSection from "@/app/admin/components/station/modules/AdminBlogSection";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  await requireAdmin(
    `/admin/blog${
      query && Object.keys(query).length > 0
        ? `?${new URLSearchParams(
            Object.entries(query)
              .map(([key, value]) => [key, getSingleValue(value) ?? ""])
              .filter(([, value]) => value.length > 0)
          ).toString()}`
        : ""
    }`
  );

  const createMode = getSingleValue(query?.create) === "1";
  const editParam = getSingleValue(query?.edit);
  const editId = editParam && Number.isFinite(Number(editParam)) ? Number(editParam) : null;

  return (
    <AdminShell navItems={ADMIN_STATION_SECTIONS}>
      <AdminBlogSection createMode={createMode} editId={editId} />
    </AdminShell>
  );
}
