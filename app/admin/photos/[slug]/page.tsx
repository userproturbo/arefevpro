import PageContainer from "@/app/components/PageContainer";
import PhotosGrid from "./PhotosGrid";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { redirect } from "next/navigation";
import UploadPhotoForm from "./UploadPhotoForm";
import PublishToggle from "./PublishToggle";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminAlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">Некорректный альбом</h1>
      </PageContainer>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/admin/login?next=/admin/photos/${encodeURIComponent(normalizedSlug)}`);
  }
  if (user.role !== "ADMIN") redirect("/");

  try {
    const album = await prisma.album.findUnique({
      where: { slug: normalizedSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        published: true,
        coverPhotoId: true,
        photos: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!album) {
      return (
        <PageContainer>
          <h1 className="text-xl font-semibold">Album not found</h1>
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold">
                {album.title}
              </h1>
              <PublishToggle
                albumSlug={album.slug}
                initialPublished={album.published}
              />
            </div>

            {album.description && (
              <p className="text-muted-foreground">
                {album.description}
              </p>
            )}
          </div>

          <UploadPhotoForm albumSlug={album.slug} />

          <PhotosGrid
            albumSlug={album.slug}
            photos={album.photos}
            coverPhotoId={album.coverPhotoId ?? null}
          />
        </div>
      </PageContainer>
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin album load error:", error);
      }
      return (
        <PageContainer>
          <h1 className="text-xl font-semibold">
            {getDatabaseUnavailableMessage()}
          </h1>
        </PageContainer>
      );
    }

    console.error("Admin album load error:", error);
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">
          Ошибка загрузки альбома
        </h1>
      </PageContainer>
    );
  }
}
