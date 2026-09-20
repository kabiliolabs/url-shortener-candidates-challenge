-- CreateTable
CREATE TABLE "RandomData" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RandomData_pkey" PRIMARY KEY ("id")
);
