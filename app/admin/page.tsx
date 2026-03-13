import { requireAdmin } from "@/app/admin/lib/requireAdmin";
import AdminCharacterSidebar from "@/app/admin/components/character/AdminCharacterSidebar";
import AdminContentWorkspace from "@/app/admin/components/character/AdminContentWorkspace";
import {
  renderAdminDashboard,
  renderAdminSection,
} from "@/app/admin/components/character/adminSectionRegistry";
import { getAdminCharacterSection } from "@/app/admin/components/character/adminSectionMeta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;

  const rawSearch = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    const single = getSingleValue(value);
    if (single) rawSearch.set(key, single);
  });

  const requestedPath = `/admin${rawSearch.size > 0 ? `?${rawSearch.toString()}` : ""}`;
  await requireAdmin(requestedPath);

  const activeSection = getAdminCharacterSection(getSingleValue(query?.section));
  const createMode = getSingleValue(query?.create) === "1";
  const editParam = getSingleValue(query?.edit);
  const editId = editParam && Number.isFinite(Number(editParam)) ? Number(editParam) : null;
  const editSlug = editParam ? decodeSafe(editParam) : null;
  const sectionContent = renderAdminSection(activeSection, {
    createMode,
    editId,
    editSlug,
    dashboard: renderAdminDashboard(),
  });

  return (
    <main className="grid w-full grid-cols-1 bg-[color:var(--admin-bg)] md:grid-cols-[320px_minmax(0,1fr)]">
      <div className="border-b border-[color:var(--admin-border)] md:sticky md:top-0 md:h-screen md:self-start md:border-b-0 md:border-r">
        <AdminCharacterSidebar activeSection={activeSection} />
      </div>
      <div className="min-w-0 p-4 md:p-10">
        <AdminContentWorkspace activeSection={activeSection}>{sectionContent}</AdminContentWorkspace>
      </div>
    </main>
  );
}
