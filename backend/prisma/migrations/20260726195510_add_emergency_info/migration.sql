-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "chronicConditions" TEXT,
ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "emergencyUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "medications" TEXT,
ADD COLUMN     "organDonor" BOOLEAN NOT NULL DEFAULT false;
