/// <reference path="./computer.d.ts" />

import { Contract as ContractGlobal, Computer, Mock, Transaction, InnerComputer } from './computer'

declare global {
  var Contract: typeof ContractGlobal
  var computer: InnerComputer
}

export { Computer, ContractGlobal as Contract, Mock, Transaction }
