import PageContainer from "@/app/components/PageContainer";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function AlbumPage({ params }: PageProps) {
  const { albumId } = await params;
  const numericId = Number(albumId);

  if (!Number.isFinite(numericId)) {
    redirect(`/photo/${albumId}`);
  }

  try {
    const album = await prisma.album.findFirst({
      where: { id: numericId, published: true, slug: { not: null } },
      select: { slug: true },
    });

    if (!album?.slug) {
      notFound();
    }

    redirect(`/photo/${album.slug}`);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Album redirect error:", error);
      }
      return (
        <PageContainer>
          <h1 className="text-xl font-semibold">
            {getDatabaseUnavailableMessage()}
          </h1>
        </PageContainer>
      );
    }

    console.error("Album redirect error:", error);
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">
          Ошибка загрузки альбома
        </h1>
      </PageContainer>
    );
  }
}
