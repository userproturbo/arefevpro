import PageContainer from "@/app/components/PageContainer";
import PhotosGrid from "./PhotosGrid";
import UploadPhotoForm from "./UploadPhotoForm";
import PublishToggle from "./PublishToggle";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type AlbumWithPhotos = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  coverPhotoId: number | null;
  photos: {
    id: number;
    url: string;
  }[];
};

type LoadError = "not-found" | "db-unavailable" | "db" | null;

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
    redirect(
      `/admin/login?next=/admin/photos/${encodeURIComponent(normalizedSlug)}`
    );
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  let album: AlbumWithPhotos | null = null;
  let error: LoadError = null;

  try {
    album = await prisma.album.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        published: true,
        coverPhotoId: true,
        photos: {
          where: { deletedAt: null },
          orderBy: [
            { order: "asc" },
            { createdAt: "asc" },
          ],
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!album) {
      error = "not-found";
    }
  } catch (fetchError) {
    if (isDatabaseUnavailableError(fetchError)) {
      if (!isExpectedDevDatabaseError(fetchError)) {
        console.error("Admin album load error:", fetchError);
      }
      error = "db-unavailable";
    } else {
      console.error("Admin album load error:", fetchError);
      error = "db";
    }
  }

  if (error === "db-unavailable") {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">
          {getDatabaseUnavailableMessage()}
        </h1>
      </PageContainer>
    );
  }

  if (error === "db") {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">
          Ошибка загрузки альбома
        </h1>
      </PageContainer>
    );
  }

  if (error === "not-found" || !album) {
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
            <h1 className="text-2xl font-semibold">{album.title}</h1>
            <PublishToggle
              albumSlug={album.slug}
              initialPublished={album.published}
            />
          </div>

          {album.description && (
            <p className="text-muted-foreground">{album.description}</p>
          )}
        </div>

        <UploadPhotoForm albumSlug={album.slug} />

        <PhotosGrid
          albumSlug={album.slug}
          photos={album.photos}
          coverPhotoId={album.coverPhotoId}
        />
      </div>
    </PageContainer>
  );
}
