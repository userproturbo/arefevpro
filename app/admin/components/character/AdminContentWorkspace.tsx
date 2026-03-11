import type { ReactNode } from "react";
import { AdminFrame, AdminPageHeader, AdminSystemBar } from "@/app/admin/components/foundation";
import {
  getAdminCharacterSectionMeta,
  type AdminCharacterSection,
} from "./adminSectionMeta";

type AdminContentWorkspaceProps = {
  activeSection: AdminCharacterSection;
  children: ReactNode;
};

export default function AdminContentWorkspace({
  activeSection,
  children,
}: AdminContentWorkspaceProps) {
  const meta = getAdminCharacterSectionMeta(activeSection);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
      <div className="h-full min-h-0 overflow-y-auto p-4 md:p-5">
        <AdminFrame>
          <div className="space-y-4">
            <AdminSystemBar mode={activeSection.toUpperCase()} />
            <AdminPageHeader
              eyebrow="Content Workspace"
              title={meta.title}
              description={meta.description}
            />
            <div className="rounded-[24px] border border-[color:var(--admin-border)] bg-[color:var(--admin-panel)]/70 p-4 sm:p-5">
              {children}
            </div>
          </div>
        </AdminFrame>
      </div>
    </section>
  );
}
