/*
  Warnings:

  - You are about to drop the column `deviceId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_deviceId_fkey";

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "deviceId";

-- DropTable
DROP TABLE "public"."Device";
