export const dynamic = "force-dynamic";

import PhotoSlideshow from "../components/photo/PhotoSlideshow";

type Slide = {
  id: number;
  url: string;
  albumSlug: string;
};

async function fetchRandomPhotos(): Promise<Slide[] | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/photos/random?limit=20`);
    if (!res.ok) return null;
    const data = (await res.json()) as { photos?: Slide[] };
    return Array.isArray(data.photos) ? data.photos : [];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function PhotoPage() {
  const photos = await fetchRandomPhotos();

  return (
    <div className="h-full w-full">
      <PhotoSlideshow initialPhotos={photos ?? []} />
    </div>
  );
}
