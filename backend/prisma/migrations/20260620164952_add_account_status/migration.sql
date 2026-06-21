/*
  Warnings:

  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('UNCLAIMED', 'PENDING_VERIFICATION', 'ACTIVE', 'REJECTED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified",
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
ALTER COLUMN "password" DROP NOT NULL;
