export default function AudioController() {
  return (
    <section className="rounded-lg border border-[#1a4028] bg-[#050b07] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9ef6b2]">
          Audio Controller
        </h2>
        <span className="text-xs uppercase tracking-[0.1em] text-[#7da98a]">Stub</span>
      </div>

      <div className="mb-2 h-1.5 rounded-full bg-[#0c1a12]">
        <div className="h-full w-0 rounded-full bg-[#73ff8c]" />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          className="rounded-md border border-[#2c5d3c] bg-[#0b1811] px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#87b996] disabled:opacity-70"
        >
          Prev
        </button>
        <button
          type="button"
          disabled
          className="rounded-md border border-[#2c5d3c] bg-[#0b1811] px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#87b996] disabled:opacity-70"
        >
          Play
        </button>
        <button
          type="button"
          disabled
          className="rounded-md border border-[#2c5d3c] bg-[#0b1811] px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#87b996] disabled:opacity-70"
        >
          Next
        </button>
      </div>
    </section>
  );
}
