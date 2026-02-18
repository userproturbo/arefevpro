import type { BlogBlock } from "@/lib/blogBlocks";

type AudioBlockData = Extract<BlogBlock, { type: "audio" }>;

type Props = {
  block: AudioBlockData;
};

export default function AudioBlock({ block }: Props) {
  return (
    <figure className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
      <audio controls className="w-full">
        <source src={block.src} />
        Ваш браузер не поддерживает воспроизведение аудио.
      </audio>
      {block.caption ? (
        <figcaption className="text-center text-xs uppercase tracking-[0.1em] text-white/45">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
