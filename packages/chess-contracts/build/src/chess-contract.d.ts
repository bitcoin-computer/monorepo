import { Computer, Transaction } from '@bitcoin-computer/lib';
import { networks } from '@bitcoin-computer/nakamotojs';
import { Buffer } from 'buffer';
import { ECPairInterface } from 'ecpair';
export declare const NotEnoughFundError = "Not enough funds to create chess game.";
type PaymentType = {
    satoshis: bigint;
    publicKeyW: string;
    publicKeyB: string;
};
export declare class Payment extends Contract {
    constructor({ satoshis, publicKeyW, publicKeyB }: PaymentType);
}
type WinnerTxWrapperType = {
    publicKeyW: string;
    publicKeyB: string;
};
export declare class WinnerTxWrapper extends Contract {
    redeemTxHex: string;
    constructor({ publicKeyW, publicKeyB }: WinnerTxWrapperType);
    setRedeemHex(txHex: string): void;
}
export declare class ChessContract extends Contract {
    satoshis: bigint;
    nameW: string;
    nameB: string;
    publicKeyW: string;
    publicKeyB: string;
    sans: string[];
    fen: string;
    payment: Payment;
    winnerTxWrapper: WinnerTxWrapper;
    constructor(satoshis: bigint, nameW: string, nameB: string, publicKeyW: string, publicKeyB: string);
    setRedeemHex(txHex: string): void;
    move(from: string, to: string, promotion: string): string;
    isGameOver(): boolean;
}
export declare class ChessContractHelper {
    computer: Computer;
    satoshis?: bigint;
    nameW?: string;
    nameB?: string;
    publicKeyW?: string;
    publicKeyB?: string;
    mod?: string;
    userMod?: string;
    constructor({ computer, satoshis, nameW, nameB, publicKeyW, publicKeyB, mod, userMod, }: {
        computer: Computer;
        satoshis?: bigint;
        nameW?: string;
        nameB?: string;
        publicKeyW?: string;
        publicKeyB?: string;
        mod?: string;
        userMod?: string;
    });
    isInitialized(): this is Required<ChessContractHelper>;
    static fromContract(computer: Computer, game: ChessContract, mod?: string, userMod?: string): ChessContractHelper;
    getASM(): string;
    validateUser(): Promise<void>;
    makeTx(): Promise<Transaction>;
    completeTx(tx: Transaction): Promise<string>;
    move(chessContract: ChessContract, from: string, to: string, promotion: string): Promise<{
        newChessContract: ChessContract;
        isGameOver: boolean;
    }>;
    spend(chessContract: ChessContract, fee?: bigint): Promise<void>;
    spendWithConfirmation(txId: string, chessContract: ChessContract, fee?: bigint): Promise<void>;
    static validateAndSignRedeemTx(redeemTx: Transaction, winnerPublicKey: Buffer, validatorKeyPair: ECPairInterface, expectedRedeemScript: Buffer, network: networks.Network, playerWIsTheValidator?: boolean): Transaction;
}
export declare const signRedeemTx: (computer: Computer, chessContract: ChessContract, txWrapper: WinnerTxWrapper) => Promise<Transaction>;
export {};
