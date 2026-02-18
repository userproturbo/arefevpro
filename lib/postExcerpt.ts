import { parseBlogContent } from "@/lib/blogBlocks";

type ExcerptPost = {
  content?: unknown;
  text?: string | null;
};

function trimAndLimit(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength).trimEnd()}…`
    : normalized;
}

export function getPostExcerpt(post: ExcerptPost, maxLength = 160): string {
  const parsedContent = parseBlogContent(post.content);
  if (parsedContent?.length) {
    const paragraph = parsedContent.find(
      (block): block is Extract<(typeof parsedContent)[number], { type: "paragraph" }> =>
        block.type === "paragraph" && block.text.trim().length > 0
    );
    if (paragraph) {
      return trimAndLimit(paragraph.text, maxLength);
    }
  }

  const legacyText = typeof post.text === "string" ? post.text : "";
  return trimAndLimit(legacyText, maxLength);
}
