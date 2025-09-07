-- CreateEnum
CREATE TYPE "public"."SportStatus" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "public"."SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL');

-- AlterTable
ALTER TABLE "public"."Business" ALTER COLUMN "license" DROP NOT NULL,
ALTER COLUMN "bankName" DROP NOT NULL,
ALTER COLUMN "bankNumber" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Sport" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "description" VARCHAR(1000),
    "iconUrl" VARCHAR(1000),
    "status" "public"."SportStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SportProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sportId" INTEGER NOT NULL,
    "skillLevel" "public"."SkillLevel" NOT NULL,

    CONSTRAINT "SportProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sport_deletedAt_idx" ON "public"."Sport"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SportProfile_userId_sportId_key" ON "public"."SportProfile"("userId", "sportId");

-- AddForeignKey
ALTER TABLE "public"."Sport" ADD CONSTRAINT "Sport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Sport" ADD CONSTRAINT "Sport_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Sport" ADD CONSTRAINT "Sport_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SportProfile" ADD CONSTRAINT "SportProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SportProfile" ADD CONSTRAINT "SportProfile_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "public"."Sport"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "Sport_name_unique"
ON "public"."Sport" (name)
WHERE "deletedAt" IS NULL;
