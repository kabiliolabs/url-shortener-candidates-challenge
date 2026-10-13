CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "shortUrlId" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ClickEvent_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "ShortUrl" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ClickEvent_shortUrlId_clickedAt_idx" ON "ClickEvent"("shortUrlId", "clickedAt");
