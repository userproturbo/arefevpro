import PageContainer from "@/app/components/PageContainer";
import { notFound } from "next/navigation";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  photos: {
    id: number;
    url: string;
    width: number | null;
    height: number | null;
  }[];
};

export default async function PhotoAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let res: Response;
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    res = await fetch(`${baseUrl}/api/albums/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("Fetch album failed:", error);
    return (
      <PageContainer>
        <h1 className="text-2xl font-semibold">Не удалось загрузить альбом</h1>
      </PageContainer>
    );
  }

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-semibold">Ошибка загрузки альбома</h1>
      </PageContainer>
    );
  }

  const data = (await res.json()) as { album?: Album };
  if (!data.album) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{data.album.title}</h1>
          {data.album.description ? (
            <p className="text-muted-foreground">{data.album.description}</p>
          ) : null}
        </div>

        {data.album.photos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-white/70">
            Фотографии будут добавлены позже
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.album.photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  loading="lazy"
                  className="aspect-square h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
