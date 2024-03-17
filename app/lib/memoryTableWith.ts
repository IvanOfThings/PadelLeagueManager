import { MemoryTable } from './memoryTable';

export class MemoryTableWith extends MemoryTable {
  constructor() {
    super([25, 15, -5]);
  }

  public getScore(
    player1: string,
    player2: string,
    isGuest: boolean = false,
  ): number {
    const matchesCount =
      [...(this.data.get(player1) ?? []).values()].reduce(
        (acc, curr) => acc + curr,
        0,
      ) + 1;
    const result = this.getInternalScore(player1, player2, isGuest);
    if (result > 0) {
      return result / matchesCount;
    } else {
      return result * matchesCount;
    }
  }
}
