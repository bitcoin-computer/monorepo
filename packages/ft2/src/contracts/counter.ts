export class Counter extends Contract {
  constructor() {
    super({ count: 0 })
  }

  inc() {
    this.count += 1
  }
}
