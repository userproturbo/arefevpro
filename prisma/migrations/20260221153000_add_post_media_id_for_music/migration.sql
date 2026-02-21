-- Stage 1.1: Add Post.mediaId for unified main media (MUSIC)

ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "mediaId" INTEGER;

CREATE INDEX IF NOT EXISTS "Post_mediaId_idx" ON "Post"("mediaId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Post_mediaId_fkey'
  ) THEN
    ALTER TABLE "Post"
      ADD CONSTRAINT "Post_mediaId_fkey"
      FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- 1) Reuse already migrated coverMedia for legacy MUSIC rows when possible.
UPDATE "Post" p
SET "mediaId" = p."coverMediaId"
WHERE p."type" = 'MUSIC'
  AND p."mediaId" IS NULL
  AND p."coverMediaId" IS NOT NULL;

-- 2) Backfill from legacy mediaUrl for remaining MUSIC rows.
DO $$
DECLARE
  rec RECORD;
  new_media_id INTEGER;
BEGIN
  FOR rec IN
    SELECT p."id", p."mediaUrl", p."createdAt"
    FROM "Post" p
    WHERE p."type" = 'MUSIC'
      AND p."mediaId" IS NULL
      AND p."mediaUrl" IS NOT NULL
      AND btrim(p."mediaUrl") <> ''
    ORDER BY p."id"
  LOOP
    INSERT INTO "Media" (
      "type",
      "url",
      "storageKey",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      'AUDIO'::"MediaType",
      rec."mediaUrl",
      'legacy/post-audio/' || rec."id"::text,
      COALESCE(rec."createdAt", CURRENT_TIMESTAMP),
      CURRENT_TIMESTAMP
    )
    RETURNING "id" INTO new_media_id;

    UPDATE "Post" SET "mediaId" = new_media_id WHERE "id" = rec."id";
  END LOOP;
END
$$;

-- Legacy cleanup after successful mapping.
UPDATE "Post"
SET "mediaUrl" = NULL
WHERE "type" = 'MUSIC' AND "mediaId" IS NOT NULL;
