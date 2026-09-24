-- CreateTable
CREATE TABLE "ShortUrl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_code_key" ON "ShortUrl"("code");

-- CreateIndex
CREATE INDEX "ShortUrl_createdAt_idx" ON "ShortUrl"("createdAt");
