import type { BlogBlock } from "@/lib/blogBlocks";

type QuoteBlockData = Extract<BlogBlock, { type: "quote" }>;

type Props = {
  block: QuoteBlockData;
};

export default function QuoteBlock({ block }: Props) {
  return (
    <blockquote className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] px-6 py-5">
      <p className="whitespace-pre-wrap text-lg italic leading-8 text-cyan-100/90">“{block.text}”</p>
      {block.author ? (
        <footer className="text-xs uppercase tracking-[0.12em] text-white/45">{block.author}</footer>
      ) : null}
    </blockquote>
  );
}
