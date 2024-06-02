import { Match, Team } from '@prisma/client';
import { LeagueParticipant } from '../definitions';
import prisma from '../prisma';
import { fetchTeamsFromMatches } from './teams';
import { unstable_noStore as noStore } from 'next/cache';
import { getTeamChecksum } from '../utils';

export async function UpdateScores(leagueId: string): Promise<void> {
  noStore();
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
        try {
          const prm = prisma.participates.update({
            data: { ...p.score },
            where: {
              participantId_leagueId: {
                participantId: p.user.id,
                leagueId: p.leagueId,
              },
            },
          });
          return prm;
        } catch (e) {
          console.log('Error updating participant score');
          console.log('Participant: ', JSON.stringify(p));
          console.log(e);
        }
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
    playedOfficialMatches: number;
    winMatches: number;
    winOfficialMatches: number;
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
            playedOfficialMatches: curr.playedOfficialMatches,
            winOfficialMatches: curr.winOfficialMatches,
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
  onlyOfficial = false,
): Promise<Record<string, LeagueParticipant>> {
  noStore();
  const participants = await prisma.participates.findMany({
    where: onlyOfficial ? { leagueId, guest: false } : { leagueId },
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
  noStore();
  matches.sort((a, b) => a.date.getTime() - b.date.getTime());
  const updatedParticipants = {} as Record<string, LeagueParticipant>;

  Object.values(participants).forEach((participant) => {
    updatedParticipants[participant.user.id] = {
      ...participant,
      score: {
        playedMatches: 0,
        playedOfficialMatches: 0,
        winMatches: 0,
        winOfficialMatches: 0,
        points: 0,
      },
    };
  });

  const teamsMap = new Map<string, number>();
  matches.forEach((match) => {
    const winnerTeamId = match.localWins ? match.localId : match.visitorId;
    const looserTeamId = match.localWins ? match.visitorId : match.localId;
    if (winnerTeamId === undefined || looserTeamId === undefined) {
      throw new Error('Winner or looser team id is undefined');
    }
    const winnerTeam = teams.find((team) => team.id === winnerTeamId);
    const looserTeam = teams.find((team) => team.id === looserTeamId);
    if (winnerTeam && looserTeam) {
      const winnerChecksum = getTeamChecksum(winnerTeam);
      const looserChecksum = getTeamChecksum(looserTeam);
      teamsMap.set(winnerChecksum, (teamsMap.get(winnerChecksum) ?? 0) + 1);
      teamsMap.set(looserChecksum, (teamsMap.get(looserChecksum) ?? 0) + 1);
      try {
        if (match.official) {
          updateOfficialScore(
            updatedParticipants,
            winnerTeam,
            looserTeam,
            teamsMap.get(winnerChecksum) ?? 0,
          );
        }
        updatedParticipants[winnerTeam.driveId].score.winMatches += 1;
        updatedParticipants[winnerTeam.reversId].score.winMatches += 1;
        updatedParticipants[winnerTeam.driveId].score.playedMatches += 1;
        updatedParticipants[winnerTeam.reversId].score.playedMatches += 1;

        updatedParticipants[looserTeam.driveId].score.winMatches += 0;
        updatedParticipants[looserTeam.reversId].score.winMatches += 0;
        updatedParticipants[looserTeam.driveId].score.playedMatches += 1;
        updatedParticipants[looserTeam.reversId].score.playedMatches += 1;
      } catch (e) {
        console.log('Error updating participant score');
        console.log('Match: ', JSON.stringify(match));
        console.log('Winner Team: ', JSON.stringify(winnerTeam));
        console.log(
          'Winner Team reverse: ',
          JSON.stringify(updatedParticipants[winnerTeam.driveId]),
        );
        console.log(
          'Looser Team reverse: ',
          JSON.stringify(updatedParticipants[winnerTeam.driveId]),
        );
        console.log('Looser Team: ', JSON.stringify(looserTeam));
        console.log(
          'Winner Team reverse: ',
          JSON.stringify(updatedParticipants[looserTeam.driveId]),
        );
        console.log(
          'Looser Team reverse: ',
          JSON.stringify(updatedParticipants[looserTeam.driveId]),
        );
      }
    } else {
      throw new Error('Something went wrong while calculating score.');
    }
  });
  return updatedParticipants;
};

const updateOfficialScore = (
  updatedParticipants: Record<string, LeagueParticipant>,
  winnerTeam: {
    id: string;
    driveId: string;
    reversId: string;
  },
  looserTeam: {
    id: string;
    driveId: string;
    reversId: string;
  },
  playedMatchesByTeam: number,
): void => {
  // TODO: This constant should be configurable
  const K_MAX_MATCHES = 2;
  // Winner team only scores if have played less than K_MAX_MATCHES as a team
  if (playedMatchesByTeam <= K_MAX_MATCHES) {
    updatedParticipants[winnerTeam.driveId].score.points += 1;
    updatedParticipants[winnerTeam.reversId].score.points += 1;
  }
  updatedParticipants[looserTeam.driveId].score.points += 0;
  updatedParticipants[looserTeam.reversId].score.points += 0;
  updatedParticipants[winnerTeam.driveId].score.winOfficialMatches += 1;
  updatedParticipants[winnerTeam.reversId].score.winOfficialMatches += 1;
  updatedParticipants[winnerTeam.driveId].score.playedOfficialMatches += 1;
  updatedParticipants[winnerTeam.reversId].score.playedOfficialMatches += 1;

  updatedParticipants[looserTeam.driveId].score.winOfficialMatches += 0;
  updatedParticipants[looserTeam.reversId].score.winOfficialMatches += 0;
  updatedParticipants[looserTeam.driveId].score.playedOfficialMatches += 1;
  updatedParticipants[looserTeam.reversId].score.playedOfficialMatches += 1;
};
