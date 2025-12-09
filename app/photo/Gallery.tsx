const placeholders = Array.from({ length: 9 });

export default function Gallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="w-full aspect-square bg-neutral-800/40 rounded-xl border border-neutral-700/40"
        />
      ))}
    </div>
  );
}
