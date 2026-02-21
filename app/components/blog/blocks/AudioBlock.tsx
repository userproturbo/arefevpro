import type { BlogAudioBlock } from "@/lib/blogBlocks";
import type { BlogAlign, BlogVariant } from "@/types/blogBlocks";

type Props = {
  block: BlogAudioBlock;
  variant: BlogVariant;
  align: BlogAlign;
};

export default function AudioBlock({ block }: Props) {
  if (!block.data.src) return null;

  return (
    <figure className="space-y-3 rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
      <audio controls className="w-full">
        <source src={block.data.src} />
        Ваш браузер не поддерживает воспроизведение аудио.
      </audio>
      {block.data.caption ? (
        <figcaption className="text-center text-xs uppercase tracking-[0.1em] text-white/45">
          {block.data.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
