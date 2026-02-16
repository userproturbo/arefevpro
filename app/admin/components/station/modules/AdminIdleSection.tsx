import Link from "next/link";
import { ADMIN_STATION_SECTIONS } from "../adminSections";

export default function AdminIdleSection() {
  const managedSections = ADMIN_STATION_SECTIONS.filter((item) => item.key !== "idle");

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#d19b80]">
        Use station tabs to manage content by section without leaving `/admin`.
      </p>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {managedSections.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="rounded-md border border-[#5a3524] bg-[#170d08] p-3 transition hover:border-[#b56c48]"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#ffd6bf]">
              {item.label}
            </div>
            <p className="mt-1 text-xs text-[#c18d73]">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
