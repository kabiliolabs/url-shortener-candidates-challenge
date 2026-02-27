-- CreateTable
CREATE TABLE "ShortenedUrl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortenedUrl_shortCode_key" ON "ShortenedUrl"("shortCode");

-- CreateIndex
CREATE INDEX "ShortenedUrl_shortCode_idx" ON "ShortenedUrl"("shortCode");
