import type { BlogBlock } from "@/lib/blogBlocks";

type ParagraphBlockData = Extract<BlogBlock, { type: "paragraph" }>;

type Props = {
  block: ParagraphBlockData;
};

export default function ParagraphBlock({ block }: Props) {
  return (
    <p className="whitespace-pre-wrap break-words text-base leading-8 text-white/85 sm:text-lg sm:leading-9">
      {block.text}
    </p>
  );
}
