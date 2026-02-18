import type { BlogBlock } from "@/lib/blogBlocks";

type HeadingBlockData = Extract<BlogBlock, { type: "heading" }>;

type Props = {
  block: HeadingBlockData;
};

export default function HeadingBlock({ block }: Props) {
  if (block.level === 1) {
    return <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{block.text}</h2>;
  }
  if (block.level === 2) {
    return <h3 className="text-2xl font-semibold leading-snug text-white sm:text-3xl">{block.text}</h3>;
  }
  return <h4 className="text-xl font-semibold leading-snug text-white/95 sm:text-2xl">{block.text}</h4>;
}
