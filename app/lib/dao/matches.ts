import { Prisma, Match as PrismaMatch } from '@prisma/client';
import { Team, User, Set } from '../definitions';
import { Match } from '../definitions';
import prisma from '../prisma';
import { fetchTeamsFromMatches } from './teams';
import { fetchUsers } from '../data';
import { machine } from 'os';

const getTeamId = (team: Omit<Team, 'id'>) =>
  `${team.drive.id}.${team.reverse.id}`;

export const DeleteMatch = async ({ matchId }: { matchId: string }) => {
  await prisma.match.delete({
    where: { id: matchId },
  });
};

export const addResults = async (match: Match, results: Set[]) => {
  const r = await Promise.all(
    results.map(async (res) => {
      await prisma.set.create({ data: res });
    }),
  );

  const localWinsSets = results.filter((result) => result.localWins).length;
  const visitorWinsSets = results.filter((result) => !result.localWins).length;
  const localWins = localWinsSets > visitorWinsSets;
  await prisma.match.update({
    where: { id: match.id },
    data: { localWins, finished: true },
  });
  return { message: '' };
};

export const ConfirmMatch = async (
  match: Match,
  teams: {
    local: { driveId: string; reversId: string };
    visitor: { driveId: string; reversId: string };
  },
) => {
  const tempLocalTeam = match.teamLocal;
  if (teams.local.reversId === tempLocalTeam.drive.id) {
    const auxTeam = tempLocalTeam.drive;
    tempLocalTeam.drive = tempLocalTeam.reverse;
    tempLocalTeam.reverse = auxTeam;
  }
  const tempVisitorTeam = match.teamVisitor;
  if (teams.visitor.reversId === tempVisitorTeam.drive.id) {
    const auxTeam = tempVisitorTeam.drive;
    tempVisitorTeam.drive = tempVisitorTeam.reverse;
    tempVisitorTeam.reverse = auxTeam;
  }
  const localTeam = await findOrCreateTeam({ ...tempLocalTeam, id: null });
  const visitorTeam = await findOrCreateTeam({ ...tempVisitorTeam, id: null });
  if (!localTeam.id || !visitorTeam.id) {
    throw new Error('Failed to create teams');
  }
  await prisma.match.update({
    where: { id: match.id },
    data: {
      confirmed: true,
      localId: localTeam.id,
      visitorId: visitorTeam.id,
    },
  });
};

export const createMatches = async (matches: Match[][]) => {
  const teams = matches
    .map((m) =>
      m.map((m) => [
        [m.teamLocal.drive, m.teamLocal.reverse],
        [m.teamVisitor.drive, m.teamVisitor.reverse],
      ]),
    )
    .flat()
    .flat();
  const teamsMap = await retrieveOrCreateTeams(teams);
  console.log('teamsMap', teamsMap);
  const matchesArray = matches.flat();
  const mapInput = matchesArray.map((match): Prisma.MatchCreateManyInput => {
    const localId = teamsMap.get(getTeamId(match.teamLocal))?.id;
    const visitorId = teamsMap.get(getTeamId(match.teamVisitor))?.id;
    if (!localId || !visitorId) {
      throw new Error('Team not found');
    }

    return {
      id: match.id,
      date: match.date,
      leagueId: match.leagueId,
      localWins: match.localWins,
      localId,
      visitorId,
      finished: match.finished,
      confirmed: match.confirmed,
      round: match.round,
    };
  });
  await prisma.match.createMany({ data: mapInput });
};

const findOrCreateTeam = async (team: Team): Promise<Team> => {
  const teamRecord = await prisma.team.findMany({
    where: { reversId: team.reverse.id, driveId: team.drive.id },
  });
  if (!team.id) {
    if (teamRecord.length > 0) {
      console.log('teamRecord.id', teamRecord[0].id);
      team.id = teamRecord[0].id;
    } else {
      const newTeam = await prisma.team.create({
        data: { driveId: team.drive.id, reversId: team.reverse.id },
      });
      team.id = newTeam.id;
      console.log('newTeam.id', newTeam.id);
    }
  }
  return team;
};

const retrieveOrCreateTeams = async (
  teams: User[][],
): Promise<Map<string, Team>> => {
  const teamsMap = teams.reduce((acc, curr: Array<User>) => {
    acc.set(getTeamId({ drive: curr[0], reverse: curr[1] }), {
      drive: curr[0],
      reverse: curr[1],
      id: null,
    });
    return acc;
  }, new Map<string, Team>());
  const keys = [] as Array<string>;
  teamsMap.forEach((v, k) => keys.push(k));

  for (let i = 0; i < keys.length; i++) {
    const team = teamsMap.get(keys[i]);
    if (team) {
      teamsMap.set(keys[i], await findOrCreateTeam(team));
    }
  }
  return teamsMap;
};

export async function fetchMatch(
  leagueId: string,
  matchId: string,
  confirmed = true,
): Promise<Match> {
  const match = await prisma.match.findUnique({
    where: { id: matchId, leagueId, confirmed },
  });
  if (!match) throw new Error('Match not found');
  const teams = await fetchTeamsFromMatches([match]);
  const userIds = teams.reduce((acc, curr) => {
    acc.push(curr.driveId);
    acc.push(curr.reversId);
    return acc;
  }, new Array<string>());
  const players = await fetchUsers(userIds);
  return fillMatchData(match, teams, players);
}

const fillMatchData = async (
  match: PrismaMatch,
  teams: {
    id: string;
    driveId: string;
    reversId: string;
  }[],
  players: User[],
): Promise<Match> => {
  const local = teams.find((team) => team.id === match.localId);
  if (!local) throw new Error('Failed to fetch local team');
  const visitor = teams.find((team) => team.id === match.visitorId);
  if (!visitor) throw new Error('Failed to fetch local team');
  const localDrive = players.filter((player) => player.id === local.driveId);
  const localReverse = players.filter((player) => player.id === local.reversId);
  const visitorDrive = players.filter(
    (player) => player.id === visitor.driveId,
  );
  const visitorReverse = players.filter(
    (player) => player.id === visitor.reversId,
  );

  return {
    leagueId: match.leagueId,
    id: match.id,
    date: match.date,
    localWins: match.localWins,
    teamLocal: { drive: localDrive[0], reverse: localReverse[0] },
    teamVisitor: { drive: visitorDrive[0], reverse: visitorReverse[0] },
    results: await prisma.set.findMany({ where: { matchId: match.id } }),
    finished: match.finished,
    confirmed: match.confirmed,
    round: match.round,
  };
};

export async function fetchMatches(
  leagueId: string,
  confirmed = true,
): Promise<Match[]> {
  const matches = await prisma.match.findMany({
    where: { leagueId: leagueId, confirmed: confirmed },
  });
  const teams = await fetchTeamsFromMatches(matches);
  const userIds = teams.reduce((acc, curr) => {
    acc.push(curr.driveId);
    acc.push(curr.reversId);
    return acc;
  }, new Array<string>());
  const players = await fetchUsers(userIds);

  const res = await Promise.all(
    matches.map(async (match): Promise<Match> => {
      return fillMatchData(match, teams, players);
    }),
  );
  return res.sort((a, b) => {
    if (a.date < b.date) return -1;
    else return 1;
  });
}

export async function fetchUnconfirmedMatches(
  leagueId: string,
): Promise<Match[]> {
  return fetchMatches(leagueId, false);
}
