-- CreateTable
CREATE TABLE "public"."Province" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."District" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "provinceId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ward" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "districtId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Province_deletedAt_idx" ON "public"."Province"("deletedAt");

-- CreateIndex
CREATE INDEX "District_deletedAt_idx" ON "public"."District"("deletedAt");

-- CreateIndex
CREATE INDEX "Ward_deletedAt_idx" ON "public"."Ward"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."Province" ADD CONSTRAINT "Province_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Province" ADD CONSTRAINT "Province_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Province" ADD CONSTRAINT "Province_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "public"."Province"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."District" ADD CONSTRAINT "District_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."District" ADD CONSTRAINT "District_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."District" ADD CONSTRAINT "District_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "public"."District"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "Province_name_unique"
ON "public"."Province" (name)
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Province_code_unique"
ON "public"."Province" (code)
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "District_code_unique"
ON "public"."District" (code)
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Ward_code_unique"
ON "public"."Ward" (code)
WHERE "deletedAt" IS NULL;
