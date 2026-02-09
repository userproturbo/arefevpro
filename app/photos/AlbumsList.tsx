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
            className="group relative border border-[#2b6040] bg-[#050b07] p-3 text-[#c0f6cf] before:pointer-events-none before:absolute before:inset-1 before:border before:border-[#183524] before:content-[''] after:pointer-events-none after:absolute after:inset-x-3 after:top-0 after:h-px after:bg-[#7bff6b]/35 after:content-['']"
          >
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-[#7bff6b]/60" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-[#7bff6b]/60" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[#7bff6b]/60" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#7bff6b]/60" />

            <div className="relative mb-3 flex items-center justify-between border-b border-[#1f4630] pb-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#78b78a]">
                STATION ARCHIVE UNIT
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#78b78a]">
                REC #{String(index + 1).padStart(2, "0")}
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <div className="relative border border-[#29583b] bg-[#08110d] p-2">
                <div className="pointer-events-none absolute inset-0 border border-[#11271b]" />
                <div className="pointer-events-none absolute left-2 right-2 top-2 h-px bg-[#2b6040]" />
                <div className="pointer-events-none absolute bottom-2 left-2 right-2 h-px bg-[#2b6040]" />

                <div className="relative border border-[#1d412c] bg-black/30 p-1">
                  <div className="aspect-[16/9] border border-[#244e35]">
                    <img
                      src={album.coverImage ?? PLACEHOLDER_COVER}
                      alt={album.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="relative mt-2 flex items-center justify-between border-t border-[#1f4630] pt-2 text-[10px] uppercase tracking-[0.18em] text-[#7fb08d]">
                  <span>VIEWPORT</span>
                  <span>VISUAL FEED</span>
                </div>
              </div>

              <div className="flex min-h-full flex-col border border-[#29583b] bg-[#08110d] p-3">
                <div className="border-b border-[#1f4630] pb-2">
                  <h2 className="text-base font-semibold uppercase tracking-[0.1em] text-[#b7f8c7]">
                    {album.title}
                  </h2>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#74ab83]">
                    ARCHIVE DOSSIER
                  </p>
                </div>

                <p className="mt-3 min-h-11 text-sm leading-relaxed text-[#9ed3ac]">
                  {album.description ?? "No description attached to this archive record."}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-[#1f4630] py-3 text-[11px] uppercase tracking-[0.14em]">
                  <div className="flex items-center justify-between gap-2 border-b border-[#163423] pb-1 text-[#80b68e]">
                    <span>ARCHIVE ID</span>
                    <span className="text-[#c2f8d0]">{formatArchiveId(album.id)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-b border-[#163423] pb-1 text-[#80b68e]">
                    <span>ITEM COUNT</span>
                    <span className="text-[#c2f8d0]">{itemCountLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[#80b68e]">
                    <span>CREATED DATE</span>
                    <span className="text-[#c2f8d0]">{formatArchiveDate(album.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[#80b68e]">
                    <span>STATUS</span>
                    <span className="text-[#7bff6b]">{status}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border border-[#1f4630] bg-[#060d09] px-2 py-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#79b889]">
                    <span className="h-1.5 w-1.5 border border-[#7bff6b]/60" />
                    <span>MODULE READY</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#78b78a]">[ SYS ]</span>
                  </div>
                </div>

                <div className="mt-3">
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
