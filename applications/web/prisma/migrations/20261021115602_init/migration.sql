-- CreateTable
CREATE TABLE "ShortenedUrl" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisitedAt" TIMESTAMP(3),

    CONSTRAINT "ShortenedUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortenedUrl_code_key" ON "ShortenedUrl"("code");

-- CreateIndex
CREATE INDEX "ShortenedUrl_destination_idx" ON "ShortenedUrl"("destination");

-- CreateIndex
CREATE INDEX "ShortenedUrl_createdAt_idx" ON "ShortenedUrl"("createdAt");
