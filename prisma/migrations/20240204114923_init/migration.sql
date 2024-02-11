-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "localWins" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Participates" ADD COLUMN     "playedMatches" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winMatches" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Set" ALTER COLUMN "localWins" SET DEFAULT true;
