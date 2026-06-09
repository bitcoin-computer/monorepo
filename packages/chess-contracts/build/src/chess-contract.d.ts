import { Computer, SmartContract } from '@bitcoin-computer/lib';
import { Contract } from '@bitcoin-computer/lib';
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
    /** Required by TBC777 `Escrow` interface (chess uses `withdraws` only). */
    finalWithdraws: [string, string, bigint][];
    root: string;
    tokenIdW: string;
    tokenIdB: string;
    /** Public key of the player who created the game (white / first depositor). */
    creatorPublicKey: string;
    constructor(root: string, wagerAmount: bigint, timeLimit: bigint);
    acceptDeposit(token: any, amount: bigint, name: string, nextOwner: string): Promise<void>;
    /**
     * Cancel a pending game before the opponent deposits. Refunds are authorized
     * via `withdraws` set in this method; the creator then claims with `withdrawTokens`.
     */
    cancel(): void;
    move(from: string, to: string, promotion: string): boolean;
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
    createGame(tokenRoot: string, wagerAmount: bigint, timeLimit?: bigint): Promise<SmartContract<typeof ChessContract>>;
    /**
     * Deposits wager tokens into a chess game. After the creator's first deposit
     * the invited opponent owns the contract and can accept without a co-sign.
     */
    depositTokens(chessRev: string, tokenRev: string, wagerAmount: bigint, name: string, nextOwner: string, coSignComputer?: Computer): Promise<SmartContract<typeof ChessContract>>;
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
    /**
     * Finds any token owned by the current user with at least minAmount balance.
     * Used when creating a new game to auto-detect which token to wager.
     */
    findAnyToken(minAmount: bigint): Promise<{
        _rev: string;
        _root: string;
        _id: string;
        amount: bigint;
    } | null>;
    /** True when both players have deposited and the game is playable. */
    isGameStarted(chess: SmartContract<typeof ChessContract>): boolean;
    /** True when the creator canceled before the opponent deposited (refund claimed). */
    isPendingGameCanceled(chess: SmartContract<typeof ChessContract>): Promise<boolean>;
    /** True when waiting for the opponent's deposit (creator may cancel). */
    canCancel(chess: SmartContract<typeof ChessContract>): boolean;
    isCreator(chess: SmartContract<typeof ChessContract>): boolean;
    /**
     * Cancel a pending game before the opponent deposits. Sets `withdraws` on-chain
     * so the creator can claim their deposit with `withdrawTokens`.
     */
    cancelGame(chessId: string): Promise<SmartContract<typeof ChessContract>>;
    /** Cancel a pending game and withdraw the creator's wager in one flow. */
    cancelGameAndWithdraw(chessId: string): Promise<void>;
    /**
     * Resigns from the current game. Sets the withdraws array so the opponent
     * (winner) can call withdrawTokens. Can only be called by the current
     * contract owner (the player whose turn it is).
     */
    resign(chessId: string): Promise<SmartContract<typeof ChessContract>>;
}
