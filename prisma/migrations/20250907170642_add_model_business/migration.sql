/*
  Warnings:

  - You are about to drop the column `deviceId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BusinessVerificationType" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterEnum
ALTER TYPE "public"."UserStatus" ADD VALUE 'INACTIVE';

-- AlterEnum
ALTER TYPE "public"."VerificationCodeType" ADD VALUE 'WITHDRAW_MONEY';

-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_deviceId_fkey";

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "deviceId";

-- DropTable
DROP TABLE "public"."Device";

-- DropEnum
DROP TYPE "public"."OwnerVerificationStatus";

-- CreateTable
CREATE TABLE "public"."Business" (
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "license" VARCHAR(500) NOT NULL,
    "bankName" VARCHAR(500) NOT NULL,
    "bankNumber" VARCHAR(500) NOT NULL,
    "verified" "public"."BusinessVerificationType" NOT NULL DEFAULT 'PENDING',
    "approvedById" INTEGER,
    "rejectReason" VARCHAR(1000),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_userId_key" ON "public"."Business"("userId");

-- CreateIndex
CREATE INDEX "Business_deletedAt_idx" ON "public"."Business"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "Business_name_unique"
ON "public"."Business" (name)
WHERE "deletedAt" IS NULL;
