import { Match, Team } from '@prisma/client';
import { LeagueParticipant } from '../definitions';
import prisma from '../prisma';
import { fetchTeamsFromMatches } from './teams';

export async function UpdateScores(leagueId: string): Promise<void> {
  try {
    const participants = await fetchLeagueParticipants(leagueId);

    const matches = await prisma.match.findMany({
      where: { leagueId, confirmed: true },
    });

    if (!matches) {
      throw new Error('Failed to update Scores.');
    }

    const teams = await fetchTeamsFromMatches(matches);

    updateParticipantScore(participants, matches, teams);

    await Promise.all(
      Object.values(participants).map((p) => {
        return prisma.participates.update({
          data: { ...p.score },
          where: {
            participantId_leagueId: {
              participantId: p.user.id,
              leagueId: p.leagueId,
            },
          },
        });
      }),
    );
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchLeagueParticipants(
  leagueId: string,
): Promise<Record<string, LeagueParticipant>> {
  const participants = await prisma.participates.findMany({
    where: { leagueId },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: participants.map((p) => p.participantId) } },
  });
  const leagueParticipants = participants.reduce(
    (acc, curr): Record<string, LeagueParticipant> => {
      const user = users.find((u) => u.id === curr.participantId);
      if (user) {
        acc[curr.participantId] = {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          leagueId: curr.leagueId,
          score: {
            playedMatches: curr.playedMatches,
            winMatches: curr.winMatches,
            points: curr.points,
          },
        };
      }
      return acc;
    },
    {} as Record<string, LeagueParticipant>,
  );
  return leagueParticipants;
}

function updateParticipantScore(
  participants: Record<string, LeagueParticipant>,
  matches: Match[],
  teams: Team[],
) {
  matches.forEach((match) => {
    const winnerTeamId = match.localWins ? match.localId : match.visitorId;
    const looserTeamId = match.localWins ? match.visitorId : match.localId;
    const winnerTeam = teams.find((team) => team.id === winnerTeamId);
    const looserTeam = teams.find((team) => team.id === looserTeamId);
    if (winnerTeam && looserTeam) {
      participants[winnerTeam?.driveId].score.points += 1;
      participants[winnerTeam?.reversId].score.points += 1;
      participants[winnerTeam?.driveId].score.winMatches += 1;
      participants[winnerTeam?.reversId].score.winMatches += 1;
      participants[winnerTeam?.driveId].score.playedMatches += 1;
      participants[winnerTeam?.reversId].score.playedMatches += 1;

      participants[looserTeam?.driveId].score.points += 0;
      participants[looserTeam?.reversId].score.points += 0;
      participants[looserTeam?.driveId].score.winMatches += 0;
      participants[looserTeam?.reversId].score.winMatches += 0;
      participants[looserTeam?.driveId].score.playedMatches += 1;
      participants[looserTeam?.reversId].score.playedMatches += 1;
    } else {
      throw new Error('Something went wrong while calculating score.');
    }
  });
}
