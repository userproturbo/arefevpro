"use client";

export default function AlbumPanel() {
  return (
    <div className="h-full overflow-y-auto p-8 text-white space-y-4">
      <h2 className="text-2xl font-semibold">Photo Albums</h2>
      <p className="text-white/70 leading-relaxed">
        Curated photo stories will appear here. For now, imagine a wall of prints slowly filling up
        with memories.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-lg border border-white/10 bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}
