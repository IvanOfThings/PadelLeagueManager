/*
  Warnings:

  - A unique constraint covering the columns `[matchId,setNumber]` on the table `Set` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Set_matchId_setNumber_key" ON "Set"("matchId", "setNumber");
