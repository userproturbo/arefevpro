import { requireAdmin } from "@/app/admin/lib/requireAdmin";
import { ADMIN_STATION_SECTIONS } from "@/app/admin/components/station/adminSections";
import AdminShell from "@/app/admin/components/foundation/AdminShell";
import AdminPhotoSection from "@/app/admin/components/station/modules/AdminPhotoSection";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPhotoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  await requireAdmin(
    `/admin/photo${
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
  const editRaw = getSingleValue(query?.edit);
  const editSlug = editRaw ? decodeSafe(editRaw) : null;

  return (
    <AdminShell navItems={ADMIN_STATION_SECTIONS}>
      <AdminPhotoSection createMode={createMode} editSlug={editSlug} />
    </AdminShell>
  );
}
