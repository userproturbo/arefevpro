-- AlterTable
ALTER TABLE "User"
ADD COLUMN "lastSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Visit"
ADD COLUMN "path" TEXT,
ADD COLUMN "userId" INTEGER;

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");

-- CreateIndex
CREATE INDEX "Visit_userId_idx" ON "Visit"("userId");

-- CreateIndex
CREATE INDEX "Visit_userId_createdAt_idx" ON "Visit"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Visit"
ADD CONSTRAINT "Visit_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
