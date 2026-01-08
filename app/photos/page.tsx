import PageContainer from "../components/PageContainer";
import AlbumsList from "./AlbumsList";

type Album = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  photosCount: number;
  coverUrl: string | null;
};

async function fetchAlbums(): Promise<Album[] | null> {
  try {
    const res = await fetch("/api/albums", { cache: "no-store" });
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
