export class Counter extends Contract {
  count!: number
  constructor() {
    super({ count: 0 })
  }

  inc() {
    this.count += 1
  }
}
