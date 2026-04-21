import { TBC20, type TBC20ConstructorParams } from './tbc20.js';
export declare abstract class Escrow extends Contract {
    depositRevs: string[];
    amountByWithdrawId: [string, bigint][];
}
export declare class TBC777P extends TBC20 {
    withdrawRevs: string[];
    escrowId: string | undefined;
    constructor(args: TBC20ConstructorParams);
    deposit(escrowId: string, deposit: bigint): void;
    withdraw(withdrawRev: string): Promise<void>;
    static computeMyWithdraw(withdrawRev: string, myId: string): Promise<bigint>;
    static isValidAtRev(withdrawRev: string, myRoot: string): Promise<boolean>;
    static computeDeposits(allStates: Escrow[], root: string): Promise<bigint>;
    static computeDeposit(token: TBC777P, escrowId: string, root: string): Promise<bigint>;
    static computeWithdraws(allStates: Escrow[]): Promise<bigint>;
}
