import Link from "next/link";
import { ADMIN_STATION_SECTIONS } from "../adminSections";
import AdminIdleMetrics from "./AdminIdleMetrics";

export default function AdminIdleSection() {
  const managedSections = ADMIN_STATION_SECTIONS.filter((item) => item.key !== "idle");

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#8bc99b]">
        Use station tabs to manage content by section without leaving `/admin`.
      </p>

      <AdminIdleMetrics />

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {managedSections.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="rounded-md border border-[#275636] bg-[#09120d] p-3 transition hover:border-[#3a7352]"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b4fdc3]">
              {item.label}
            </div>
            <p className="mt-1 text-xs text-[#8ec99c]">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
