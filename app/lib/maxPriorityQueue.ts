import { MaxPriorityQueue } from 'data-structure-typed';

export type NodeItem = {
  solution: Array<number>;
  elements: Array<number>;
  score: number;
};

const comparator = (a: NodeItem, b: NodeItem): number => {
  if (a.score < b.score) {
    return 1;
  }
  if (a.score > b.score) {
    return -1;
  }
  return 0;
};

export const createMaxPriorityQueue = (): MaxPriorityQueue<NodeItem> => {
  return new MaxPriorityQueue<NodeItem>([], {
    comparator,
  });
};
