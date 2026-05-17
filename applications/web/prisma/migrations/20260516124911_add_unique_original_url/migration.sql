-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShortenedUrl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL
);
INSERT INTO "new_ShortenedUrl" ("clicks", "createdAt", "id", "originalUrl", "shortCode") SELECT "clicks", "createdAt", "id", "originalUrl", "shortCode" FROM "ShortenedUrl";
DROP TABLE "ShortenedUrl";
ALTER TABLE "new_ShortenedUrl" RENAME TO "ShortenedUrl";
CREATE UNIQUE INDEX "ShortenedUrl_shortCode_key" ON "ShortenedUrl"("shortCode");
CREATE UNIQUE INDEX "ShortenedUrl_originalUrl_key" ON "ShortenedUrl"("originalUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
