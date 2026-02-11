import Link from "next/link";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  createdAt?: string | null;
  itemCount?: number | null;
  status?: "ARCHIVED" | "ACTIVE" | null;
};

type Props = {
  albums: Album[];
};

const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

function formatArchiveDate(value?: string | null) {
  if (!value) return "--.--.----";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--.--.----";
  return date.toLocaleDateString("ru-RU");
}

function formatArchiveId(id: number) {
  return `ARX-${String(id).padStart(4, "0")}`;
}

export default function AlbumsList({ albums }: Props) {
  if (albums.length === 0) {
    return (
      <div className="border border-[#275636] bg-[#09120d] p-4 text-sm uppercase tracking-[0.12em] text-[#8ec99c]">
        NO ARCHIVE RECORDS
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {albums.map((album, index) => {
        const status = album.status ?? "ACTIVE";
        const itemCountLabel =
          typeof album.itemCount === "number" ? String(album.itemCount) : "N/A";

        return (
          <article
            key={album.id}
            className="border border-[#275636] bg-[#050b07] p-4 text-[#c0f6cf]"
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-[#1f4630] pb-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#78b78a]">
                STATION ARCHIVE UNIT
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#78b78a]">
                REC #{String(index + 1).padStart(2, "0")}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              {/* Cover */}
              <div className="bg-[#08110d] p-2">
                <div className="aspect-[16/9] overflow-hidden rounded-sm">
                  <img
                    src={album.coverImage ?? PLACEHOLDER_COVER}
                    alt={album.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#7fb08d]">
                  <span>VIEWPORT</span>
                  <span>VISUAL FEED</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col bg-[#08110d] p-3">
                <div className="border-b border-[#1f4630] pb-2">
                  <h2 className="text-base font-semibold uppercase tracking-[0.1em] text-[#b7f8c7]">
                    {album.title}
                  </h2>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#74ab83]">
                    ARCHIVE DOSSIER
                  </p>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#9ed3ac]">
                  {album.description ?? "No description attached to this archive record."}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-[#1f4630] py-3 text-[11px] uppercase tracking-[0.14em]">
                  <div className="flex justify-between text-[#80b68e]">
                    <span>ARCHIVE ID</span>
                    <span className="text-[#c2f8d0]">
                      {formatArchiveId(album.id)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#80b68e]">
                    <span>ITEM COUNT</span>
                    <span className="text-[#c2f8d0]">{itemCountLabel}</span>
                  </div>
                  <div className="flex justify-between text-[#80b68e]">
                    <span>CREATED DATE</span>
                    <span className="text-[#c2f8d0]">
                      {formatArchiveDate(album.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#80b68e]">
                    <span>STATUS</span>
                    <span className="text-[#7bff6b]">{status}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/photo/${album.slug}`}
                    className="inline-flex w-full items-center justify-between border border-[#2f6a47] bg-[#0a1510] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#bff5ce] transition hover:border-[#7bff6b]/70 hover:text-[#d5ffe0]"
                  >
                    <span>OPEN ARCHIVE</span>
                    <span aria-hidden="true">[ EXEC ]</span>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
