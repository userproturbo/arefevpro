import type { BlogBlock } from "@/lib/blogBlocks";
import HeadingBlock from "./blocks/HeadingBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import AudioBlock from "./blocks/AudioBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import LinkBlock from "./blocks/LinkBlock";

type Props = {
  content: BlogBlock[];
};

export default function BlogContentRenderer({ content }: Props) {
  return (
    <div className="space-y-8">
      {content.map((block) => {
        if (block.type === "heading") {
          return <HeadingBlock key={block.id} block={block} />;
        }
        if (block.type === "paragraph") {
          return <ParagraphBlock key={block.id} block={block} />;
        }
        if (block.type === "image") {
          return <ImageBlock key={block.id} block={block} />;
        }
        if (block.type === "video") {
          return <VideoBlock key={block.id} block={block} />;
        }
        if (block.type === "audio") {
          return <AudioBlock key={block.id} block={block} />;
        }
        if (block.type === "quote") {
          return <QuoteBlock key={block.id} block={block} />;
        }

        return <LinkBlock key={block.id} block={block} />;
      })}
    </div>
  );
}
