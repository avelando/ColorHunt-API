/*
  Warnings:

  - You are about to drop the column `originImageUrl` on the `Color` table. All the data in the column will be lost.
  - Added the required column `photoId` to the `Color` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Color" DROP COLUMN "originImageUrl",
ADD COLUMN     "photoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Color" ADD CONSTRAINT "Color_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
