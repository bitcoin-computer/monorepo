import { Transaction } from './transaction.js'
import { Computer } from './computer.js'
import { Contract } from './contract.js'
import { Mock } from './mock.js'
import { ModuleDecodeError } from './module-meta.js'
import type { InnerComputer } from './inner-computer.js'
export { Computer, Mock, Transaction, Contract, ModuleDecodeError }
export { precise, lifted, branded } from './types.js'
export type { InnerComputer, InnerTXOQuery } from './inner-computer.js'
export { INNER_GET_TXOS_PAGE_SIZE, INNER_TXO_QUERY_KEYS } from './inner-computer.js'
export type * from './types.js'
declare global {
  const computer: InnerComputer
}
