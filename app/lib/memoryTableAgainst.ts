import { MemoryTable } from './memoryTable';

export class MemoryTableAgainst extends MemoryTable {
  constructor(weights?: number[]) {
    super(weights ? weights : [30, 10, 5, 1]);
  }
}
