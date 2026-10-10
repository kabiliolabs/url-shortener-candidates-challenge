-- CreateTable
CREATE TABLE "short_links" (
    "code" VARCHAR(16) NOT NULL,
    "destination" VARCHAR(2048) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" BIGSERIAL NOT NULL,
    "short_code" VARCHAR(16) NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "short_links_created_at_idx" ON "short_links"("created_at");

-- CreateIndex
CREATE INDEX "clicks_short_code_idx" ON "clicks"("short_code");

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_short_code_fkey" FOREIGN KEY ("short_code") REFERENCES "short_links"("code") ON DELETE CASCADE ON UPDATE CASCADE;
