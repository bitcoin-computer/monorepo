import type { Contract as GlobalContract } from './contract.js'
import type { InnerComputer } from './inner-computer.js'

// The global `computer` is declared by the package entry (`index`), so any
// import from `@bitcoin-computer/lib` defines it. This subpath still exports
// the type for existing imports.

export type Contract = typeof GlobalContract & {
  new (...args: any[]): InstanceType<typeof GlobalContract>
}

export type { InnerComputer }
