import type { BlogLinkBlock } from "@/lib/blogBlocks";
import type { BlogAlign, BlogVariant } from "@/types/blogBlocks";

type Props = {
  block: BlogLinkBlock;
  variant: BlogVariant;
  align: BlogAlign;
};

export default function LinkBlock({ block }: Props) {
  return (
    <div>
      <a
        href={block.data.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/15"
      >
        <span>{block.data.label}</span>
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}
