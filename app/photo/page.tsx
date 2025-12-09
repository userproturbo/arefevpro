import AlbumList from "./AlbumList";
import Gallery from "./Gallery";

export default function PhotoPage() {
  return (
    <div className="flex">
      <div className="w-40 px-6 py-20">
        <AlbumList />
      </div>

      <div className="flex-1 px-6 py-20">
        <Gallery />
      </div>
    </div>
  );
}
