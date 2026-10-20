import type { Contract as GlobalContract } from './contract.js'
import type { InnerComputer } from './inner-computer.js'

export type Contract = typeof GlobalContract & {
  new (...args: any[]): InstanceType<typeof GlobalContract>
}

declare global {
  const computer: InnerComputer
}

export type { InnerComputer }
