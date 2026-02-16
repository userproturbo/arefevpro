import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin/lib/requireAdmin";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminAlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    redirect("/admin/photo");
  }

  await requireAdmin(`/admin/photos/${encodeURIComponent(normalizedSlug)}`);
  redirect(`/admin/photo?edit=${encodeURIComponent(normalizedSlug)}`);
}
