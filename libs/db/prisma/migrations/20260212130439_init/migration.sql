-- CreateTable
CREATE TABLE "shortened_urls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortenedUrlId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "referer" TEXT,
    CONSTRAINT "clicks_shortenedUrlId_fkey" FOREIGN KEY ("shortenedUrlId") REFERENCES "shortened_urls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "shortened_urls_shortCode_key" ON "shortened_urls"("shortCode");

-- CreateIndex
CREATE INDEX "shortened_urls_shortCode_idx" ON "shortened_urls"("shortCode");

-- CreateIndex
CREATE INDEX "clicks_shortenedUrlId_idx" ON "clicks"("shortenedUrlId");

-- CreateIndex
CREATE INDEX "clicks_timestamp_idx" ON "clicks"("timestamp");
