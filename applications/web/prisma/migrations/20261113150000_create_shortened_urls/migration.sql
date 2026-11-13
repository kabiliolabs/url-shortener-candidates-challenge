CREATE TABLE "shortened_urls" (
    "code" VARCHAR(8) NOT NULL,
    "original_url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "click_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shortened_urls_pkey" PRIMARY KEY ("code")
);

CREATE UNIQUE INDEX "shortened_urls_original_url_key" ON "shortened_urls"("original_url");
