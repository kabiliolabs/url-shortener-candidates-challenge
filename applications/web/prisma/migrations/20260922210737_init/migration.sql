-- CreateTable
CREATE TABLE "short_urls" (
    "short_code" VARCHAR(16) NOT NULL,
    "original_url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_clicked_at" TIMESTAMPTZ(3),

    CONSTRAINT "short_urls_pkey" PRIMARY KEY ("short_code")
);

-- CreateIndex
CREATE INDEX "short_urls_created_at_idx" ON "short_urls"("created_at");
