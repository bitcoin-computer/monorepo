import { Computer, Transaction } from '@bitcoin-computer/lib';
import { networks } from '@bitcoin-computer/nakamotojs';
import { Buffer } from 'buffer';
import { ECPairInterface } from 'ecpair';
export declare const NotEnoughFundError = "Not enough funds to create chess game.";
type PaymentType = {
    amount: number;
    publicKeyW: string;
    publicKeyB: string;
    operatorPublicKey: string;
};
export declare class Payment extends Contract {
    constructor({ amount, publicKeyW, publicKeyB, operatorPublicKey }: PaymentType);
}
type WinnerTxWrapperType = {
    publicKeyW: string;
    publicKeyB: string;
    operatorPublicKey: string;
};
export declare class WinnerTxWrapper extends Contract {
    redeemTxHex: string;
    constructor({ publicKeyW, publicKeyB, operatorPublicKey }: WinnerTxWrapperType);
    setRedeemHex(txHex: string): void;
}
export declare class ChessContract extends Contract {
    amount: number;
    nameW: string;
    nameB: string;
    publicKeyW: string;
    publicKeyB: string;
    operatorPublicKey: string;
    sans: string[];
    fen: string;
    payment: Payment;
    winnerTxWrapper: WinnerTxWrapper;
    constructor(amount: number, nameW: string, nameB: string, publicKeyW: string, publicKeyB: string, operatorPublicKey: string);
    setRedeemHex(txHex: string): void;
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
    operatorPublicKey?: string;
    mod?: string;
    userMod?: string;
    constructor({ computer, amount, nameW, nameB, publicKeyW, publicKeyB, operatorPublicKey, mod, userMod, }: {
        computer: Computer;
        amount?: number;
        nameW?: string;
        nameB?: string;
        publicKeyW?: string;
        publicKeyB?: string;
        operatorPublicKey?: string;
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
    spend(chessContract: ChessContract, fee?: number): Promise<void>;
    spendWithConfirmationFromOperator(txId: string, chessContract: ChessContract, fee?: number): Promise<void>;
    static validateAndSignRedeemTx(redeemTx: Transaction, winnerPublicKey: Buffer, validatorKeyPair: ECPairInterface, expectedRedeemScript: Buffer, network: networks.Network, playerWIsTheValidator?: boolean): Transaction;
}
export {};
