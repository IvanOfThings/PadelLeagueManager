import { MaxPriorityQueue } from 'data-structure-typed';
import {
  Match,
  User,
  UserParticipant,
  UserParticipantWithMatches,
} from './definitions';
import { MemoryTable } from './memoryTable';
import { NodeItem, createMinPriorityQueue } from './maxPriorityQueue';
import { v4 as uuidv4 } from 'uuid';
import { MemoryTableAgainst } from './memoryTableAgainst';
import { MemoryTableWith } from './memoryTableWith';

export const obtainMinAndMax = ({
  playerIndex,
}: {
  playerIndex: number;
}): { max: number; min: number } => {
  const min = Math.floor(playerIndex / 4) * 4;
  const max = min + 3;

  return { max, min };
};

export const getPlayerPair = (playerIndex: number): number => {
  return playerIndex % 2 === 0 ? playerIndex + 1 : playerIndex - 1;
};

export const getPlayerRivals = (playerIndex: number): number => {
  const pairIndex = Math.floor(playerIndex / 2);
  const rivalPairIndex = pairIndex % 2 === 0 ? pairIndex + 1 : pairIndex - 1;
  return rivalPairIndex * 2;
};

export const sortArrayForPlayer = ({
  matchUsers,
  playerIndex,
}: {
  matchUsers: UserParticipant[];
  playerIndex: number;
}): UserParticipant[] => {
  const sorted = new Array<UserParticipant>();
  sorted.push(matchUsers[playerIndex]);
  if (matchUsers.length > getPlayerPair(playerIndex)) {
    sorted.push(matchUsers[getPlayerPair(playerIndex)]);
  }
  const rivalPairIndex = getPlayerRivals(playerIndex);
  if (matchUsers.length > rivalPairIndex) {
    sorted.push(matchUsers[rivalPairIndex]);
  }
  if (matchUsers.length > rivalPairIndex + 1) {
    sorted.push(matchUsers[rivalPairIndex + 1]);
  }
  return sorted;
};

export const buildUsersMatchList = ({
  players,
  partialSolution,
  evalPlayer,
}: {
  players: UserParticipant[];
  partialSolution: number[];
  evalPlayer: number;
}): UserParticipant[] => {
  const { min, max } = obtainMinAndMax({ playerIndex: evalPlayer });
  const usersVector = new Array<UserParticipant>();
  for (let i = min; i <= max && i < partialSolution.length; i++) {
    usersVector.push(players[partialSolution[i]]);
  }
  return usersVector;
};

export const scorePlayer = ({
  playWith,
  playAgainst,
  players,
  partialSolution,
  evalPlayer,
  leftElements,
}: {
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  players: UserParticipant[];
  partialSolution: number[];
  evalPlayer: number;
  leftElements: number[];
}): number => {
  const matchUsers = buildUsersMatchList({
    players,
    partialSolution,
    evalPlayer,
  });
  const matchPlayer = evalPlayer % 4;
  const partialUsersSortedArray = sortArrayForPlayer({
    playerIndex: matchPlayer,
    matchUsers,
  });
  const restPlayers = players
    .filter((p, index) => leftElements.includes(index))
    .map((p) => p);
  let score = 0;
  score =
    score +
    (partialUsersSortedArray[1]
      ? playWith.getScore(
          partialUsersSortedArray[0].id,
          partialUsersSortedArray[1].id,
          partialUsersSortedArray[0].guest || partialUsersSortedArray[1].guest,
        )
      : playWith.getMaxScore(
          partialUsersSortedArray[0].id,
          restPlayers,
          partialUsersSortedArray[0].guest,
        ));
  score =
    score +
    (partialUsersSortedArray[2]
      ? playAgainst.getScore(
          partialUsersSortedArray[0].id,
          partialUsersSortedArray[2].id,
          partialUsersSortedArray[0].guest || partialUsersSortedArray[2].guest,
        )
      : playAgainst.getMaxScore(
          partialUsersSortedArray[0].id,
          restPlayers,
          partialUsersSortedArray[0].guest,
        ));
  score =
    score +
    (partialUsersSortedArray[3]
      ? playAgainst.getScore(
          partialUsersSortedArray[0].id,
          partialUsersSortedArray[3].id,
          partialUsersSortedArray[0].guest || partialUsersSortedArray[3].guest,
        )
      : playAgainst.getMaxScore(
          partialUsersSortedArray[0].id,
          restPlayers,
          partialUsersSortedArray[0].guest,
        ));
  return score;
};

