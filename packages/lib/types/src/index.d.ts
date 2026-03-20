import { Transaction } from './transaction.js';
import { Computer } from './computer.js';
import { Contract as GlobalContract } from './contract.js';
import { Mock } from './mock.js';
export { Computer, Mock, Transaction };
export type * from './types.js';
declare global {
    var Contract: typeof GlobalContract;
}
