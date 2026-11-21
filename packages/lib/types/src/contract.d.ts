import { Contract as BaseContract } from './types.js'
export declare class Contract extends BaseContract {
  static [Symbol.hasInstance](obj: unknown): boolean
  constructor(opts?: Record<string, unknown>)
}