export const scoreMatch = ({
  playWith,
  playAgainst,
  players,
  partialSolution,
  evalMatch,
  leftElements,
}: {
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  players: UserParticipant[];
  partialSolution: number[];
  evalMatch: number;
  leftElements: number[];
}): number => {
  const minPlayerMatch = evalMatch * 4;
  const maxPlayerMatch = minPlayerMatch + 4;
  let score = 0;
  for (let i = minPlayerMatch; i < maxPlayerMatch; i++) {
    if (i < partialSolution.length) {
      score =
        score +
        scorePlayer({
          playWith,
          playAgainst,
          players,
          partialSolution,
          evalPlayer: i,
          leftElements,
        });
    } else {
      const restPlayers = players
        .filter((p, index) => leftElements.includes(index))
        .map((p) => p);
      score =
        score +
        playWith.getMaxScore(players[i].id, restPlayers, players[i].guest) +
        2 *
          playAgainst.getMaxScore(players[i].id, restPlayers, players[i].guest);
    }
  }
  return score;
};

export const estimatePartialSolutionWeight = ({
  playWith,
  playAgainst,
  players,
  partialSolution,
  leftElements,
}: {
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  players: UserParticipantWithMatches[];
  partialSolution: number[];
  leftElements: number[];
}): { score: number; partialScore: number } => {
  const matches = Math.ceil(players.length / 4);
  let score = 0;
  let partialScore = 0;
  const fullMatches = Math.ceil(partialSolution.length / 4);
  for (let i = 0; i < matches; i++) {
    const matchScore = scoreMatch({
      playWith,
      playAgainst,
      players,
      partialSolution,
      evalMatch: i,
      leftElements,
    });
    score = score + matchScore;
    if (i < fullMatches) {
      partialScore = score;
    }
  }
  return { score, partialScore };
};

export const expand = ({
  p,
  elements,
  partialSolution,
  players,
  playWith,
  playAgainst,
  maxScore,
  scoreCache,
  partialScoreCache,
}: {
  p: MaxPriorityQueue<NodeItem>;
  elements: Array<number>;
  partialSolution: Array<number>;
  players: UserParticipantWithMatches[];
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  maxScore: number;
  scoreCache: Map<string, number>;
  partialScoreCache: Map<string, number>;
}): void => {
  for (let i = 0; i < elements.length; i++) {
    const partSolution = [...partialSolution, elements[i]];
    const cacheKey = buildCacheKey(partSolution);
    // let score = scoreCache.get(cacheKey);
    let partialScore = partialScoreCache.get(cacheKey) ?? 0;
    const leftElements = [...elements.slice(0, i), ...elements.slice(i + 1)];
    // if (!score) {
    const { score: estimatedScore, partialScore: partScore } =
      estimatePartialSolutionWeight({
        playWith,
        playAgainst,
        players,
        partialSolution: partSolution,
        leftElements,
      });
    // score = estimatedScore;
    partialScore = partScore;
    // updateCache(scoreCache, cacheKey, score);
    // updateCache(partialScoreCache, cacheKey, partialScore);
    //}
    const item: NodeItem = {
      solution: partSolution,
      elements: leftElements,
      score: estimatedScore,
      partialScore,
    };
    if (estimatedScore > maxScore) {
      p.add(item);
    }
  }
};

export const buildCacheKey = (items: Array<number>): string => {
  return [...items].sort().join('-');
};

