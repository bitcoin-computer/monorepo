
export class Counter extends Contract {
  constructor(n: number, name: string) {
    super({ n, name })
  }

  inc() {
    this.n += 1
  }
}