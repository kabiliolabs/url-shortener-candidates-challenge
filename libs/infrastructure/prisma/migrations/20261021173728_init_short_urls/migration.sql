-- CreateTable
CREATE TABLE "short_urls" (
    "code" VARCHAR(7) NOT NULL,
    "original_url" VARCHAR(2048) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_clicked_at" TIMESTAMP(3),

    CONSTRAINT "short_urls_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "short_urls_created_at_idx" ON "short_urls"("created_at" DESC);
