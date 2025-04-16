import { Computer, Transaction } from '@bitcoin-computer/lib';
import { networks } from '@bitcoin-computer/nakamotojs';
import { Buffer } from 'buffer';
import { ECPairInterface } from 'ecpair';
export declare const NotEnoughFundError = "Not enough funds to create chess game.";
type PaymentType = {
    amount: number;
    publicKeyW: string;
    publicKeyB: string;
};
export declare class Payment extends Contract {
    constructor({ amount, publicKeyW, publicKeyB }: PaymentType);
}
export declare class ChessContract extends Contract {
    amount: number;
    nameW: string;
    nameB: string;
    publicKeyW: string;
    publicKeyB: string;
    sans: string[];
    fen: string;
    payment: Payment;
    constructor(amount: number, nameW: string, nameB: string, publicKeyW: string, publicKeyB: string);
    move(from: string, to: string, promotion: string): string;
    isGameOver(): boolean;
}
export declare class ChessContractHelper {
    computer: Computer;
    amount?: number;
    nameW?: string;
    nameB?: string;
    publicKeyW?: string;
    publicKeyB?: string;
    mod?: string;
    userMod?: string;
    constructor({ computer, amount, nameW, nameB, publicKeyW, publicKeyB, mod, userMod, }: {
        computer: Computer;
        amount?: number;
        nameW?: string;
        nameB?: string;
        publicKeyW?: string;
        publicKeyB?: string;
        secretHashW?: string;
        secretHashB?: string;
        mod?: string;
        userMod?: string;
    });
    isInitialized(): this is Required<ChessContractHelper>;
    static fromContract(computer: Computer, game: ChessContract, mod?: string, userMod?: string): ChessContractHelper;
    getASM(): string;
    makeTx(): Promise<Transaction>;
    completeTx(tx: Transaction): Promise<string>;
    move(chessContract: ChessContract, from: string, to: string, promotion: string): Promise<{
        newChessContract: ChessContract;
        isGameOver: boolean;
    }>;
    spend(chessContract: ChessContract, fee?: number): Promise<string>;
    spendWithConfirmationFromOperator(txId: string, fee?: number): Promise<string>;
    static validateAndSignRedeemTx(redeemTx: Transaction, winnerPublicKey: Buffer, operatorKeyPair: ECPairInterface, expectedRedeemScript: Buffer, network: networks.Network): Transaction;
}
export {};
