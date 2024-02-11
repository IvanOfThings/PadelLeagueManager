-- DropIndex
DROP INDEX "Team_reversId_driveId_key";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "round" INTEGER NOT NULL DEFAULT 1;
