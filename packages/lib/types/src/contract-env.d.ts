import type { Contract as GlobalContract } from './contract.js'
import type { InnerComputer } from './inner-computer.js'

export type Contract = typeof GlobalContract
export type { InnerComputer }
