import { Set } from './definitions';
import { Set as SetPrisma } from '@prisma/client';

export const mapSet = (set: Set): SetPrisma => {
  return {
    id: set.id,
    localWins: set.localWins,
    localScore: set.localScore,
    visitorScore: set.visitorScore,
    matchId: set.matchId,
    setNumber: set.setNumber,
    localTieBreak: set.localTieBreak,
    visitorTieBreak: set.visitorTieBreak,
  };
};
