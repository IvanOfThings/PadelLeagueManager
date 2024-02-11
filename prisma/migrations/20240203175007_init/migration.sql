/*
  Warnings:

  - Added the required column `localWins` to the `Set` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setNumber` to the `Set` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "localWins" BOOLEAN NOT NULL,
ADD COLUMN     "setNumber" INTEGER NOT NULL;
