export class Counter extends Contract {
  count!: number
  constructor() {
    super({ count: 0 })
  }

  inc(num: number) {
    this.count += num
  }

  transfer(publicKey: string) {
    this.setOwners([publicKey])
  }
}
