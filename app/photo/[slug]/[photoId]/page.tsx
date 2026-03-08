import { redirect } from "next/navigation";

export default async function LegacyPhotoViewerRedirect({
  params,
}: {
  params: Promise<{ slug: string; photoId: string }>;
}) {
  const { slug, photoId } = await params;
  const normalizedSlug = slug.trim();
  const parsedPhotoId = Number(photoId);

  if (!normalizedSlug || !Number.isFinite(parsedPhotoId) || parsedPhotoId <= 0) {
    redirect(`/photo/${encodeURIComponent(normalizedSlug || slug)}`);
  }

  redirect(`/photo/${encodeURIComponent(normalizedSlug)}?photo=${parsedPhotoId}`);
}
