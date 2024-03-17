import { DEFAULT_MAX_VERSION } from 'tls';

export class MemoryTable {
  protected data: Map<string, Map<string, number>>;
  private coefficients: Map<number, number>;

  constructor(c: Array<number>) {
    this.data = new Map();
    this.coefficients = new Map();
    this.setCoefficients(c);
  }

  private _addItem(player1: string, player2: string): void {
    const player1Data = this.data.get(player1);
    if (player1Data) {
      const v = player1Data.get(player2);
      player1Data.set(player2, v ? v + 1 : 1);
    } else {
      this.data.set(player1, new Map([[player2, 1]]));
    }
  }
  public addItem(player1: string, player2: string): void {
    this._addItem(player1, player2);
    this._addItem(player2, player1);
  }

  public setCoefficients(c: number[]): void {
    c.forEach((value, index) => {
      this.coefficients.set(index, value);
    });
  }

  public getScore(
    player1: string,
    player2: string,
    isGuest: boolean = false,
  ): number {
    return this.getInternalScore(player1, player2, isGuest);
  }

  protected getInternalScore(
    player1: string,
    player2: string,
    isGuest: boolean = false,
  ): number {
    if (isGuest) return 0;
    const matches = this.data.get(player1)?.get(player2) ?? 0;
    return this.coefficients.get(matches) ?? 10;
  }

  public getMaxScore() {
    return this.coefficients.get(0) ?? 10;
  }

  public ToString(): string {
    const res = [...this.data.entries()].sort().map((f) => {
      const hh =
        '[' +
        f[0] +
        '|' +
        [...f[1].entries()]
          .sort()
          .map((j) => `[${j[0].toString()},${j[1].toString()}]`)
          .join('-') +
        ']';
      return hh;
    });
    return res.join(',');
  }
}
