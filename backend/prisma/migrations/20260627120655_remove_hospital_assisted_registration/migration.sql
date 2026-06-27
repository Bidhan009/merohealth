/*
  Warnings:

  - The values [UNCLAIMED] on the enum `AccountStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `registeredByHospitalId` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountStatus_new" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'REJECTED');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "AccountStatus_new" USING ("status"::text::"AccountStatus_new");
ALTER TYPE "AccountStatus" RENAME TO "AccountStatus_old";
ALTER TYPE "AccountStatus_new" RENAME TO "AccountStatus";
DROP TYPE "public"."AccountStatus_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';
COMMIT;

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_registeredByHospitalId_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "registeredByHospitalId";
