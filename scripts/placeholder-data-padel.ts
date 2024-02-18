import { League, Match, Team, User, Set } from '@prisma/client';

export const users: User[] = [
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857822',
    name: 'player1',
    email: 'player1@nextmail.com',
    password: '123456',
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857823',
    name: 'player2',
    email: 'player21@nextmail.com',
    password: '123456',
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857824',
    name: 'player3',
    email: 'player3@nextmail.com',
    password: '123456',
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857825',
    name: 'player4',
    email: 'player4@nextmail.com',
    password: '123456',
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857826',
    name: 'player5',
    email: 'player5@nextmail.com',
    password: '123456',
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857827',
    name: 'player6',
    email: 'player64@nextmail.com',
    password: '123456',
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857828',
    name: 'player7',
    email: 'player7@nextmail.com',
    password: '123456',
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857829',
    name: 'player8',
    email: 'player8@nextmail.com',
    password: '123456',
  },
];

export const teams: Team[] = [
  // 0
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857831',
    driveId: users[0].id,
    reversId: users[1].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e8578312',
    driveId: users[0].id,
    reversId: users[2].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857833',
    driveId: users[0].id,
    reversId: users[3].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857834',
    driveId: users[0].id,
    reversId: users[4].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857835',
    driveId: users[0].id,
    reversId: users[5].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857836',
    driveId: users[0].id,
    reversId: users[6].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857837',
    driveId: users[0].id,
    reversId: users[7].id,
  },
  // 7
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857841',
    driveId: users[1].id,
    reversId: users[2].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857842',
    driveId: users[1].id,
    reversId: users[3].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857843',
    driveId: users[1].id,
    reversId: users[4].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857844',
    driveId: users[1].id,
    reversId: users[5].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857845',
    driveId: users[1].id,
    reversId: users[6].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857846',
    driveId: users[1].id,
    reversId: users[7].id,
  },

  // 13
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857851',
    driveId: users[2].id,
    reversId: users[3].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857852',
    driveId: users[2].id,
    reversId: users[4].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857853',
    driveId: users[2].id,
    reversId: users[5].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857854',
    driveId: users[2].id,
    reversId: users[6].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857855',
    driveId: users[2].id,
    reversId: users[7].id,
  },
  // 18
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857861',
    driveId: users[3].id,
    reversId: users[4].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857862',
    driveId: users[3].id,
    reversId: users[5].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857863',
    driveId: users[3].id,
    reversId: users[6].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857864',
    driveId: users[3].id,
    reversId: users[7].id,
  },
  // 22
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857871',
    driveId: users[4].id,
    reversId: users[5].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857872',
    driveId: users[4].id,
    reversId: users[6].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857873',
    driveId: users[4].id,
    reversId: users[7].id,
  },
  //25
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857874',
    driveId: users[5].id,
    reversId: users[6].id,
  },
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857875',
    driveId: users[5].id,
    reversId: users[7].id,
  },
  //27
  {
    id: 'a063093a-b1af-42ea-9114-38af7e857876',
    driveId: users[6].id,
    reversId: users[7].id,
  },
];

export const leagues: League[] = [
  {
    id: '0d8ff7f3-838a-4f5d-a25b-7cb99290f62f',
    name: 'Padel League',
    adminId: users[0].id,
  },
];

export const matches: Match[] = [
  {
    id: 'f0b23613-5a65-4e0c-a204-43c5e911f7d1',
    localId: teams[0].id, // 0 - 1
    visitorId: teams[13].id, // 2 - 3
    leagueId: leagues[0].id,
    date: new Date('2022-12-06'),
    localWins: true,
    finished: true,
    confirmed: true,
    round: 1,
  },
  {
    id: 'f0b23613-5a65-4e0c-a204-43c5e911f7d2',
    localId: teams[22].id, // 4 - 5
    visitorId: teams[27].id, // 6 - 7
    leagueId: leagues[0].id,
    date: new Date('2022-12-06'),
    localWins: true,
    finished: true,
    confirmed: true,
    round: 1,
  },
  {
    id: 'f0b23613-5a65-4e0c-a204-43c5e911f7d3',
    localId: teams[1].id, // 0 - 2
    visitorId: teams[8].id, // 1 - 3
    leagueId: leagues[0].id,
    date: new Date('2022-12-16'),
    localWins: false,
    finished: true,
    confirmed: true,
    round: 1,
  },
  {
    id: 'f0b23613-5a65-4e0c-a204-43c5e911f7d4',
    localId: teams[23].id, // 4 - 6
    visitorId: teams[26].id, // 5 - 7
    leagueId: leagues[0].id,
    date: new Date('2022-12-16'),
    localWins: false,
    finished: true,
    confirmed: true,
    round: 1,
  },
  {
    id: 'f0b23613-7a65-4e0c-a204-43c5e911f7d4',
    localId: teams[23].id, // 4 - 6
    visitorId: teams[26].id, // 5 - 7
    leagueId: leagues[0].id,
    date: new Date('2150-12-16'),
    localWins: true,
    finished: true,
    confirmed: false,
    round: 2,
  },
];

export const sets: Set[] = [
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6451',
    matchId: matches[0].id,
    localScore: 6,
    visitorScore: 4,
    localWins: true,
    setNumber: 1,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6452',
    matchId: matches[0].id,
    localScore: 6,
    visitorScore: 3,
    localWins: true,
    setNumber: 2,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6453',
    matchId: matches[1].id,
    localScore: 2,
    visitorScore: 6,
    localWins: false,
    setNumber: 1,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6454',
    matchId: matches[1].id,
    localScore: 6,
    visitorScore: 3,
    localWins: true,
    setNumber: 2,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6455',
    matchId: matches[1].id,
    localScore: 6,
    visitorScore: 3,
    localWins: true,
    setNumber: 3,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6456',
    matchId: matches[2].id,
    localScore: 4,
    visitorScore: 6,
    localWins: false,
    setNumber: 1,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6457',
    matchId: matches[2].id,
    localScore: 2,
    visitorScore: 6,
    localWins: false,
    setNumber: 2,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6458',
    matchId: matches[3].id,
    localScore: 5,
    visitorScore: 7,
    localWins: false,
    setNumber: 1,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
  {
    id: '039b9ab2-f61b-48f5-8258-7aed5c5d6459',
    matchId: matches[3].id,
    localScore: 2,
    visitorScore: 6,
    localWins: false,
    setNumber: 2,
    localTieBreak: 0,
    visitorTieBreak: 0,
  },
];
