import type { ReactNode } from "react";
import AdminIdleMetrics from "@/app/admin/components/station/modules/AdminIdleMetrics";
import AdminProjectsSection from "@/app/admin/components/station/modules/AdminProjectsSection";
import AdminPhotoSection from "@/app/admin/components/station/modules/AdminPhotoSection";
import AdminVideoSection from "@/app/admin/components/station/modules/AdminVideoSection";
import AdminAudioSection from "@/app/admin/components/station/modules/AdminAudioSection";
import AdminBlogSection from "@/app/admin/components/station/modules/AdminBlogSection";
import type { AdminCharacterSection } from "./adminSectionMeta";

export function renderAdminSection(
  section: AdminCharacterSection,
  options: {
    createMode: boolean;
    editId: number | null;
    editSlug: string | null;
    dashboard: ReactNode;
  },
) {
  if (section === "dashboard") return options.dashboard;
  if (section === "projects") return <AdminProjectsSection createMode={options.createMode} editId={options.editId} />;
  if (section === "photo") return <AdminPhotoSection createMode={options.createMode} editSlug={options.editSlug} />;
  if (section === "video") return <AdminVideoSection createMode={options.createMode} editId={options.editId} />;
  if (section === "audio") return <AdminAudioSection createMode={options.createMode} editId={options.editId} />;
  return <AdminBlogSection createMode={options.createMode} editId={options.editId} />;
}

export function renderAdminDashboard() {
  return <AdminIdleMetrics />;
}
