/* eslint-disable @next/next/no-img-element */
import type { BlogBlock } from "@/lib/blogBlocks";

type ImageBlockData = Extract<BlogBlock, { type: "image" }>;

type Props = {
  block: ImageBlockData;
};

export default function ImageBlock({ block }: Props) {
  return (
    <figure className="mx-auto max-w-4xl space-y-3">
      <div className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/50 shadow-[0_0_0_1px_rgba(103,232,249,0.08),0_30px_60px_-40px_rgba(6,182,212,0.4)]">
        <img
          src={block.src}
          alt={block.caption || "Blog image"}
          className="h-auto w-full object-cover"
          loading="lazy"
        />
      </div>
      {block.caption ? (
        <figcaption className="text-center text-xs uppercase tracking-[0.1em] text-white/45">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
