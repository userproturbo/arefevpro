import type { BlogAlign, BlogBlockBase, RenderInstruction } from "@/types/blogBlocks";

function hasManualOverride(block: BlogBlockBase): boolean {
  return Boolean(block.variant || block.align);
}

function quoteTextLength(block: BlogBlockBase): number {
  if (block.type !== "quote") return 0;
  const text = typeof block.data?.text === "string" ? block.data.text.trim() : "";
  return text.length;
}

function headingLevel(block: BlogBlockBase): number | null {
  if (block.type !== "heading") return null;
  const level = block.data?.level;
  return level === 1 || level === 2 || level === 3 ? level : null;
}

function defaultComputed(block: BlogBlockBase): { variant: string; align: BlogAlign } {
  return {
    variant: block.variant ?? "default",
    align: block.align ?? "normal",
  };
}

export function computeBlogLayout(blocks: BlogBlockBase[]): RenderInstruction[] {
  let firstMediaApplied = false;

  return blocks.map((block, index) => {
    const base = defaultComputed(block);

    if (
      !firstMediaApplied &&
      (block.type === "image" || block.type === "video") &&
      !hasManualOverride(block)
    ) {
      firstMediaApplied = true;
      return {
        ...block,
        computed: {
          variant: "hero",
          align: "full",
        },
      };
    }

    if (block.type === "quote" && !hasManualOverride(block)) {
      if (quoteTextLength(block) <= 140) {
        return {
          ...block,
          computed: {
            variant: "pullquote",
            align: "wide",
          },
        };
      }

      return {
        ...block,
        computed: {
          variant: "quote",
          align: "normal",
        },
      };
    }

    if (
      block.type === "image" &&
      !hasManualOverride(block) &&
      index > 0 &&
      blocks[index - 1]?.type === "image"
    ) {
      return {
        ...block,
        computed: {
          variant: "inline",
          align: "normal",
        },
      };
    }

    const level = headingLevel(block);
    if (level !== null && !hasManualOverride(block)) {
      if ((level === 1 || level === 2) && index < 3) {
        return {
          ...block,
          computed: {
            variant: "deck",
            align: "wide",
          },
        };
      }

      return {
        ...block,
        computed: base,
      };
    }

    return {
      ...block,
      computed: base,
    };
  });
}
