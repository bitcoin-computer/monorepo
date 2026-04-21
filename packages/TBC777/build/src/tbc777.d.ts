import { Computer } from '@bitcoin-computer/lib';
import { TBC20, type TBC20ConstructorParams } from './tbc20.js';
declare global {
    const computer: Computer;
}
export {};
export declare abstract class Escrow extends Contract {
    claimable: [string, bigint][];
    status: string;
    constructor();
}
export declare class TBC777 extends TBC20 {
    escrow?: string;
    constructor(args: TBC20ConstructorParams);
    deposit(escrow: string, deposit: bigint): void;
    claim(rev: string): Promise<void>;
    private static computeDeposit;
}
