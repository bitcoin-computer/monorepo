import { Id, Rev, Root, Contract } from '@bitcoin-computer/lib';
import { TBC20, TBC20ConstructorParams } from './tbc20.js';
export type Constructor<T> = new (...args: any[]) => T;
export type Amount = bigint;
export type DepositEntry = [Root, Rev];
export type ClaimEntry = [Root, Id, Amount];
export type ClaimAmountEntry = [Id, Amount];
export declare abstract class Escrow extends Contract {
    deposits: DepositEntry[];
    withdraws: ClaimEntry[];
    finalWithdraws: ClaimEntry[];
}
export type CompatibilityValidator = (candidate: any) => Promise<boolean>;
export type AuditResult = {
    totalDeposited: bigint;
    totalRegularAuthorized: bigint;
    totalFinalAuthorized: bigint;
    regularClaimable: bigint;
    finalClaimable: bigint;
    availableBalance: bigint;
};
export declare class EscrowAuditor {
    static walkHistory(rev: Rev): Promise<Escrow[]>;
    static collectRevisions(states: Escrow[], lineage: Root): {
        depositRevs: Set<Rev>;
        withdrawEntries: Set<ClaimAmountEntry>;
        finalEntries: Set<ClaimAmountEntry>;
    };
    static sumDeposits(depositRevs: Set<Rev>, escrow: Id, token: TBC777): Promise<bigint>;
    static sumClaims(entries: Set<ClaimAmountEntry>): bigint;
    static getAudit(states: Escrow[], token: TBC777): Promise<AuditResult>;
    static audit(escrowRev: Rev, token: TBC777): Promise<AuditResult>;
}
export type TBC777Params = TBC20ConstructorParams & {
    remoteRoot?: string;
    withdrawn?: Rev[];
    finalWithdrawn?: Rev[];
    escrow?: Id;
};
export declare class TBC777 extends TBC20 {
    remoteRoot?: string;
    withdrawn: Rev[];
    finalWithdrawn: Rev[];
    escrow?: Id;
    private static readonly CLEAN_STATE;
    constructor(args: TBC777Params);
    get root(): string;
    merge(): never;
    transfer(to: string, amount?: bigint): this;
    protected _createTransferToken(to: string, amount: bigint): this;
    deposit(escrow: Id, deposit: Amount): void;
    getBalance(escrowRev: Rev): Promise<bigint>;
    get depositTuple(): DepositEntry;
    get isValidDeposit(): CompatibilityValidator;
    withdraw(rev: Rev): Promise<void>;
    finalWithdraw(rev: Rev): Promise<void>;
    private _withdraw;
    isEqualTo(other: TBC777): Promise<boolean>;
    sameLineage(other: TBC777): boolean;
    private _semanticEqualTo;
    static getSignature(token: TBC777): Promise<any>;
    static computeDepositAmount(depositData: any, escrow: Id, lineage: Root): Promise<bigint>;
    static isValidMint(token: TBC777): Promise<boolean>;
    static makeRegex(exp: string): RegExp;
}
