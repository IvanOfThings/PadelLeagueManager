import { MaxPriorityQueue } from 'data-structure-typed';
import { Match, User, UserParticipant } from './definitions';
import { MemoryTable } from './memoryTable';
import { NodeItem, createMaxPriorityQueue } from './maxPriorityQueue';
import { v4 as uuidv4 } from 'uuid';

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
  matchUsers: User[];
  playerIndex: number;
}): User[] => {
  const sorted = new Array<User>();
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
  players: User[];
  partialSolution: number[];
  evalPlayer: number;
}): User[] => {
  const { min, max } = obtainMinAndMax({ playerIndex: evalPlayer });
  const usersVector = new Array<User>();
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
}: {
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  players: UserParticipant[];
  partialSolution: number[];
  evalPlayer: number;
}): number => {
  const player = players[evalPlayer];
  const partner = players[evalPlayer + 1];
  if (player.guest) {
    if (partner.guest) {
      return 10;
    }
    return -15;
  }
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
  let score = 0;
  score =
    score +
    (partialUsersSortedArray[1]
      ? playWith.getScore(
          partialUsersSortedArray[0].id,
          partialUsersSortedArray[1].id,
        )
      : playWith.getMaxScore());
  score =
    score +
    (partialUsersSortedArray[2]
      ? playAgainst.getScore(
          partialUsersSortedArray[0].id,
          partialUsersSortedArray[2].id,
        )
      : playAgainst.getMaxScore());
  score =
    score +
    (partialUsersSortedArray[3]
      ? playAgainst.getScore(
          partialUsersSortedArray[0].id,
          partialUsersSortedArray[3].id,
        )
      : playAgainst.getMaxScore());
  return score;
};

export const scoreMatch = ({
  playWith,
  playAgainst,
  players,
  partialSolution,
  evalMatch,
}: {
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  players: UserParticipant[];
  partialSolution: number[];
  evalMatch: number;
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
        });
    } else {
      score = score + playWith.getMaxScore() + 2 * playAgainst.getMaxScore();
    }
  }
  return score;
};

export const estimatePartialSolutionWeight = ({
  playWith,
  playAgainst,
  players,
  partialSolution,
}: {
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  players: UserParticipant[];
  partialSolution: number[];
}) => {
  const matches = Math.ceil(players.length / 4);
  let score = 0;
  for (let i = 0; i < matches; i++) {
    const matchScore = scoreMatch({
      playWith,
      playAgainst,
      players,
      partialSolution,
      evalMatch: i,
    });
    score = score + matchScore;
  }
  return score;
};

export const expand = ({
  p,
  elements,
  partialSolution,
  players,
  playWith,
  playAgainst,
  maxScore,
}: {
  p: MaxPriorityQueue<NodeItem>;
  elements: Array<number>;
  partialSolution: Array<number>;
  players: UserParticipant[];
  playWith: MemoryTable;
  playAgainst: MemoryTable;
  maxScore: number;
}): void => {
  for (let i = 0; i < elements.length; i++) {
    const partSolution = [...partialSolution, elements[i]];
    const restElements = [...elements.slice(0, i), ...elements.slice(i + 1)];
    const score = estimatePartialSolutionWeight({
      playWith,
      playAgainst,
      players,
      partialSolution: partSolution,
    });
    if (score > maxScore) {
      p.add({ solution: partSolution, elements: restElements, score });
    }
  }
};

export const generateMatching = ({
  players,
  playWith,
  playAgainst,
}: {
  players: UserParticipant[];
  playWith: MemoryTable;
  playAgainst: MemoryTable;
}): number[] => {
  const memory = new Map<string, number>();
  const p = createMaxPriorityQueue();

  const solutionCache = new Map<string, number>();

  const elements = players.map((_, index) => index);

  let maxScore = 0;
  let item = null;
  let finalSolution = players.map((_, index) => index);

  expand({
    p,
    elements,
    partialSolution: [],
    players,
    playWith,
    playAgainst,
    maxScore,
  });

  while (!p.isEmpty()) {
    item = p.poll();
    if (item) {
      const { solution, elements } = item;

      if (item.elements.length === 0 && item.score > maxScore) {
        maxScore = item.score;
        finalSolution = item.solution;
      } else {
        expand({
          p,
          elements,
          partialSolution: solution,
          players,
          playWith,
          playAgainst,
          maxScore,
        });
      }
    }
  }
  return finalSolution;
};

export const buildMatchesFromList = ({
  players,
  leagueId,
  rounds,
  date,
}: {
  players: UserParticipant[];
  leagueId: string;
  playersCount: number;
  rounds: number;
  date: Date;
}): Match[][] => {
  const playWith = new MemoryTable([25, 15, -5]);
  const playAgainst = new MemoryTable([7, 5, 3, 2, 1]);
  const matches: Match[][] = [];
  for (let i = 0; i < rounds; i++) {
    const shuffledPlayers = generateMatching({
      playAgainst,
      playWith,
      players,
    });
    const round = new Array<Match>();
    for (let j = 0; j < shuffledPlayers.length; j += 4) {
      const driveLocal = shuffledPlayers[j];
      const reverseLocal = shuffledPlayers[j + 1];
      const driveVisitor = shuffledPlayers[j + 2];
      const reverseVisitor = shuffledPlayers[j + 3];
      round.push({
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
        round: i + 1,
        official: !(
          players[driveLocal].guest ||
          players[reverseLocal].guest ||
          players[driveVisitor].guest ||
          players[reverseVisitor].guest
        ),
      });
      playWith.addItem(players[driveLocal].id, players[reverseLocal].id);
      playWith.addItem(players[driveVisitor].id, players[reverseVisitor].id);
      playAgainst.addItem(players[driveLocal].id, players[driveVisitor].id);
      playAgainst.addItem(players[driveLocal].id, players[reverseVisitor].id);
      playAgainst.addItem(players[reverseLocal].id, players[driveVisitor].id);
      playAgainst.addItem(players[reverseLocal].id, players[reverseVisitor].id);
    }
    matches.push(round);
  }
  return matches;
};
