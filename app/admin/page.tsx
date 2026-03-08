import { requireAdmin } from "@/app/admin/lib/requireAdmin";
import { ADMIN_STATION_SECTIONS } from "@/app/admin/components/station/adminSections";
import {
  AdminCard,
  AdminEmptyState,
  AdminPageHeader,
  AdminSectionCard,
  AdminShell,
  AdminToolbar,
} from "@/app/admin/components/foundation";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DashboardMetrics = {
  posts: number;
  albums: number;
  photos: number;
  videos: number;
};

async function loadDashboardMetrics(): Promise<DashboardMetrics | null> {
  try {
    const [posts, albums, photos, videos] = await Promise.all([
      prisma.post.count(),
      prisma.album.count({ where: { deletedAt: null } }),
      prisma.photo.count({ where: { deletedAt: null } }),
      prisma.video.count(),
    ]);

    return { posts, albums, photos, videos };
  } catch (error) {
    logServerError("Admin dashboard metrics error:", error);
    return null;
  }
}

export default async function AdminPage() {
  await requireAdmin("/admin");
  const metrics = await loadDashboardMetrics();
  const navItems = ADMIN_STATION_SECTIONS;
  const manageableSections = ADMIN_STATION_SECTIONS.filter((section) => section.key !== "idle");

  const sectionMetrics: Record<string, string | number | undefined> = {
    projects: metrics?.posts,
    photo: metrics?.albums,
    video: metrics?.videos,
    audio: metrics?.posts,
    blog: metrics?.posts,
  };

  return (
    <AdminShell navItems={navItems}>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Control Room"
          title="Admin Dashboard"
          description="Manage public content and media flows without changing APIs or section workflows."
        />

        <AdminToolbar>
          <div className="text-xs uppercase tracking-[0.16em] text-white/55">System snapshot</div>
          <div className="flex items-center gap-4 text-xs text-white/65">
            <span>Posts: {metrics?.posts ?? "-"}</span>
            <span>Albums: {metrics?.albums ?? "-"}</span>
            <span>Photos: {metrics?.photos ?? "-"}</span>
            <span>Videos: {metrics?.videos ?? "-"}</span>
          </div>
        </AdminToolbar>

        {manageableSections.length === 0 ? (
          <AdminEmptyState
            title="No sections configured"
            description="Add admin sections to begin managing content."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {manageableSections.map((section) => (
              <AdminSectionCard
                key={section.key}
                title={section.label}
                description={section.description}
                href={section.href}
                metricLabel="Records"
                metricValue={sectionMetrics[section.key]}
              />
            ))}
          </div>
        )}

        <AdminCard>
          <h2 className="text-lg font-medium text-white">Migration-ready foundation</h2>
          <p className="mt-2 text-sm leading-6 text-white/58">
            This dashboard uses the new reusable admin UI primitives. Existing section modules and CRUD logic stay
            untouched and can be migrated incrementally.
          </p>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
