/*
  Warnings:

  - You are about to drop the `Business` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."VenueOwnerVerificationType" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."CourtStatus" AS ENUM ('INACTIVE', 'ACTIVE');

-- DropForeignKey
ALTER TABLE "public"."Business" DROP CONSTRAINT "Business_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Business" DROP CONSTRAINT "Business_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Business" DROP CONSTRAINT "Business_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Business" DROP CONSTRAINT "Business_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Business" DROP CONSTRAINT "Business_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Sport" ADD COLUMN     "venueOwnerId" INTEGER;

-- DropTable
DROP TABLE "public"."Business";

-- DropEnum
DROP TYPE "public"."BusinessVerificationType";

-- CreateTable
CREATE TABLE "public"."VenueOwner" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "license" VARCHAR(500),
    "bankName" VARCHAR(500),
    "bankNumber" VARCHAR(500),
    "address" VARCHAR(1000),
    "provinceId" INTEGER,
    "wardId" INTEGER,
    "verified" "public"."VenueOwnerVerificationType" NOT NULL DEFAULT 'PENDING',
    "approvedById" INTEGER,
    "rejectReason" VARCHAR(1000),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Court" (
    "id" SERIAL NOT NULL,
    "venueOwnerId" INTEGER NOT NULL,
    "sportId" INTEGER NOT NULL,
    "name" VARCHAR(500),
    "description" VARCHAR(1000),
    "capacity" INTEGER DEFAULT 0,
    "surface" VARCHAR(500),
    "indoor" BOOLEAN DEFAULT false,
    "status" "public"."CourtStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Amenity" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "description" VARCHAR(1000),
    "imageUrl" VARCHAR(1000),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourtAmenity" (
    "id" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "amenityId" INTEGER NOT NULL,

    CONSTRAINT "CourtAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VenueImage" (
    "id" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenueOwner_userId_key" ON "public"."VenueOwner"("userId");

-- CreateIndex
CREATE INDEX "VenueOwner_deletedAt_idx" ON "public"."VenueOwner"("deletedAt");

-- CreateIndex
CREATE INDEX "Court_deletedAt_idx" ON "public"."Court"("deletedAt");

-- CreateIndex
CREATE INDEX "Amenity_deletedAt_idx" ON "public"."Amenity"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourtAmenity_courtId_amenityId_key" ON "public"."CourtAmenity"("courtId", "amenityId");

-- CreateIndex
CREATE INDEX "VenueImage_deletedAt_idx" ON "public"."VenueImage"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."Sport" ADD CONSTRAINT "Sport_venueOwnerId_fkey" FOREIGN KEY ("venueOwnerId") REFERENCES "public"."VenueOwner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VenueOwner" ADD CONSTRAINT "VenueOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."VenueOwner" ADD CONSTRAINT "VenueOwner_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."VenueOwner" ADD CONSTRAINT "VenueOwner_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."VenueOwner" ADD CONSTRAINT "VenueOwner_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."VenueOwner" ADD CONSTRAINT "VenueOwner_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_venueOwnerId_fkey" FOREIGN KEY ("venueOwnerId") REFERENCES "public"."VenueOwner"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "public"."Sport"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Amenity" ADD CONSTRAINT "Amenity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Amenity" ADD CONSTRAINT "Amenity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Amenity" ADD CONSTRAINT "Amenity_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CourtAmenity" ADD CONSTRAINT "CourtAmenity_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourtAmenity" ADD CONSTRAINT "CourtAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "public"."Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VenueImage" ADD CONSTRAINT "VenueImage_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VenueImage" ADD CONSTRAINT "VenueImage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."VenueImage" ADD CONSTRAINT "VenueImage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."VenueImage" ADD CONSTRAINT "VenueImage_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
