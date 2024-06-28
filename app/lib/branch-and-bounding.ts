import {
  Match,
  UserParticipant,
  UserParticipantWithMatches,
} from './definitions';
import { MemoryTable } from './memoryTable';
import { v4 as uuidv4 } from 'uuid';
import { MemoryTableAgainst } from './memoryTableAgainst';
import { MemoryTableWith } from './memoryTableWith';
import { generateMatching } from './dao/branch-and-bounding-utils';

const updateCache = (
  cache: Map<string, number>,
  key: string,
  score: number,
) => {
  if (!cache.has(key)) {
    cache.set(key, score);
  }
};

export const buildMatchesFromList12Elements = ({
  players,
  leagueId,
  rounds,
  date,
  playedMatches,
}: {
  players: UserParticipant[];
  leagueId: string;
  playersCount: number;
  rounds: number;
  date: Date;
  playedMatches: Match[];
}): { matches: Match[]; score: number }[] => {
  if (players.length !== 12) {
    throw new Error('Players must be 12');
  }
  if (rounds > 3) {
    throw new Error('Max rounds is 3');
  }
  const { playWith, playAgainst, sortedPlayers } = buildCachesAndPlayersList({
    players,
    playedMatches,
  });

  console.log('sortedPlayers', sortedPlayers);

  const matches: { matches: Match[]; score: number }[] = [];
  const partitions: Map<number, number[][]> = new Map<number, number[][]>([
    [
      0,
      [
        [4, 5, 6, 7, 8, 9, 10, 11],
        [0, 1, 2, 3],
      ],
    ],
    [
      1,
      [
        [1, 3, 6, 7, 8, 9, 10, 11],
        [0, 2, 4, 5],
      ],
    ],
    [
      2,
      [
        [0, 5, 6, 7, 8, 9, 10, 11],
        [1, 2, 3, 4],
      ],
    ],
    [
      3,
      [
        [0, 1, 6, 7, 8, 9, 10, 11],
        [2, 3, 4, 5],
      ],
    ],
    [
      4,
      [
        [0, 1, 2, 3, 6, 7, 10, 11],
        [4, 5, 8, 9],
      ],
    ],
  ]);
  let initialSolution = sortedPlayers.reverse();
  for (let iterRounds = 0; iterRounds < rounds; iterRounds++) {
    const round = branchAndBound12({
      partitions,
      initialSolution,
      partitionsAmount: 5,
      playAgainst,
      playWith,
      round: iterRounds,
      leagueId,
      date,
    });

    matches.push(round);

    initialSolution = [
      ...sortPlayersByMatchesPlayed({ players, playWith }),
    ].reverse();
  }
  return matches;
};

const buildMatches = ({
  solution,
  rounds,
  players,
  playWith,
  playAgainst,
  leagueId,
  date,
  round,
}: {
  solution: number[];
  rounds: Array<Match>;
  players: UserParticipant[];
  playWith: MemoryTableWith;
  playAgainst: MemoryTableAgainst;
  leagueId: string;
  date: Date;
  round: number;
}) => {
  for (let j = 0; j < solution.length; j += 4) {
    const driveLocal = solution[j];
    const reverseLocal = solution[j + 1];
    const driveVisitor = solution[j + 2];
    const reverseVisitor = solution[j + 3];
    rounds.push(
      newMatch({
        leagueId,
        players,
        date,
        driveLocal,
        reverseLocal,
        driveVisitor,
        reverseVisitor,
        round,
      }),
    );
    updateCaches({
      players,
      playWith,
      playAgainst,
      driveLocal,
      reverseLocal,
      driveVisitor,
      reverseVisitor,
    });
  }
};

export const buildCachesAndPlayersList = ({
  players,
  playedMatches,
}: {
  players: UserParticipant[];
  playedMatches: Match[];
}) => {
  const { playWith, playAgainst } = buildMemoryTables(playedMatches);
  const sortedPlayers = sortPlayersByMatchesPlayed({ players, playWith });
  return { playWith, playAgainst, sortedPlayers: [...sortedPlayers] };
};

