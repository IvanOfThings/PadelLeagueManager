/*
  Warnings:

  - The primary key for the `League` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Participates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Set` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[adminId,name]` on the table `League` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `League` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "League" DROP CONSTRAINT "League_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_localId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_visitorId_fkey";

-- DropForeignKey
ALTER TABLE "Participates" DROP CONSTRAINT "Participates_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "Participates" DROP CONSTRAINT "Participates_participantId_fkey";

-- DropForeignKey
ALTER TABLE "Set" DROP CONSTRAINT "Set_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_driveId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_reversId_fkey";

-- AlterTable
ALTER TABLE "League" DROP CONSTRAINT "League_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "adminId" SET DATA TYPE TEXT,
ADD CONSTRAINT "League_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "League_id_seq";

-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "localId" SET DATA TYPE TEXT,
ALTER COLUMN "visitorId" SET DATA TYPE TEXT,
ALTER COLUMN "leagueId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Match_id_seq";

-- AlterTable
ALTER TABLE "Participates" DROP CONSTRAINT "Participates_pkey",
ALTER COLUMN "participantId" SET DATA TYPE TEXT,
ALTER COLUMN "leagueId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Participates_pkey" PRIMARY KEY ("participantId", "leagueId");

-- AlterTable
ALTER TABLE "Set" DROP CONSTRAINT "Set_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "matchId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Set_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Set_id_seq";

-- AlterTable
ALTER TABLE "Team" DROP CONSTRAINT "Team_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "driveId" SET DATA TYPE TEXT,
ALTER COLUMN "reversId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Team_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "League_adminId_name_key" ON "League"("adminId", "name");

-- AddForeignKey
ALTER TABLE "Participates" ADD CONSTRAINT "Participates_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participates" ADD CONSTRAINT "Participates_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_reversId_fkey" FOREIGN KEY ("reversId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
