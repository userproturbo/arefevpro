import "server-only";

import { prisma } from "./prisma";
import { logServerError } from "@/lib/db";

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function slugify(value: string) {
  const transliterated = value
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("");

  return transliterated
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function generateUniqueSlug(title: string, desired?: string) {
  const base = slugify(desired || title) || `${Date.now()}`;
  let candidate = base;
  let index = 1;

  try {
    while (await prisma.post.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${index++}`;
    }

    return candidate;
  } catch (error) {
    logServerError("Unique slug generation error:", error);
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base}-${suffix}`;
  }
}
