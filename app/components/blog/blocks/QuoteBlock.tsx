import type { BlogQuoteBlock } from "@/lib/blogBlocks";
import type { BlogAlign, BlogVariant } from "@/types/blogBlocks";

type Props = {
  block: BlogQuoteBlock;
  variant: BlogVariant;
  align: BlogAlign;
};

export default function QuoteBlock({ block, variant }: Props) {
  const isPullquote = variant === "pullquote";
  const wrapClass = isPullquote
    ? "mx-auto my-10 max-w-2xl space-y-4 rounded-2xl border border-cyan-300/20 border-l-4 border-l-cyan-300/70 bg-cyan-400/[0.05] px-6 py-6 shadow-[0_0_0_1px_rgba(103,232,249,0.12),0_0_30px_-12px_rgba(34,211,238,0.55)]"
    : "my-10 space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] px-6 py-5";
  const textClass = isPullquote ? "text-xl leading-9 sm:text-2xl" : "text-lg leading-8";

  return (
    <blockquote className={wrapClass}>
      <p className={`whitespace-pre-wrap italic text-cyan-100/90 ${textClass}`}>“{block.data.text}”</p>
      {block.data.author ? (
        <footer className="text-xs uppercase tracking-[0.12em] text-white/45">{block.data.author}</footer>
      ) : null}
    </blockquote>
  );
}
