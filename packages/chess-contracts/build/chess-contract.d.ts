import { Computer, Transaction } from '@bitcoin-computer/lib';
export declare const NotEnoughFundError = "Not enough funds to create chess game.";
type PaymentType = {
    amount: bigint;
    publicKeyW: string;
    secretHashW: string;
    publicKeyB: string;
    secretHashB: string;
};
export declare class Payment extends Contract {
    constructor({ amount, publicKeyW, publicKeyB, secretHashW, secretHashB }: PaymentType);
}
export declare class ChessContract extends Contract {
    amount: bigint;
    nameW: string;
    nameB: string;
    publicKeyW: string;
    publicKeyB: string;
    secretHashW: string;
    secretHashB: string;
    sans: string[];
    fen: string;
    payment: Payment;
    constructor(amount: bigint, nameW: string, nameB: string, publicKeyW: string, publicKeyB: string, secretHashW: string, secretHashB: string);
    move(from: string, to: string): string;
    isGameOver(): boolean;
}
export declare class ChessContractHelper {
    computer: Computer;
    amount?: bigint;
    nameW?: string;
    nameB?: string;
    publicKeyW?: string;
    publicKeyB?: string;
    secretHashW?: string;
    secretHashB?: string;
    mod?: string;
    constructor({ computer, amount, nameW, nameB, publicKeyW, publicKeyB, secretHashW, secretHashB, mod, }: {
        computer: Computer;
        amount?: bigint;
        nameW?: string;
        nameB?: string;
        publicKeyW?: string;
        publicKeyB?: string;
        secretHashW?: string;
        secretHashB?: string;
        mod?: string;
    });
    isInitialized(): this is Required<ChessContractHelper>;
    static fromContract(computer: Computer, game: ChessContract, mod?: string): ChessContractHelper;
    getASM(): string;
    makeTx(): Promise<Transaction>;
    completeTx(tx: Transaction): Promise<string>;
    move(chessContract: ChessContract, from: string, to: string): Promise<{
        newChessContract: ChessContract;
        isGameOver: boolean;
    }>;
    spend(chessContract: ChessContract, fee?: bigint): Promise<string>;
    spendWithSecret(txId: string, secret: string, spendingPath: number, fee?: bigint): Promise<string>;
}
export {};
