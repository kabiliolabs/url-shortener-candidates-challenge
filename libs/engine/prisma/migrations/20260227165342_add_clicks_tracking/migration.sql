-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShortenedUrl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ShortenedUrl" ("createdAt", "id", "originalUrl", "shortCode", "updatedAt") SELECT "createdAt", "id", "originalUrl", "shortCode", "updatedAt" FROM "ShortenedUrl";
DROP TABLE "ShortenedUrl";
ALTER TABLE "new_ShortenedUrl" RENAME TO "ShortenedUrl";
CREATE UNIQUE INDEX "ShortenedUrl_shortCode_key" ON "ShortenedUrl"("shortCode");
CREATE INDEX "ShortenedUrl_shortCode_idx" ON "ShortenedUrl"("shortCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
