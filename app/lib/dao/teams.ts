import { Team } from '@prisma/client';
import prisma from '../prisma';

export async function fetchTeamsFromMatches(
  matches: {
    visitorId: string;
    localId: string;
  }[],
): Promise<Team[]> {
  const teamsThatPlayed = matches.reduce((acc, curr) => {
    acc.push(curr.localId);
    acc.push(curr.visitorId);
    return acc;
  }, [] as Array<string>);

  const teams = await prisma.team.findMany({
    where: { id: { in: teamsThatPlayed } },
  });
  return teams;
}
