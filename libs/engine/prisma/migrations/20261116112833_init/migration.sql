-- CreateTable
CREATE TABLE "short_urls" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "short_urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "short_urls_code_key" ON "short_urls"("code");