const updateCache = (
  cache: Map<string, number>,
  key: string,
  score: number,
) => {
  if (!cache.has(key)) {
    cache.set(key, score);
  }
};

export const generateMatching = ({
  initialSolution,
  players,
  playWith,
  playAgainst,
}: {
  initialSolution?: UserParticipantWithMatches[];
  players: UserParticipantWithMatches[];
  playWith: MemoryTable;
  playAgainst: MemoryTable;
}): { solution: number[]; score: number } => {
  const scoreCache = new Map<string, number>();
  const partialScoreCache = new Map<string, number>();
  const p = createMinPriorityQueue();

  const elements = players.map((_, index) => index);

  let item = null;
  let finalSolution = initialSolution
    ? initialSolution.map((_, index) => index)
    : players.map((_, index) => index);
  let maxScore = estimatePartialSolutionWeight({
    playWith,
    playAgainst,
    players,
    partialSolution: finalSolution,
    leftElements: [],
  }).score;

  expand({
    p,
    elements,
    partialSolution: [],
    players,
    playWith,
    playAgainst,
    maxScore,
    scoreCache,
    partialScoreCache,
  });

  while (!p.isEmpty()) {
    item = p.poll();
    if (item) {
      const { solution, elements } = item;

      if (item.elements.length === 0) {
        if (item.score > maxScore) {
          maxScore = item.score;
          finalSolution = [...item.solution];
        }
      } else {
        if (item.score > maxScore) {
          expand({
            p,
            elements,
            partialSolution: solution,
            players,
            playWith,
            playAgainst,
            maxScore,
            scoreCache,
            partialScoreCache,
          });
        }
      }
    }
  }
  return { solution: finalSolution, score: maxScore };
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
  const { playWith, playAgainst } = buildMemoryTables(playedMatches);
  const sortedPlayers = [
    ...sortPlayersByMatchesPlayed({ players, playWith }),
  ].reverse();

  const initialSolution = buildInitialSolution(sortedPlayers);
  const matches: { matches: Match[]; score: number }[] = [];
  const partitions: Map<number, number[][]> = new Map<number, number[][]>([
    [
      0,
      [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11],
      ],
    ],
    [
      1,
      [
        [2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 10, 11],
      ],
    ],
    [
      2,
      [
        [0, 1, 4, 5, 6, 7, 8, 11],
        [2, 3, 9, 10],
      ],
    ],
  ]);

  for (let iterRounds = 0; iterRounds < rounds; iterRounds++) {
    const round = new Array<Match>();
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

    const mappedSol8 = solution8.map((it) => elements8[it]);
    buildMatches({
      solution: mappedSol8,
      rounds: round,
      players: initialSolution,
      playWith,
      playAgainst,
      leagueId,
      date,
      round: iterRounds,
    });

    const { solution: solution4, score: score4 } = generateMatching({
      initialSolution: players4,
      playAgainst,
      playWith,
      players: players4,
    });

    const mappedSol4 = solution4.map((it) => elements4[it]);

    buildMatches({
      solution: mappedSol4,
      rounds: round,
      players: initialSolution,
      playWith,
      playAgainst,
      leagueId,
      date,
      round: iterRounds,
    });

    matches.push({ matches: round, score: score4 + score8 });
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
  const { playWith, playAgainst } = buildMemoryTables(playedMatches);
  const sortedPlayers = [
    ...sortPlayersByMatchesPlayed({ players, playWith }),
  ].reverse();

  const initialSolution = buildInitialSolution(sortedPlayers);
  const matches: { matches: Match[]; score: number }[] = [];
  for (let iterRounds = 0; iterRounds < rounds; iterRounds++) {
    const { solution, score } = generateMatching({
      initialSolution,
      playAgainst,
      playWith,
      players: sortedPlayers,
    });
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
    }
    const aMatches = a.playedMatches;
    const bMatches = b.playedMatches;
    return aMatches - bMatches;
  });
};
