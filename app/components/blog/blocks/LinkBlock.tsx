import type { BlogBlock } from "@/lib/blogBlocks";

type LinkBlockData = Extract<BlogBlock, { type: "link" }>;

type Props = {
  block: LinkBlockData;
};

export default function LinkBlock({ block }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <a
        href={block.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/15"
      >
        <span>{block.label}</span>
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}
