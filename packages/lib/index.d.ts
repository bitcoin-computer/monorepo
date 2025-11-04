/// <reference path="./computer.d.ts" />

import { Contract as ContractGlobal, Computer, Mock, Transaction, Transition } from './computer'

declare global {
  var Contract: typeof ContractGlobal
}

export { Computer, ContractGlobal as Contract, Mock, Transaction, Transition }