export const buildMatchesFromList = ({
  players,
  leagueId,
  rounds,
  date,
  playedMatches,
}: {
  players: UserParticipant[];
  leagueId: string;
  playersCount: number;
  rounds: number;
  date: Date;
  playedMatches: Match[];
}): { matches: Match[]; score: number }[] => {
  const { playWith, playAgainst, sortedPlayers } = buildCachesAndPlayersList({
    players,
    playedMatches,
  });
  sortedPlayers.reverse();

  const matches: { matches: Match[]; score: number }[] = [];
  for (let iterRounds = 0; iterRounds < rounds; iterRounds++) {
    const sortedPlayers = sortPlayersByMatchesPlayed({ players, playWith });
    const initialSolution = buildInitialSolution2(sortedPlayers);
    const { solution, score } = generateMatching({
      initialSolution,
      playAgainst,
      playWith,
      players: sortedPlayers,
    });
    console.log(
      'solution',
      solution.map((it) => it),
    );
    const round = new Array<Match>();
    for (let j = 0; j < solution.length; j += 4) {
      const driveLocal = solution[j];
      const reverseLocal = solution[j + 1];
      const driveVisitor = solution[j + 2];
      const reverseVisitor = solution[j + 3];
      round.push(
        newMatch({
          leagueId,
          players: sortedPlayers,
          date,
          driveLocal,
          reverseLocal,
          driveVisitor,
          reverseVisitor,
          round: iterRounds + 1,
        }),
      );
      updateCaches({
        players: sortedPlayers,
        playWith,
        playAgainst,
        driveLocal,
        reverseLocal,
        driveVisitor,
        reverseVisitor,
      });
    }
    matches.push({ matches: round, score });
  }
  return matches;
};

export const buildInitialSolution2 = (
  sortedSolution: UserParticipantWithMatches[],
) => {
  const initialSolution: UserParticipantWithMatches[] = [];
  const guest = sortedSolution.filter((player) => player.guest);
  const nonGuest = sortedSolution.filter((player) => !player.guest);
  const amountOfMatchesWithNoGuest = Math.floor(
    (sortedSolution.length - guest.length) / 4,
  );
  for (let i = 0; i < amountOfMatchesWithNoGuest; i++) {
    initialSolution.push(nonGuest[i * 2]);
    initialSolution.push(nonGuest[i * 2 + 1]);
    initialSolution.push(nonGuest[nonGuest.length - 1 - i * 2]);
    initialSolution.push(nonGuest[nonGuest.length - 2 - i * 2]);
  }
  const tempInitialSolution = initialSolution.map((player) => player.id);
  const rest = nonGuest.filter(
    (player) => !tempInitialSolution.includes(player.id),
  );
  return [...initialSolution, ...rest, ...guest];
};

export const buildInitialSolution = (
  sortedSolution: UserParticipantWithMatches[],
) => {
  const initialSolution: UserParticipantWithMatches[] = [];
  const guest = sortedSolution.filter((player) => player.guest);
  const nonGuest = sortedSolution.filter((player) => !player.guest);
  const amountOfMatchesWithNoGuest = Math.floor(
    (sortedSolution.length - guest.length) / 4,
  );
  for (let i = 0; i < amountOfMatchesWithNoGuest; i++) {
    initialSolution.push(nonGuest[i * 2]);
    initialSolution.push(nonGuest[i * 2 + 1]);
    initialSolution.push(nonGuest[nonGuest.length - 1 - i * 2]);
    initialSolution.push(nonGuest[nonGuest.length - 2 - i * 2]);
  }
  const rest = nonGuest.filter((player) => !initialSolution.includes(player));
  return [...initialSolution, ...rest, ...guest];
};

export const updateCaches = ({
  players,
  playWith,
  playAgainst,
  driveLocal,
  reverseLocal,
  driveVisitor,
  reverseVisitor,
}: {
  players: UserParticipant[];
  playWith: MemoryTableWith;
  playAgainst: MemoryTableAgainst;
  driveLocal: number;
  reverseLocal: number;
  driveVisitor: number;
  reverseVisitor: number;
}): void => {
  playWith.addItem(players[driveLocal].id, players[reverseLocal].id);
  playWith.addItem(players[driveVisitor].id, players[reverseVisitor].id);
  playAgainst.addItem(players[driveLocal].id, players[driveVisitor].id);
  playAgainst.addItem(players[driveLocal].id, players[reverseVisitor].id);
  playAgainst.addItem(players[reverseLocal].id, players[driveVisitor].id);
  playAgainst.addItem(players[reverseLocal].id, players[reverseVisitor].id);
};

