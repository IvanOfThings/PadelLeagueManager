import { MaxPriorityQueue } from 'data-structure-typed';

export type NodeItem = {
  solution: Array<number>;
  elements: Array<number>;
  score: number;
  partialScore: number;
};

const comparator = (a: NodeItem, b: NodeItem): number => {
  // let cmp = a.solution.length * 10000 - b.solution.length * 10000;
  /*
  if (a.solution.length < b.solution.length) {
    return -1;
  }
  if (a.solution.length > b.solution.length) {
    return 1;
  }
  */
  // cmp += a.partialScore * 10 - b.partialScore * 10;
  // cmp += a.score - b.score;
  return -1 * (a.partialScore - b.partialScore);

  /*
  if (a.partialScore < b.partialScore) {
    return -1;
  }
  if (a.partialScore > b.partialScore) {
    return 1;
  }
  return 0;
  */
};

export const createMinPriorityQueue = (): MaxPriorityQueue<NodeItem> => {
  return new MaxPriorityQueue<NodeItem>([], {
    comparator,
  });
};
