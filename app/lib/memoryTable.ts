import { DEFAULT_MAX_VERSION } from 'tls';

export class MemoryTable {
  private data: Map<string, Map<string, number>>;
  private coefficients: Map<number, number>;

  constructor(c: Array<number>) {
    this.data = new Map();
    this.coefficients = new Map();
    this.setCoefficients(c);
  }

  private _addItem(player1: string, player2: string) {
    const player1Data = this.data.get(player1);
    if (player1Data) {
      const v = player1Data.get(player2);
      player1Data.set(player2, v ? v + 1 : 1);
    } else {
      this.data.set(player1, new Map([[player2, 1]]));
    }
  }
  public addItem(player1: string, player2: string) {
    this._addItem(player1, player2);
    this._addItem(player2, player1);
  }

  public setCoefficients(c: number[]) {
    c.forEach((value, index) => {
      this.coefficients.set(index, value);
    });
  }

  public getScore(player1: string, player2: string, isGuest: boolean = false) {
    if (isGuest) return 0;
    const matches = this.data.get(player1)?.get(player2) ?? 0;
    return this.coefficients.get(matches) ?? 10;
  }

  public getMaxScore() {
    return this.coefficients.get(0) ?? 10;
  }
}
