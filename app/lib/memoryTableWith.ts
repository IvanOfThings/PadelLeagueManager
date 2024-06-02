import { MemoryTable } from './memoryTable';

export class MemoryTableWith extends MemoryTable {
  constructor(weights?: number[]) {
    super(weights ? weights : [150, 130, 25, 15, 0]);
  }

  public getScore(
    player1: string,
    player2: string,
    isGuest: boolean = false,
  ): number {
    /*
    const matchesCount =
      [...(this.data.get(player1) ?? []).values()].reduce(
        (acc, curr) => acc + curr,
        0,
      ) + 1;
      */
    const result = this.getInternalScore(player1, player2, isGuest);
    return result;
    /*
    if (result > 0) {
      return result / matchesCount;
    } else {
      return result * matchesCount;
    }*/
  }
}
