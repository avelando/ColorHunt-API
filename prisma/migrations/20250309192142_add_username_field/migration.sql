/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Color` table. All the data in the column will be lost.
  - You are about to drop the column `photoId` on the `Color` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Color` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Photo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originImageUrl` to the `Color` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paletteId` to the `Color` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Color" DROP CONSTRAINT "Color_photoId_fkey";

-- AlterTable
ALTER TABLE "Color" DROP COLUMN "isPublic",
DROP COLUMN "photoId",
DROP COLUMN "title",
ADD COLUMN     "originImageUrl" TEXT NOT NULL,
ADD COLUMN     "paletteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "isPublic",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Palette" (
    "id" SERIAL NOT NULL,
    "photoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Palette_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Palette_photoId_key" ON "Palette"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Palette" ADD CONSTRAINT "Palette_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Palette" ADD CONSTRAINT "Palette_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Color" ADD CONSTRAINT "Color_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "Palette"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
