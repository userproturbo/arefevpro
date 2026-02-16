import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) redirect("/admin/video");

  await requireAdmin(`/admin/videos/${id}/edit`);
  redirect(`/admin/video?edit=${id}`);
}
