import { redirect } from "next/navigation";
import { getAdminType } from "@/lib/adminPostTypes";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

export const runtime = "nodejs";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeParam = Array.isArray(params?.type) ? params.type[0] : params?.type;
  const requestedPath = `/admin/posts/new${typeParam ? `?type=${typeParam}` : ""}`;

  await requireAdmin(requestedPath);

  const typeConfig = getAdminType(typeParam);

  const nextByType = (() => {
    switch (typeConfig?.key) {
      case "about":
        return "/admin/projects?create=1";
      case "photo":
        return "/admin/photo?create=1";
      case "video":
        return "/admin/video?create=1";
      case "music":
        return "/admin/audio?create=1";
      case "blog":
      default:
        return "/admin/blog?create=1";
    }
  })();

  redirect(nextByType);
}
