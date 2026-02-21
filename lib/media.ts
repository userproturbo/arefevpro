import { MediaType, Prisma, PrismaClient } from "@prisma/client";
import type { MediaDTO } from "@/types/media";

type MediaLike = {
  id: number;
  type: MediaType;
  url: string;
  width: number | null;
  height: number | null;
  durationSec: number | null;
};

type CreateMediaInput = {
  type: MediaType;
  url: string;
  storageKey?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  alt?: string | null;
  caption?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

type ResolveMediaReferenceInput = {
  mediaId?: number | null;
  url?: string | null;
  type: MediaType;
  storageKeyPrefix: string;
  mimeType?: string | null;
};

export function toMediaDTO(media: MediaLike | null | undefined): MediaDTO | null {
  if (!media) return null;

  return {
    id: media.id,
    type: media.type,
    url: media.url,
    ...(media.width ? { width: media.width } : {}),
    ...(media.height ? { height: media.height } : {}),
    ...(media.durationSec ? { durationSec: media.durationSec } : {}),
  };
}

export function getStorageKeyFromUrl(url: string, fallbackPrefix: string): string {
  const trimmed = url.trim();
  if (!trimmed) return `${fallbackPrefix}/unknown`;

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.slice("/uploads/".length);
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.replace(/^\/+/, "");
    if (!pathname) return `${fallbackPrefix}/external`;

    if (pathname.startsWith("uploads/")) {
      return pathname.slice("uploads/".length);
    }

    return pathname;
  } catch {
    return `${fallbackPrefix}/external`;
  }
}

export async function createMediaRecord(
  prisma: PrismaClient | Prisma.TransactionClient,
  input: CreateMediaInput
) {
  const url = input.url.trim();
  if (!url) {
    throw new Error("media url is required");
  }

  return prisma.media.create({
    data: {
      type: input.type,
      url,
      storageKey:
        input.storageKey?.trim() || getStorageKeyFromUrl(url, `legacy/${input.type.toLowerCase()}`),
      mimeType: input.mimeType ?? null,
      sizeBytes: input.sizeBytes ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      durationSec: input.durationSec ?? null,
      alt: input.alt ?? null,
      caption: input.caption ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function resolveMediaReference(
  prisma: PrismaClient | Prisma.TransactionClient,
  input: ResolveMediaReferenceInput
): Promise<number | null> {
  if (typeof input.mediaId === "number" && input.mediaId > 0) {
    return input.mediaId;
  }

  const rawUrl = input.url?.trim() ?? "";
  if (!rawUrl) return null;

  const created = await createMediaRecord(prisma, {
    type: input.type,
    url: rawUrl,
    storageKey: getStorageKeyFromUrl(rawUrl, input.storageKeyPrefix),
    mimeType: input.mimeType ?? null,
  });

  return created.id;
}
