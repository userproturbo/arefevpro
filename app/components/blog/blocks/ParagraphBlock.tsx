import type { BlogParagraphBlock } from "@/lib/blogBlocks";
import type { BlogAlign, BlogVariant } from "@/types/blogBlocks";

type Props = {
  block: BlogParagraphBlock;
  variant: BlogVariant;
  align: BlogAlign;
};

export default function ParagraphBlock({ block }: Props) {
  return (
    <p className="mb-6 whitespace-pre-wrap break-words text-base leading-8 text-white/85 sm:text-lg sm:leading-9">
      {block.data.text}
    </p>
  );
}
