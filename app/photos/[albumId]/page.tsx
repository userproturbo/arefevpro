import PageContainer from "@/app/components/PageContainer";
import PhotosGrid from "./PhotosGrid";

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function AlbumPage({ params }: PageProps) {
  const { albumId } = await params;
  const id = Number(albumId);

  if (!Number.isFinite(id)) {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">Некорректный альбом</h1>
      </PageContainer>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  let res: Response;

  try {
    res = await fetch(`${baseUrl}/api/albums/${id}`, {
      cache: "no-store",
    });
  } catch (e) {
    console.error("Fetch album failed:", e);
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">
          Не удалось загрузить альбом
        </h1>
      </PageContainer>
    );
  }

  if (res.status === 404) {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">Альбом не найден</h1>
      </PageContainer>
    );
  }

  if (!res.ok) {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">
          Ошибка загрузки альбома
        </h1>
      </PageContainer>
    );
  }

  const data = await res.json();

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold mb-2">
        {data.album.title}
      </h1>

      {data.album.description && (
        <p className="text-muted-foreground mb-6">
          {data.album.description}
        </p>
      )}

      <PhotosGrid photos={data.album.photos} />
    </PageContainer>
  );
}
