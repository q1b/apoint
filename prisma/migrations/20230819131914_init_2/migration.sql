/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_userId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Osteopath" ADD COLUMN     "year" INT4 NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "access_token" STRING;
ALTER TABLE "Session" ADD COLUMN     "refresh_token" STRING;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified";

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
