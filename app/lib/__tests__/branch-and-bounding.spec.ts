import { expect, test, describe } from 'vitest';
import { Match, UserParticipant } from '../definitions';
import {
  buildMatchesFromList,
  buildMemoryTables,
  buildUsersMatchList,
  estimatePartialSolutionWeight,
  expand,
  generateMatching,
  getPlayerPair,
  getPlayerRivals,
  obtainMinAndMax,
  scoreMatch,
  scorePlayer,
  sortArrayForPlayer,
} from '../branch-and-bounding';
import { NodeItem, createMaxPriorityQueue } from '../maxPriorityQueue';
import { MemoryTableWith } from '../memoryTableWith';
import { MemoryTableAgainst } from '../memoryTableAgainst';
import { MemoryTable } from '../memoryTable';
import exp from 'constants';
import { match } from 'assert';

const getMockUser = (id: number, guest = false): UserParticipant => {
  return {
    id: id.toString(),
    name: `user${id}`,
    email: `email${id}@nextmail.com`,
    guest,
  };
};

const getMockMatch = (users: UserParticipant[], leagueId: string): Match => {
  return {
    leagueId,
    id: `${users[0].id}-${users[1].id}vs${users[2].id}-${users[3].id}`,
    teamLocal: {
      drive: users[0],
      reverse: users[1],
    },
    teamVisitor: {
      drive: users[2],
      reverse: users[3],
    },
    date: new Date(),
    results: [
      {
        id: '1',
        matchId: `${users[0].id}-${users[1].id}vs${users[2].id}-${users[3].id}`,
        visitorScore: 6,
        localScore: 1,
        setNumber: 1,
        localWins: true,
        localTieBreak: 0,
        visitorTieBreak: 0,
      },
    ],
    finished: true,
    confirmed: true,
    round: 1,
    official: true,
  };
};

const getAlreadyPlayedMatches = (
  players: UserParticipant[],
  leagueId: string,
  matches: Array<Array<number>>,
): Match[] => {
  const builtMatches = new Array<Match>();
  for (let i = 0; i < matches.length; i++) {
    const match = getMockMatch(
      matches[i].map((index) => players[index - 1]),
      leagueId,
    );
    builtMatches.push(match);
  }
  return builtMatches;
};

const getListMatchesFrom = (matches: Match[][]): Array<Array<string>> => {
  return matches
    .map((round) =>
      round.map((match) => [
        match.teamLocal.drive.id,
        match.teamLocal.reverse.id,
        match.teamVisitor.drive.id,
        match.teamVisitor.reverse.id,
      ]),
    )
    .flat();
};

const matchDoesContainPair = (
  matches: Array<string>,
  idPlayer1: string,
  idPlayer2: string,
): boolean => {
  const team1 = matches.slice(0, 2);
  const team2 = matches.slice(2, 4);
  return (
    (team1.includes(idPlayer1) && team1.includes(idPlayer2)) ||
    (team2.includes(idPlayer1) && team2.includes(idPlayer2))
  );
};

const howManyContains = (
  matches: Array<string>,
  playerIds: Array<string>,
): number => {
  return matches.filter((id) => playerIds.includes(id)).length;
};

