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

    const updatedParticipants = updateParticipantScore(
      participants,
      matches,
      teams,
    );

    await Promise.all(
      Object.values(updatedParticipants).map((p) => {
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

export function mapParticipants({
  participants,
  users,
}: {
  participants: {
    participantId: string;
    leagueId: string;
    playedMatches: number;
    winMatches: number;
    points: number;
    guest: boolean;
  }[];
  users: {
    id: string;
    email: string;
    name: string;
    password: string;
  }[];
}): Record<string, LeagueParticipant> {
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
export async function fetchLeagueParticipants(
  leagueId: string,
): Promise<Record<string, LeagueParticipant>> {
  const participants = await prisma.participates.findMany({
    where: { leagueId },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: participants.map((p) => p.participantId) } },
  });
  return mapParticipants({ participants, users });
}

export const updateParticipantScore = (
  participants: Record<string, LeagueParticipant>,
  matches: Match[],
  teams: Team[],
): Record<string, LeagueParticipant> => {
  matches.sort((a, b) => a.date.getTime() - b.date.getTime());
  const updatedParticipants = {} as Record<string, LeagueParticipant>;

  Object.values(participants).forEach((participant) => {
    updatedParticipants[participant.user.id] = {
      ...participant,
      score: {
        playedMatches: 0,
        winMatches: 0,
        points: 0,
      },
    };
  });

  const teamsMap = new Map<string, number>();
  // TODO: This constant should be configurable
  const K_MAX_MATCHES = 2;
  matches.forEach((match) => {
    if (match.official) {
      const winnerTeamId = match.localWins ? match.localId : match.visitorId;
      const looserTeamId = match.localWins ? match.visitorId : match.localId;
      if (winnerTeamId === undefined || looserTeamId === undefined) {
        throw new Error('Winner or looser team id is undefined');
      }
      const winnerTeam = teams.find((team) => team.id === winnerTeamId);
      const looserTeam = teams.find((team) => team.id === looserTeamId);
      if (winnerTeam && looserTeam) {
        teamsMap.set(winnerTeamId, (teamsMap.get(winnerTeamId) ?? 0) + 1);
        teamsMap.set(looserTeamId, (teamsMap.get(looserTeamId) ?? 0) + 1);
        // Winner team only scores if have played less than K_MAX_MATCHES as a team
        if ((teamsMap.get(winnerTeamId) ?? 0) <= K_MAX_MATCHES) {
          console.log('winnerTeam.driveId', winnerTeam.driveId);
          updatedParticipants[winnerTeam.driveId].score.points += 1;
          updatedParticipants[winnerTeam.reversId].score.points += 1;
        }
        updatedParticipants[winnerTeam.driveId].score.winMatches += 1;
        updatedParticipants[winnerTeam.reversId].score.winMatches += 1;
        updatedParticipants[winnerTeam.driveId].score.playedMatches += 1;
        updatedParticipants[winnerTeam.reversId].score.playedMatches += 1;

        updatedParticipants[looserTeam.driveId].score.points += 0;
        updatedParticipants[looserTeam.reversId].score.points += 0;
        updatedParticipants[looserTeam.driveId].score.winMatches += 0;
        updatedParticipants[looserTeam.reversId].score.winMatches += 0;
        updatedParticipants[looserTeam.driveId].score.playedMatches += 1;
        updatedParticipants[looserTeam.reversId].score.playedMatches += 1;
      } else {
        throw new Error('Something went wrong while calculating score.');
      }
    }
  });
  return updatedParticipants;
};
