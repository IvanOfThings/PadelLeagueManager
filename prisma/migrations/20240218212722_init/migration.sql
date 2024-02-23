-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "official" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Participates" ADD COLUMN     "guest" BOOLEAN NOT NULL DEFAULT false;
