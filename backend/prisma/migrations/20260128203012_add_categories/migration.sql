/*
  Warnings:

  - Added the required column `category` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextReminder` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "lastContacted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nextReminder" TIMESTAMP(3) NOT NULL;
