/* eslint-disable @next/next/no-img-element */
import type { BlogImageBlock } from "@/lib/blogBlocks";
import type { BlogAlign, BlogVariant } from "@/types/blogBlocks";

type Props = {
  block: BlogImageBlock;
  variant: BlogVariant;
  align: BlogAlign;
};

export default function ImageBlock({ block, variant }: Props) {
  if (!block.data.src) return null;

  const isHero = variant === "hero";
  const isInline = variant === "inline";

  const figureClass = `space-y-3 ${isHero ? "mt-8 mb-12" : "my-8"} ${isInline ? "mx-auto max-w-xl" : ""}`;
  const frameClass = isHero
    ? "group relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-black/70 shadow-[0_0_0_1px_rgba(103,232,249,0.12),0_38px_72px_-44px_rgba(34,211,238,0.55)]"
    : isInline
      ? "overflow-hidden rounded-xl border border-cyan-300/15 bg-black/45 shadow-[0_0_0_1px_rgba(103,232,249,0.06),0_24px_48px_-34px_rgba(6,182,212,0.35)]"
      : "overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/50 shadow-[0_0_0_1px_rgba(103,232,249,0.08),0_30px_60px_-40px_rgba(6,182,212,0.4)]";
  const imageClass = isHero ? "w-full aspect-video object-cover" : "h-auto w-full object-cover";

  return (
    <figure className={figureClass}>
      <div className={frameClass}>
        <img
          src={block.data.src}
          alt={block.data.alt || block.data.caption || "Blog image"}
          className={imageClass}
          loading="lazy"
        />
        {isHero ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        ) : null}
      </div>
      {block.data.caption ? (
        <figcaption className="text-center text-xs uppercase tracking-[0.1em] text-white/45">
          {block.data.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
