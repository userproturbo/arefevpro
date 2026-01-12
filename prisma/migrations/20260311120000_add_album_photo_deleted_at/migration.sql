-- AlterTable
ALTER TABLE "Album" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "deletedAt" TIMESTAMP(3);
