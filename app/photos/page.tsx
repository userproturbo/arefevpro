import PageContainer from "../components/PageContainer";
import AlbumsList from "./AlbumsList";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
};

async function fetchAlbums(): Promise<Album[] | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/albums`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { albums?: Album[] };
    return Array.isArray(data.albums) ? data.albums : [];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function PhotosPage() {
  const albums = await fetchAlbums();

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Photos</h1>
        {albums === null ? (
          <p className="text-white/70">Failed to load albums</p>
        ) : (
          <AlbumsList albums={albums} />
        )}
      </div>
    </PageContainer>
  );
}
