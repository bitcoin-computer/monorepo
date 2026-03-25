import type { Contract } from '@bitcoin-computer/lib/contract-env'
declare const Contract: Contract

import '@bitcoin-computer/lib'
class Counter extends Contract {
  n: number

  constructor() {
    super({ n: 0 })
  }

  inc() {
    this.n += 1
  }
}

export { Counter }
