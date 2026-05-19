import { Computer, SmartContract } from '@bitcoin-computer/lib';
export declare class ChessContract extends Contract {
    wagerAmount: bigint;
    timeLimit: bigint;
    nameW: string;
    nameB: string;
    publicKeyW: string;
    publicKeyB: string;
    sans: string[];
    fen: string;
    deposits: [string, string][];
    withdraws: [string, string, bigint][];
    /** Required by TBC777M escrow audit (`isValid` / `computeFinalWithdraws`). */
    finalWithdraws: [string, string, bigint][];
    root: string;
    tokenIdW: string;
    tokenIdB: string;
    constructor(root: string, wagerAmount: bigint, timeLimit: bigint);
    acceptDeposit(token: any, amount: bigint, name: string, nextOwner: string): Promise<void>;
    move(from: string, to: string, promotion: string): boolean;
    claimWin(): void;
    resign(): void;
    isGameOver(): boolean;
    hasTimedOutW(): Promise<boolean>;
    hasTimedOutB(): Promise<boolean>;
    /**
     * Calculates white time (timeW) and black time (timeB) from a list of timestamps.
     * timeW = (t2 - t1) + (t4 - t3) + (t6 - t5) + ...
     * timeB = (t3 - t2) + (t5 - t4) + (t7 - t6) + ...
     *
     * Note: timeW + timeB will equal (tn - t1).
     */
    calculateTimes(): Promise<{
        timeW: bigint;
        timeB: bigint;
    }>;
}
export declare class ChessContractHelper {
    computer: Computer;
    mod?: string;
    userMod?: string;
    tokenMod?: string;
    constructor({ computer, mod, userMod, tokenMod, }: {
        computer: Computer;
        mod?: string;
        userMod?: string;
        tokenMod?: string;
    });
    static fromModSpecs(computer: Computer, mod?: string, userMod?: string, tokenMod?: string): ChessContractHelper;
    validateUser(): Promise<void>;
    createGame(tokenRoot: string, wagerAmount: bigint): Promise<SmartContract<typeof ChessContract>>;
    depositTokens(chessRev: string, tokenRev: string, wagerAmount: bigint, name: string, nextOwner: string): Promise<SmartContract<typeof ChessContract>>;
    findToken(tokenRoot: string, minAmount: bigint): Promise<{
        _rev: string;
        _root: string;
        _id: string;
        amount: bigint;
    } | null>;
    move(chessContract: SmartContract<typeof ChessContract>, from: string, to: string, promotion: string): Promise<{
        newChessContract: SmartContract<typeof ChessContract>;
        isGameOver: boolean;
    }>;
    withdrawTokens(tokenId: string, chessId: string): Promise<void>;
}
