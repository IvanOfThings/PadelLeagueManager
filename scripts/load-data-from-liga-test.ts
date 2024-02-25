import { PrismaClient, User } from '@prisma/client';
import { users, leagues, teams, matches } from './testing-league';
import bcrypt from 'bcrypt';
import { UpdateScores } from '@/app/lib/dao/lueague';

const prisma = new PrismaClient();
// use `prisma` in your application to read and write data in your DB

(async () => {
  await prisma.match.deleteMany({
    where: { id: { in: [...matches.map((u) => u.id)] } },
  });
  await prisma.team.deleteMany({
    where: { id: { in: [...teams.map((u) => u.id)] } },
  });
  await prisma.participates.deleteMany({
    where: { participantId: { in: [...users.map((u) => u.id)] } },
  });
  await prisma.league.deleteMany({
    where: { id: { in: [...leagues.map((u) => u.id)] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [...users.map((u) => u.id)] } },
  });

  await prisma.user.createMany({
    data: await Promise.all([
      ...[...users].map(async (u: User): Promise<User> => {
        return { ...u, password: await bcrypt.hash(u.password, 10) };
      }),
    ]),
  });
  await prisma.league.create({ data: leagues[0] });
  await prisma.participates.createMany({
    data: users.map((u) => ({
      participantId: u.id,
      leagueId: leagues[0].id,
      guest: false,
    })),
  });
  await prisma.team.createMany({ data: teams });
  await prisma.match.createMany({ data: matches });
  await UpdateScores(leagues[0].id);
})();