const newMatch = ({
  leagueId,
  players,
  date,
  driveLocal,
  reverseLocal,
  driveVisitor,
  reverseVisitor,
  round,
}: {
  leagueId: string;
  players: UserParticipant[];
  date: Date;
  driveLocal: number;
  reverseLocal: number;
  driveVisitor: number;
  reverseVisitor: number;
  round: number;
}): Match => {
  return {
    leagueId,
    date: date,
    localWins: false,
    teamLocal: {
      drive: players[driveLocal],
      reverse: players[reverseLocal],
    },
    teamVisitor: {
      drive: players[driveVisitor],
      reverse: players[reverseVisitor],
    },
    results: [],
    finished: false,
    id: uuidv4(),
    confirmed: false,
    round,
    official: !(
      players[driveLocal].guest ||
      players[reverseLocal].guest ||
      players[driveVisitor].guest ||
      players[reverseVisitor].guest
    ),
  };
};

export const buildMemoryTables = (
  playedMatches: Match[],
): { playAgainst: MemoryTableAgainst; playWith: MemoryTableWith } => {
  const playWith = new MemoryTableAgainst();
  const playAgainst = new MemoryTableWith();

  playedMatches.forEach((match) => {
    if (match.finished && match.official) {
      playWith.addItem(match.teamLocal.drive.id, match.teamLocal.reverse.id);
      playWith.addItem(
        match.teamVisitor.drive.id,
        match.teamVisitor.reverse.id,
      );
      playAgainst.addItem(match.teamLocal.drive.id, match.teamVisitor.drive.id);
      playAgainst.addItem(
        match.teamLocal.drive.id,
        match.teamVisitor.reverse.id,
      );
      playAgainst.addItem(
        match.teamLocal.reverse.id,
        match.teamVisitor.drive.id,
      );
      playAgainst.addItem(
        match.teamLocal.reverse.id,
        match.teamVisitor.reverse.id,
      );
    }
  });
  return { playWith, playAgainst };
};

export const sortPlayersByMatchesPlayed = ({
  players,
  playWith,
}: {
  playWith: MemoryTableWith;
  players: UserParticipant[];
}): UserParticipantWithMatches[] => {
  const playersWithMatches: UserParticipantWithMatches[] = players.map(
    (player) => ({
      ...player,
      playedMatches: playWith.getAmountOfMatches(player.id),
    }),
  );
  return [...playersWithMatches].sort((a, b) => {
    if (b.guest) {
      return -1;
    } else if (a.guest) {
      return 1;
    }
    const aMatches = a.playedMatches;
    const bMatches = b.playedMatches;
    const diff = aMatches - bMatches;
    // If both players have the same amount of matches, sort randomly
    if (diff === 0) {
      return Math.random() - 0.5;
    }
    return diff;
  });
};

const branchAndBound12 = ({
  initialSolution,
  partitions,
  partitionsAmount,
  playAgainst,
  playWith,
  round,
  leagueId,
  date,
}: {
  partitions: Map<number, number[][]>;
  initialSolution: UserParticipantWithMatches[];
  partitionsAmount: number;
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  round: number;
  leagueId: string;
  date: Date;
}): { matches: Array<Match>; score: number } => {
  const result: {
    solution8: Array<number>;
    solution4: Array<number>;
    elements8: Array<number>;
    elements4: Array<number>;
    matches: Array<Match>;
    score: number;
  } = {
    solution8: [],
    solution4: [],
    elements8: [],
    elements4: [],
    matches: [],
    score: 0,
  };
  for (let iterRounds = 0; iterRounds < partitionsAmount; iterRounds++) {
    const elements8 = partitions.get(iterRounds)?.[0] ?? [];
    const elements4 = partitions.get(iterRounds)?.[1] ?? [];
    const players8 = initialSolution.filter((_, index) =>
      elements8.includes(index),
    );
    const players4 = initialSolution.filter((_, index) =>
      elements4.includes(index),
    );
    const { solution: solution8, score: score8 } = generateMatching({
      initialSolution: players8,
      playAgainst,
      playWith,
      players: players8,
    });

    const { solution: solution4, score: score4 } = generateMatching({
      initialSolution: players4,
      playAgainst,
      playWith,
      players: players4,
    });

    if (score4 + score8 >= result.score) {
      result.solution8 = solution8;
      result.solution4 = solution4;
      result.elements8 = elements8;
      result.elements4 = elements4;
      result.score = score4 + score8;
    }
  }

  const mappedSol8 = result.solution8.map((it) => result.elements8[it]);
  buildMatches({
    solution: mappedSol8,
    rounds: result.matches,
    players: initialSolution,
    playWith,
    playAgainst,
    leagueId,
    date,
    round,
  });

  const mappedSol4 = result.solution4.map((it) => result.elements4[it]);
  buildMatches({
    solution: mappedSol4,
    rounds: result.matches,
    players: initialSolution,
    playWith,
    playAgainst,
    leagueId,
    date,
    round,
  });
  return { matches: result.matches, score: result.score };
};
