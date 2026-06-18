/*
  Warnings:

  - You are about to drop the column `clicks` on the `Url` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "Url" DROP COLUMN "clicks",
ADD COLUMN     "shortenCount" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";
