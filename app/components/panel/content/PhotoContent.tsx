"use client";

const placeholders = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60&sat=-50",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60&sat=-45",
];

export default function PhotoContent() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-xl font-semibold text-white">Album preview</h3>
        <p className="mt-2 text-sm text-white/60">
          Drop album covers or a hero gallery here when assets are ready.
        </p>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
        {placeholders.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
          >
            <img
              src={src}
              alt={`Placeholder ${index + 1}`}
              className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
