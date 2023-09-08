/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Key` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "eventId" STRING;

-- AlterTable
ALTER TABLE "Osteopath" ADD COLUMN     "calendarId" STRING;

-- CreateIndex
CREATE UNIQUE INDEX "Key_user_id_key" ON "Key"("user_id");
