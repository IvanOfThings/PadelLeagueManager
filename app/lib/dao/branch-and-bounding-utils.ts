import { MaxPriorityQueue } from 'data-structure-typed';
import { UserParticipant, UserParticipantWithMatches } from '../definitions';
import { NodeItem, createMinPriorityQueue } from '../maxPriorityQueue';
import { MemoryTable } from '../memoryTable';

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

export const obtainMinAndMax = ({
  playerIndex,
}: {
  playerIndex: number;
}): { max: number; min: number } => {
  const min = Math.floor(playerIndex / 4) * 4;
  const max = min + 3;

  return { max, min };
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

export const getPlayerPair = (playerIndex: number): number => {
  return playerIndex % 2 === 0 ? playerIndex + 1 : playerIndex - 1;
};

export const getPlayerRivals = (playerIndex: number): number => {
  const pairIndex = Math.floor(playerIndex / 2);
  const rivalPairIndex = pairIndex % 2 === 0 ? pairIndex + 1 : pairIndex - 1;
  return rivalPairIndex * 2;
};
