import AlbumPanel from "./AlbumPanel";
import Gallery from "./Gallery";

export default function PhotoPage() {
  return (
    <div className="relative">
      <AlbumPanel />

      <div className="ml-72 px-6 py-20">
        <Gallery />
      </div>
    </div>
  );
}
