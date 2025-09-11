/*
  Warnings:

  - You are about to drop the column `districtId` on the `Ward` table. All the data in the column will be lost.
  - You are about to drop the `District` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `provinceId` to the `Ward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."District" DROP CONSTRAINT "District_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."District" DROP CONSTRAINT "District_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."District" DROP CONSTRAINT "District_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."District" DROP CONSTRAINT "District_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ward" DROP CONSTRAINT "Ward_districtId_fkey";

-- AlterTable
ALTER TABLE "public"."Ward" DROP COLUMN "districtId",
ADD COLUMN     "provinceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."District";

-- AddForeignKey
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "public"."Province"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
