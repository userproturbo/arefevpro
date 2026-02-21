import type { BlogHeadingBlock } from "@/lib/blogBlocks";
import type { BlogAlign, BlogVariant } from "@/types/blogBlocks";

type Props = {
  block: BlogHeadingBlock;
  variant: BlogVariant;
  align: BlogAlign;
};

export default function HeadingBlock({ block, variant }: Props) {
  const deckClass = variant === "deck" ? "tracking-[0.04em] text-white/90 sm:mb-5 sm:mt-14" : "";

  if (block.data.level === 1) {
    return (
      <h2 className={`mb-4 mt-12 text-3xl font-semibold leading-tight text-white sm:text-4xl ${deckClass}`}>
        {block.data.text}
      </h2>
    );
  }
  if (block.data.level === 2) {
    return (
      <h3 className={`mb-4 mt-12 text-2xl font-semibold leading-snug text-white sm:text-3xl ${deckClass}`}>
        {block.data.text}
      </h3>
    );
  }
  return (
    <h4 className={`mb-4 mt-12 text-xl font-semibold leading-snug text-white/95 sm:text-2xl ${deckClass}`}>
      {block.data.text}
    </h4>
  );
}
