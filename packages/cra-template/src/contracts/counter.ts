const { Contract } = await import("@bitcoin-computer/lib")
export class Counter extends Contract {
  constructor() {
    super({ count: 0 })
  }

  inc() {
    // @ts-ignore
    this.count += 1
  }
}
