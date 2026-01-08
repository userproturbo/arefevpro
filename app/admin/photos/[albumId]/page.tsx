import PageContainer from "@/app/components/PageContainer";
import PhotosGrid from "./PhotosGrid";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import UploadPhotoForm from "./UploadPhotoForm";

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function AdminAlbumPage({ params }: PageProps) {
  // 🔴 ВАЖНО: await params
  const { albumId } = await params;
  const id = Number(albumId);

  if (!Number.isFinite(id)) {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">Некорректный альбом</h1>
      </PageContainer>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=/admin/photos/${id}`);
  if (user.role !== "ADMIN") redirect("/");

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
          Ошибка загрузки альбома
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
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {data.album.title}
          </h1>

          {data.album.description && (
            <p className="text-muted-foreground">
              {data.album.description}
            </p>
          )}
        </div>

        <UploadPhotoForm albumId={id} />

        <PhotosGrid
          albumId={id}
          photos={data.album.photos}
          coverPhotoId={data.album.coverPhotoId ?? null}
        />
      </div>
    </PageContainer>
  );
}
