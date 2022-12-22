import { Contract } from '@bitcoin-computer/lib'

class Counter extends Contract {
  n: number

  constructor() {
    super()
    this.n = 0
  }

  inc() {
    this.n += 1
  }
}

export { Counter }
