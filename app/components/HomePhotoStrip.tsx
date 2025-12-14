export default function HomePhotoStrip() {
  const images = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-50",
  ];

  return (
    <div className="w-full h-full flex-shrink-0 overflow-x-auto overflow-y-hidden border-t border-white/10 py-6 px-10 hide-scrollbar">
      <div className="flex h-full items-center gap-6">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Home strip ${i + 1}`}
            className="h-32 w-64 flex-shrink-0 rounded-lg object-cover md:h-40 md:w-60"
          />
        ))}
      </div>
    </div>
  );
}
