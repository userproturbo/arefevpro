"use client";

import type {
  BlogAlign,
  BlogAudioBlock,
  BlogBlock,
  BlogHeadingBlock,
  BlogImageBlock,
  BlogLinkBlock,
  BlogParagraphBlock,
  BlogQuoteBlock,
  BlogVideoBlock,
} from "@/lib/blogBlocks";
import { computeBlogLayout } from "@/lib/blogLayoutEngine";
import { motion } from "framer-motion";
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

function alignClass(align: BlogAlign): string {
  if (align === "wide") return "mx-auto max-w-4xl";
  if (align === "full") return "w-full";
  return "mx-auto max-w-2xl";
}

export default function BlogContentRenderer({ content }: Props) {
  const instructions = computeBlogLayout(content);

  return (
    <div>
      {instructions.map((block) => {
        const wrapClass = alignClass(block.computed.align);
        const animatedWrapClass = `${wrapClass} will-change-transform`;

        if (block.type === "heading") {
          const typed = block as BlogHeadingBlock;
          return (
            <motion.div
              key={block.id}
              className={animatedWrapClass}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <HeadingBlock block={typed} variant={block.computed.variant} align={block.computed.align} />
            </motion.div>
          );
        }
        if (block.type === "paragraph") {
          const typed = block as BlogParagraphBlock;
          return (
            <motion.div
              key={block.id}
              className={animatedWrapClass}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ParagraphBlock block={typed} variant={block.computed.variant} align={block.computed.align} />
            </motion.div>
          );
        }
        if (block.type === "image") {
          const typed = block as BlogImageBlock;
          return (
            <motion.div
              key={block.id}
              className={animatedWrapClass}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ImageBlock block={typed} variant={block.computed.variant} align={block.computed.align} />
            </motion.div>
          );
        }
        if (block.type === "video") {
          const typed = block as BlogVideoBlock;
          return (
            <motion.div
              key={block.id}
              className={animatedWrapClass}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <VideoBlock block={typed} variant={block.computed.variant} align={block.computed.align} />
            </motion.div>
          );
        }
        if (block.type === "audio") {
          const typed = block as BlogAudioBlock;
          return (
            <motion.div
              key={block.id}
              className={animatedWrapClass}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <AudioBlock block={typed} variant={block.computed.variant} align={block.computed.align} />
            </motion.div>
          );
        }
        if (block.type === "quote") {
          const typed = block as BlogQuoteBlock;
          return (
            <motion.div
              key={block.id}
              className={animatedWrapClass}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <QuoteBlock block={typed} variant={block.computed.variant} align={block.computed.align} />
            </motion.div>
          );
        }

        const typed = block as BlogLinkBlock;
        return (
          <motion.div
            key={block.id}
            className={animatedWrapClass}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <LinkBlock block={typed} variant={block.computed.variant} align={block.computed.align} />
          </motion.div>
        );
      })}
    </div>
  );
}
