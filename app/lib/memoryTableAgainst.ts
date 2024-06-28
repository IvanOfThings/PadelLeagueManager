import { MemoryTable } from './memoryTable';

export class MemoryTableAgainst extends MemoryTable {
  constructor(weights?: number[]) {
    super(weights ? weights : [130, 50, 15, 1]);
  }
}
