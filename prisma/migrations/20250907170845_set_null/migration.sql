-- AlterTable
ALTER TABLE "public"."Business" ALTER COLUMN "license" DROP NOT NULL,
ALTER COLUMN "bankName" DROP NOT NULL,
ALTER COLUMN "bankNumber" DROP NOT NULL;
