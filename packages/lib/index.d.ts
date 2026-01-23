/// <reference path="./computer.d.ts" />

import { Contract as ContractGlobal, Computer, Mock, Transaction } from './computer'

declare global {
  var Contract: typeof ContractGlobal
  var computer: Computer
}

export { Computer, ContractGlobal as Contract, Mock, Transaction }
