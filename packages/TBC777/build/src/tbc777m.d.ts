import { TBC20, type TBC20ConstructorParams } from './tbc20.js';
export declare abstract class Escrow extends Contract {
    deposits: [string, string][];
    withdraws: [string, string, bigint][];
    finalWithdraws: [string, string, bigint][];
}
export declare class TBC777M extends TBC20 {
    withdrawn: string[];
    finalWithdrawn: string[];
    escrowId: string | undefined;
    constructor(args: TBC20ConstructorParams);
    deposit(escrowId: string, deposit: bigint): void;
    withdraw(rev: string): Promise<void>;
    withdrawFinal(rev: string): Promise<void>;
    static computeWithdraw(rev: string, _id: string, _root: string): Promise<bigint>;
    static computeFinalWithdraw(rev: string, _id: string, _root: string): Promise<bigint>;
    static getBalance(rev: string, root: string): Promise<bigint>;
    static computeDeposits(states: Escrow[], root: string): Promise<bigint>;
    static computeDeposit(token: TBC777M, escrowId: string, root: string): Promise<bigint>;
    static computeWithdraws(states: Escrow[], root: string): Promise<bigint>;
    static computeFinalWithdraws(states: Escrow[], root: string): Promise<bigint>;
}