describe('Branch and Bounding', () => {
  describe('Testing Auxiliary functions', () => {
    test('Obtaining min and max for index 5', () => {
      const playerIndex = 5;

      const { max, min } = obtainMinAndMax({ playerIndex });

      expect(min).toBe(4);
      expect(max).toBe(7);
    });

    test('Obtaining min and max for index 2', () => {
      const playerIndex = 2;

      const { max, min } = obtainMinAndMax({ playerIndex });

      expect(min).toBe(0);
      expect(max).toBe(3);
    });

    test('Obtaining min and max for index 3', () => {
      const playerIndex = 3;

      const { min, max } = obtainMinAndMax({ playerIndex });

      expect(min).toBe(0);
      expect(max).toBe(3);
    });

    test('Obtaining min and max for index 3', () => {
      const playerIndex = 0;

      const { min, max } = obtainMinAndMax({ playerIndex });

      expect(min).toBe(0);
      expect(max).toBe(3);
    });

    test('Obtaining player pair for player 0', () => {
      const playerIndex = 0;

      const pair = getPlayerPair(playerIndex);

      expect(pair).toBe(1);
    });

    test('Obtaining player pair for player 1', () => {
      const playerIndex = 1;

      const pair = getPlayerPair(playerIndex);

      expect(pair).toBe(0);
    });

    test('Obtaining player pair for player 3', () => {
      const playerIndex = 3;

      const pair = getPlayerPair(playerIndex);

      expect(pair).toBe(2);
    });

    test('Obtaining player pair for player 18', () => {
      const playerIndex = 18;

      const pair = getPlayerPair(playerIndex);

      expect(pair).toBe(19);
    });

    test('Obtaining player rivals for player 0', () => {
      const playerIndex = 0;

      const pair = getPlayerRivals(playerIndex);

      expect(pair).toBe(2);
    });

    test('Obtaining player rivals for player 1', () => {
      const playerIndex = 1;

      const pair = getPlayerRivals(playerIndex);

      expect(pair).toBe(2);
    });

    test('Obtaining player rivals for player 7', () => {
      const playerIndex = 7;

      const pair = getPlayerRivals(playerIndex);

      expect(pair).toBe(4);
    });

    test('Obtaining player rivals for player 18', () => {
      const playerIndex = 18;

      const pair = getPlayerRivals(playerIndex);

      expect(pair).toBe(16);
    });
  });

  describe('Testing build UsersMatchList', () => {
    test('Testing build UsersMatchList', () => {
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8),
      ];

      const users = buildUsersMatchList({
        players,
        partialSolution: [4, 5, 6, 7, 0, 1, 2, 3],
        evalPlayer: 4,
      });
      expect(users).toEqual([players[0], players[1], players[2], players[3]]);
    });
  });

  describe('Testing sortArrayForPlayer', () => {
    test('Sort Arrays for player 3', () => {
      const playerIndex = 2;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];

      const sortedUsers = sortArrayForPlayer({
        matchUsers: players,
        playerIndex,
      });
      const ids = sortedUsers.map((user) => user.id);

      expect(ids).toEqual(['3', '4', '1', '2']);
    });

    test('Sort Arrays for second player', () => {
      const playerIndex = 1;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];

      const sortedUsers = sortArrayForPlayer({
        matchUsers: players,
        playerIndex,
      });
      const ids = sortedUsers.map((user) => user.id);

      expect(ids).toEqual(['2', '1', '3', '4']);
    });

    test('Sort Arrays for second player on a partial solution', () => {
      const playerIndex = 1;
      const players = [getMockUser(1), getMockUser(2)];

      const sortedUsers = sortArrayForPlayer({
        matchUsers: players,
        playerIndex,
      });
      const ids = sortedUsers.map((user) => user.id);

      expect(ids).toEqual(['2', '1']);
    });

    test('Sort Arrays for second player on a partial solution', () => {
      const playerIndex = 1;
      const players = [getMockUser(1), getMockUser(2), getMockUser(3)];

      const sortedUsers = sortArrayForPlayer({
        matchUsers: players,
        playerIndex,
      });
      const ids = sortedUsers.map((user) => user.id);

      expect(ids).toEqual(['2', '1', '3']);
    });

    test('Sort Arrays for second player on a partial solution', () => {
      const playerIndex = 0;
      const players = [getMockUser(1)];

      const sortedUsers = sortArrayForPlayer({
        matchUsers: players,
        playerIndex,
      });
      const ids = sortedUsers.map((user) => user.id);

      expect(ids).toEqual(['1']);
    });
  });

  describe('Testing scorePlayer', () => {
    test('Eval unique Player', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const playerIndex = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const partialSolution = [0];

      const score = scorePlayer({
        playWith,
        playAgainst,
        evalPlayer: playerIndex,
        players,
        partialSolution,
      });

      expect(score).toEqual(39);
    });

    test('Eval pair without rivals', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const playerIndex = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const partialSolution = [0, 1];

      const score = scorePlayer({
        playWith,
        playAgainst,
        evalPlayer: playerIndex,
        players,
        partialSolution,
      });

      expect(score).toEqual(39);
    });

    test('Eval player with a solution for a full match', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const playerIndex = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const partialSolution = [0, 1, 2, 3];

      const score = scorePlayer({
        playWith,
        playAgainst,
        evalPlayer: playerIndex,
        players,
        partialSolution,
      });

      expect(score).toEqual(39);
    });

    test('Eval player with a pair that already have played together', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const playerIndex = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      playWith.addItem(players[0].id, players[1].id);
      const partialSolution = [0, 1, 2, 3];

      const score = scorePlayer({
        playWith,
        playAgainst,
        evalPlayer: playerIndex,
        players,
        partialSolution,
      });

      expect(score).toEqual(21.5);
    });

    test('Eval player with a pair that already have played together two times', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const playerIndex = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      playWith.addItem(players[0].id, players[1].id);
      playWith.addItem(players[0].id, players[1].id);
      const partialSolution = [0, 1, 2, 3];

      const score = scorePlayer({
        playWith,
        playAgainst,
        evalPlayer: playerIndex,
        players,
        partialSolution,
      });

      expect(score).toEqual(-1);
    });

    test('Eval player with a pair that already have played together and against one of the rivals', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const playerIndex = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);
      const partialSolution = [0, 1, 2, 3];

      const score = scorePlayer({
        playWith,
        playAgainst,
        evalPlayer: playerIndex,
        players,
        partialSolution,
      });

      expect(score).toEqual(17.5);
    });

    test('Eval player with a pair that already have played together and against one of the rivals', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const playerIndex = 4;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8),
      ];
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);
      const partialSolution = [4, 5, 6, 7, 0, 1, 2, 3];

      const score = scorePlayer({
        playWith,
        playAgainst,
        evalPlayer: playerIndex,
        players,
        partialSolution,
      });

      expect(score).toEqual(17.5);
    });
  });

  describe('Testing scoreMatch', () => {
    test('Eval full match with a pair that already have played together and against one of the rivals', () => {
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      const evalMatch = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);
      const partialSolution = [0, 1, 2, 3];

      const score = scoreMatch({
        playWith,
        playAgainst,
        evalMatch,
        players,
        partialSolution,
      });

      expect(score).toEqual(113);
    });

    test('Eval full match with a pair that already have played together and against one of the rivals wit simpler values', () => {
      const playWith = new MemoryTable([4, 2, 0]);
      const playAgainst = new MemoryTable([3, 1, 0]);
      const evalMatch = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);
      const partialSolution = [0, 1, 2, 3];

      const score = scoreMatch({
        playWith,
        playAgainst,
        evalMatch,
        players,
        partialSolution,
      });

      expect(score).toEqual(28);
    });

    test('Eval full match with a pair that already have played together and against one of the rivals wit simpler values', () => {
      const playWith = new MemoryTable([4, 2, 0]);
      const playAgainst = new MemoryTable([3, 1, 0]);
      const evalMatch = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const partialSolution = [0, 1, 2, 3];

      const score = scoreMatch({
        playWith,
        playAgainst,
        evalMatch,
        players,
        partialSolution,
      });

      expect(score).toEqual(40);
    });

    test('Eval a match for a partial solution', () => {
      const playWith = new MemoryTable([4, 2, 0]);
      const playAgainst = new MemoryTable([3, 1, 0]);
      const evalMatch = 0;
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const partialSolution = [0, 1, 2];

      const score = scoreMatch({
        playWith,
        playAgainst,
        evalMatch,
        players,
        partialSolution,
      });

      expect(score).toEqual(40);
    });

    test('Eval a match for a partial solution', () => {
      const playWith = new MemoryTable([4, 2, 0]);
      const playAgainst = new MemoryTable([3, 1, 0]);
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8),
      ];
      const partialSolution = [0, 1, 2];

      const score = estimatePartialSolutionWeight({
        playWith,
        playAgainst,
        players,
        partialSolution,
      });

      expect(score).toEqual(80);
    });

    test('Eval a match for a partial solution', () => {
      const playWith = new MemoryTable([4, 2, 0]);
      const playAgainst = new MemoryTable([3, 1, 0]);
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8),
      ];
      const partialSolution = [0, 1, 2, 3];
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);

      const score = estimatePartialSolutionWeight({
        playWith,
        playAgainst,
        players,
        partialSolution,
      });

      expect(score).toEqual(68);
    });

    test('Eval a match for a partial solution', () => {
      const playWith = new MemoryTable([4, 2, 0]);
      const playAgainst = new MemoryTable([3, 1, 0]);
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8),
      ];
      const partialSolution = [4, 5, 6, 7];
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);

      const score = estimatePartialSolutionWeight({
        playWith,
        playAgainst,
        players,
        partialSolution,
      });

      expect(score).toEqual(80);
    });

    test('Eval a match for a partial solution', () => {
      const playWith = new MemoryTable([4, 2, 0]);
      const playAgainst = new MemoryTable([3, 1, 0]);
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8),
      ];
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);

      const partialSolution1 = [4, 5, 6, 7, 1, 0, 2, 3];
      const partialSolution2 = [4, 5, 2, 3, 1, 6, 7, 0];
      const score1 = estimatePartialSolutionWeight({
        playWith,
        playAgainst,
        players,
        partialSolution: partialSolution1,
      });
      const score2 = estimatePartialSolutionWeight({
        playWith,
        playAgainst,
        players,
        partialSolution: partialSolution2,
      });

      expect(score1).toEqual(68);
      expect(score2).toEqual(80);
      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('Testing Expanding Nodes', () => {
    test('Expanding Initial Node', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const elements = [0, 1, 2, 3];
      const solution = new Array<number>();
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      let maxScore = 0;

      // Act
      expand({
        p,
        elements,
        partialSolution: solution,
        players,
        playWith,
        playAgainst,
        maxScore,
      });

      // Assert
      expect(p.size).toBe(4);
      const a = new Array<NodeItem>();
      for (let element = p.poll(); element; element = p.poll()) {
        a.push(element);
      }
      expect(a).toEqual(
        expect.arrayContaining([
          {
            elements: [1, 2, 3],
            score: 156,
            solution: [0],
          },
          {
            elements: [0, 1, 2],
            score: 156,
            solution: [3],
          },
          {
            elements: [0, 1, 3],
            score: 156,
            solution: [2],
          },
          {
            elements: [0, 2, 3],
            score: 156,
            solution: [1],
          },
        ]),
      );
    });

    test('Expanding Second Node', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const elements = [0, 1, 2];
      const solution = [3];
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      let maxScore = 0;

      // Act
      expand({
        p,
        elements,
        partialSolution: solution,
        players,
        playWith,
        playAgainst,
        maxScore,
      });

      // Assert
      expect(p.size).toBe(3);
      const a = new Array<NodeItem>();
      for (let element = p.poll(); element; element = p.poll()) {
        a.push(element);
      }
      expect(a).toEqual(
        expect.arrayContaining([
          {
            elements: [1, 2],
            score: 156,
            solution: [3, 0],
          },
          {
            elements: [0, 1],
            score: 156,
            solution: [3, 2],
          },
          {
            elements: [0, 2],
            score: 156,
            solution: [3, 1],
          },
        ]),
      );
    });

    test('Expanding Second Node but with a previous match already played', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const elements = [1, 2, 3];
      const solution = [0];
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      let maxScore = 0;
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);

      // Act
      expand({
        p,
        elements,
        partialSolution: solution,
        players,
        playWith,
        playAgainst,
        maxScore,
      });

      // Assert
      expect(p.size).toBe(3);
      const a = new Array<NodeItem>();
      for (let element = p.poll(); element; element = p.poll()) {
        a.push(element);
      }
      expect(a).toEqual(
        expect.arrayContaining([
          {
            elements: [1, 3],
            score: 143.5,
            solution: [0, 2],
          },
          {
            elements: [1, 2],
            score: 143.5,
            solution: [0, 3],
          },
          {
            elements: [2, 3],
            score: 121,
            solution: [0, 1],
          },
        ]),
      );
    });
  });

  describe('Testing Generating Matching', () => {
    test('Expanding Second Node but with a previous match already played', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];
      const playWith = new MemoryTableWith();
      const playAgainst = new MemoryTableAgainst();
      playWith.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[0].id, players[3].id);
      playAgainst.addItem(players[1].id, players[2].id);
      playAgainst.addItem(players[1].id, players[3].id);
      playWith.addItem(players[0].id, players[3].id);
      playAgainst.addItem(players[0].id, players[1].id);
      playAgainst.addItem(players[0].id, players[2].id);
      playAgainst.addItem(players[3].id, players[1].id);
      playAgainst.addItem(players[3].id, players[2].id);

      // Act
      const s = generateMatching({
        players,
        playWith,
        playAgainst,
      });

      // Assert
      expect(s).toHaveLength(4);
      const a = new Array<NodeItem>();
      expect(s).toEqual([1, 3, 2, 0]);
    });
  });

  describe('Testing Generating Matching', () => {
    /*
    test('Expanding Second Node but with a previous match already played', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
      ];

      const playedMatches = getAlreadyPlayedMatches(players, '1', [
        [1, 2, 3, 4],
        [3, 4, 2, 3],
      ]);

      // Act
      const matches = buildMatchesFromList({
        players,
        leagueId: '1',
        playersCount: 4,
        rounds: 3,
        date: new Date(),
        playedMatches,
      });

      // Assert
      expect(matches).toHaveLength(3);
      expect(matches[0]).toHaveLength(1);
      const a = new Array<NodeItem>();
      expect(matches[0][0]).toMatchObject(
        expect.objectContaining({
          confirmed: false,
          date: expect.any(Date),
          finished: false,
          id: expect.any(String),
          leagueId: '1',
          localWins: false,
          official: true,
          results: expect.arrayContaining([]),
          round: 1,
          teamLocal: expect.objectContaining({
            drive: expect.objectContaining({
              email: 'email1@nextmail.com',
              id: '1',
              name: 'user1',
            }),
            reverse: expect.objectContaining({
              email: 'email4@nextmail.com',
              id: '4',
              name: 'user4',
            }),
          }),
          teamVisitor: expect.objectContaining({
            drive: expect.objectContaining({
              email: 'email3@nextmail.com',
              id: '3',
              name: 'user3',
            }),
            reverse: expect.objectContaining({
              email: 'email2@nextmail.com',
              id: '2',
              name: 'user2',
            }),
          }),
        }),
      );

      expect(matches[1][0]).toMatchObject(
        expect.objectContaining({
          confirmed: false,
          date: expect.any(Date),
          finished: false,
          id: expect.any(String),
          leagueId: '1',
          localWins: false,
          official: true,
          results: expect.arrayContaining([]),
          round: 2,
          teamLocal: expect.objectContaining({
            drive: expect.objectContaining({
              email: 'email1@nextmail.com',
              id: '1',
              name: 'user1',
            }),
            reverse: expect.objectContaining({
              email: 'email3@nextmail.com',
              id: '3',
              name: 'user3',
            }),
          }),
          teamVisitor: expect.objectContaining({
            drive: expect.objectContaining({
              email: 'email2@nextmail.com',
              id: '2',
              name: 'user2',
            }),
            reverse: expect.objectContaining({
              email: 'email4@nextmail.com',
              id: '4',
              name: 'user4',
            }),
          }),
        }),
      );
    });
    */

    test('Building playWith and playAgainst memory tables', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8, true),
      ];

      const playedMatches = getAlreadyPlayedMatches(players, '1', [
        [1, 2, 3, 4],
        [5, 6, 1, 2],
        [3, 4, 2, 5],
        [6, 5, 7, 4],
      ]);

      buildMemoryTables(playedMatches);

      // Act

      const { playAgainst, playWith } = buildMemoryTables(playedMatches);

      // Assert
      expect(playAgainst.ToString()).toEqual(
        '[1|[3,1]-[4,1]-[5,1]-[6,1]],[2|[3,2]-[4,2]-[5,1]-[6,1]],[3|[1,1]-[2,2]-[5,1]],[4|[1,1]-[2,2]-[5,2]-[6,1]],[5|[1,1]-[2,1]-[3,1]-[4,2]-[7,1]],[6|[1,1]-[2,1]-[4,1]-[7,1]],[7|[5,1]-[6,1]]',
      );
      expect(playWith.ToString()).toEqual(
        '[1|[2,2]],[2|[1,2]-[5,1]],[3|[4,2]],[4|[3,2]-[7,1]],[5|[2,1]-[6,2]],[6|[5,2]],[7|[4,1]]',
      );
    });

    test('A guest is added, maximize official matches (pair 1-2 and 3-4 have played already 2 matches, 5-6 and 2-3 have already played 1)', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7),
        getMockUser(8, true),
      ];

      const playedMatches = getAlreadyPlayedMatches(players, '1', [
        [1, 2, 3, 4],
        [5, 6, 1, 2],
        [3, 4, 2, 5],
        [6, 5, 7, 4],
      ]);

      // Act
      const matches = buildMatchesFromList({
        players,
        leagueId: '1',
        playersCount: 8,
        rounds: 3,
        date: new Date(),
        playedMatches,
      });

      const matchesList = getListMatchesFrom(matches);

      // Assert
      expect(getListMatchesFrom([playedMatches])).toEqual([
        ['1', '2', '3', '4'],
        ['5', '6', '1', '2'],
        ['3', '4', '2', '5'],
        ['6', '5', '7', '4'],
      ]);
      expect(getListMatchesFrom(matches)).toEqual([
        ['1', '7', '4', '2'],
        ['8', '6', '5', '3'],
        ['5', '4', '8', '3'],
        ['6', '1', '2', '7'],
        ['1', '4', '7', '3'],
        ['6', '2', '8', '5'],
      ]);
      expect(matches).toHaveLength(3);
      expect(matchesList).toHaveLength(6);
      expect(matchesList).toEqual([
        ['1', '7', '4', '2'],
        ['8', '6', '5', '3'],
        ['5', '4', '8', '3'],
        ['6', '1', '2', '7'],
        ['1', '4', '7', '3'],
        ['6', '2', '8', '5'],
      ]);
      matchesList.forEach((match) => {
        expect(matchDoesContainPair(match, '1', '2')).toBeFalsy();
        expect(matchDoesContainPair(match, '3', '4')).toBeFalsy();
        expect(matchDoesContainPair(match, '5', '6')).toBeFalsy();
        expect(matchDoesContainPair(match, '2', '5')).toBeFalsy();
      });
    });

    test('Two guests added, maximize official matches (pair 1-2 and 3-4 have played already 2 matches, 5-6 and 2-3 have already played 1)', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4),
        getMockUser(5),
        getMockUser(6),
        getMockUser(7, true),
        getMockUser(8, true),
      ];

      const playedMatches = getAlreadyPlayedMatches(players, '1', [
        [1, 2, 3, 4],
        [5, 6, 1, 2],
        [3, 4, 2, 5],
        [6, 5, 7, 4],
      ]);

      // Act
      const matches = buildMatchesFromList({
        players,
        leagueId: '1',
        playersCount: 8,
        rounds: 3,
        date: new Date(),
        playedMatches,
      });

      const matchesList = getListMatchesFrom(matches);

      // Assert
      expect(getListMatchesFrom([playedMatches])).toEqual([
        ['1', '2', '3', '4'],
        ['5', '6', '1', '2'],
        ['3', '4', '2', '5'],
        ['6', '5', '7', '4'],
      ]);
      expect(matches).toHaveLength(3);
      expect(matchesList).toHaveLength(6);
      expect(matchesList).toEqual([
        ['1', '6', '5', '3'],
        ['4', '2', '8', '7'],
        ['2', '5', '8', '7'],
        ['6', '4', '1', '3'],
        ['5', '4', '6', '3'],
        ['2', '1', '7', '8'],
      ]);
      matchesList.forEach((match) => {
        expect(matchDoesContainPair(match, '3', '4')).toBeFalsy();
        expect(matchDoesContainPair(match, '5', '6')).toBeFalsy();
        if (matchDoesContainPair(match, '1', '2')) {
          const count = howManyContains(match, ['7', '8', '1', '2']);
          expect(count).toBe(4);
        } else {
          expect(matchDoesContainPair(match, '1', '2')).toBeFalsy();
        }

        if (matchDoesContainPair(match, '2', '5')) {
          const count = howManyContains(match, ['7', '8', '2', '5']);
          expect(count).toBe(4);
        } else {
          expect(matchDoesContainPair(match, '2', '5')).toBeFalsy();
        }
        const count = howManyContains(match, ['7', '8']);
        if (count == 0) {
          expect(count).toBe(0);
        } else {
          expect(count).toBe(2);
        }
      });
    });
    /*
    test('Expanding Second Node but with a previous match already played with guest users', () => {
      // Arrange
      const p = createMaxPriorityQueue();
      const players = [
        getMockUser(1),
        getMockUser(2),
        getMockUser(3),
        getMockUser(4, true),
      ];

      // Act
      const matches = buildMatchesFromList({
        players,
        leagueId: '1',
        playersCount: 4,
        rounds: 3,
        date: new Date(),
      });

      // Assert
      expect(matches).toHaveLength(3);
      expect(matches[0]).toHaveLength(1);
      const a = new Array<NodeItem>();
      expect(matches[0][0]).toMatchObject(
        expect.objectContaining({
          confirmed: false,
          date: expect.any(Date),
          finished: false,
          id: expect.any(String),
          leagueId: '1',
          localWins: false,
          official: false,
          results: expect.arrayContaining([]),
          round: 1,
          teamLocal: expect.objectContaining({
            drive: expect.objectContaining({
              email: 'email2@nextmail.com',
              id: '2',
              guest: false,
              name: 'user2',
            }),
            reverse: expect.objectContaining({
              email: 'email1@nextmail.com',
              id: '1',
              guest: false,
              name: 'user1',
            }),
          }),

          teamVisitor: expect.objectContaining({
            drive: expect.objectContaining({
              email: 'email3@nextmail.com',
              id: '3',
              name: 'user3',
            }),
            reverse: expect.objectContaining({
              email: 'email4@nextmail.com',
              id: '4',
              name: 'user4',
              guest: true,
            }),
          }),
        }),
      );
    });
  */
  });
});
