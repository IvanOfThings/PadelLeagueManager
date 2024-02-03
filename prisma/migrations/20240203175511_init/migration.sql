/*
  Warnings:

  - Added the required column `localTieBreak` to the `Set` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitorTieBreak` to the `Set` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "localTieBreak" INTEGER NOT NULL,
ADD COLUMN     "visitorTieBreak" INTEGER NOT NULL;
