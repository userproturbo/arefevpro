-- Stage 1: Unified Media Model (soft migration)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediaType') THEN
    CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "Media" (
  "id" SERIAL NOT NULL,
  "type" "MediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" TEXT,
  "sizeBytes" INTEGER,
  "width" INTEGER,
  "height" INTEGER,
  "durationSec" INTEGER,
  "alt" TEXT,
  "caption" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "mediaId" INTEGER;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "mediaId" INTEGER;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "thumbnailMediaId" INTEGER;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "coverMediaId" INTEGER;

-- Allow clearing legacy direct URL fields after migration.
ALTER TABLE "Photo" ALTER COLUMN "url" DROP NOT NULL;
ALTER TABLE "Photo" ALTER COLUMN "storageKey" DROP NOT NULL;

-- Backfill Photo.mediaId from legacy url/storageKey
DO $$
DECLARE
  rec RECORD;
  new_media_id INTEGER;
BEGIN
  FOR rec IN
    SELECT p."id", p."url", p."storageKey", p."width", p."height", p."createdAt"
    FROM "Photo" p
    WHERE p."mediaId" IS NULL
    ORDER BY p."id"
  LOOP
    INSERT INTO "Media" (
      "type",
      "url",
      "storageKey",
      "width",
      "height",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      'IMAGE'::"MediaType",
      COALESCE(rec."url", ''),
      COALESCE(NULLIF(rec."storageKey", ''), 'legacy/photo/' || rec."id"::text),
      rec."width",
      rec."height",
      COALESCE(rec."createdAt", CURRENT_TIMESTAMP),
      CURRENT_TIMESTAMP
    )
    RETURNING "id" INTO new_media_id;

    UPDATE "Photo" SET "mediaId" = new_media_id WHERE "id" = rec."id";
  END LOOP;
END
$$;

-- Clear legacy URL/storage columns after successful backfill.
UPDATE "Photo" SET "url" = NULL, "storageKey" = NULL WHERE "mediaId" IS NOT NULL;
UPDATE "Video" SET "videoUrl" = NULL, "thumbnailUrl" = NULL
WHERE "mediaId" IS NOT NULL OR "thumbnailMediaId" IS NOT NULL;
UPDATE "Post" SET "coverImage" = NULL, "mediaUrl" = NULL WHERE "coverMediaId" IS NOT NULL;

-- Backfill Video.mediaId from legacy videoUrl
DO $$
DECLARE
  rec RECORD;
  new_media_id INTEGER;
BEGIN
  FOR rec IN
    SELECT v."id", v."videoUrl", v."createdAt"
    FROM "Video" v
    WHERE v."mediaId" IS NULL AND v."videoUrl" IS NOT NULL AND btrim(v."videoUrl") <> ''
    ORDER BY v."id"
  LOOP
    INSERT INTO "Media" (
      "type",
      "url",
      "storageKey",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      'VIDEO'::"MediaType",
      rec."videoUrl",
      'legacy/video/' || rec."id"::text,
      COALESCE(rec."createdAt", CURRENT_TIMESTAMP),
      CURRENT_TIMESTAMP
    )
    RETURNING "id" INTO new_media_id;

    UPDATE "Video" SET "mediaId" = new_media_id WHERE "id" = rec."id";
  END LOOP;
END
$$;

-- Backfill Video.thumbnailMediaId from legacy thumbnailUrl
DO $$
DECLARE
  rec RECORD;
  new_media_id INTEGER;
BEGIN
  FOR rec IN
    SELECT v."id", v."thumbnailUrl", v."createdAt"
    FROM "Video" v
    WHERE v."thumbnailMediaId" IS NULL AND v."thumbnailUrl" IS NOT NULL AND btrim(v."thumbnailUrl") <> ''
    ORDER BY v."id"
  LOOP
    INSERT INTO "Media" (
      "type",
      "url",
      "storageKey",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      'IMAGE'::"MediaType",
      rec."thumbnailUrl",
      'legacy/video-thumbnail/' || rec."id"::text,
      COALESCE(rec."createdAt", CURRENT_TIMESTAMP),
      CURRENT_TIMESTAMP
    )
    RETURNING "id" INTO new_media_id;

    UPDATE "Video" SET "thumbnailMediaId" = new_media_id WHERE "id" = rec."id";
  END LOOP;
END
$$;

-- Backfill Post.coverMediaId
-- Priority: coverImage, fallback: mediaUrl (for non-blog legacy posts).
DO $$
DECLARE
  rec RECORD;
  next_url TEXT;
  media_kind "MediaType";
  new_media_id INTEGER;
BEGIN
  FOR rec IN
    SELECT p."id", p."coverImage", p."mediaUrl", p."type", p."createdAt"
    FROM "Post" p
    WHERE p."coverMediaId" IS NULL
    ORDER BY p."id"
  LOOP
    next_url := NULL;
    media_kind := 'IMAGE'::"MediaType";

    IF rec."coverImage" IS NOT NULL AND btrim(rec."coverImage") <> '' THEN
      next_url := rec."coverImage";
      media_kind := 'IMAGE'::"MediaType";
    ELSIF rec."mediaUrl" IS NOT NULL AND btrim(rec."mediaUrl") <> '' THEN
      next_url := rec."mediaUrl";
      IF rec."type"::text = 'VIDEO' THEN
        media_kind := 'VIDEO'::"MediaType";
      ELSIF rec."type"::text = 'MUSIC' THEN
        media_kind := 'AUDIO'::"MediaType";
      ELSE
        media_kind := 'IMAGE'::"MediaType";
      END IF;
    END IF;

    IF next_url IS NULL THEN
      CONTINUE;
    END IF;

    INSERT INTO "Media" (
      "type",
      "url",
      "storageKey",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      media_kind,
      next_url,
      'legacy/post/' || rec."id"::text,
      COALESCE(rec."createdAt", CURRENT_TIMESTAMP),
      CURRENT_TIMESTAMP
    )
    RETURNING "id" INTO new_media_id;

    UPDATE "Post" SET "coverMediaId" = new_media_id WHERE "id" = rec."id";
  END LOOP;
END
$$;

-- Enforce Photo.mediaId after backfill
ALTER TABLE "Photo" ALTER COLUMN "mediaId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Photo_mediaId_idx" ON "Photo"("mediaId");
CREATE INDEX IF NOT EXISTS "Video_mediaId_idx" ON "Video"("mediaId");
CREATE INDEX IF NOT EXISTS "Video_thumbnailMediaId_idx" ON "Video"("thumbnailMediaId");
CREATE INDEX IF NOT EXISTS "Post_coverMediaId_idx" ON "Post"("coverMediaId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Photo_mediaId_fkey'
  ) THEN
    ALTER TABLE "Photo"
      ADD CONSTRAINT "Photo_mediaId_fkey"
      FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Video_mediaId_fkey'
  ) THEN
    ALTER TABLE "Video"
      ADD CONSTRAINT "Video_mediaId_fkey"
      FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Video_thumbnailMediaId_fkey'
  ) THEN
    ALTER TABLE "Video"
      ADD CONSTRAINT "Video_thumbnailMediaId_fkey"
      FOREIGN KEY ("thumbnailMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Post_coverMediaId_fkey'
  ) THEN
    ALTER TABLE "Post"
      ADD CONSTRAINT "Post_coverMediaId_fkey"
      FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;
