import { Computer } from '@bitcoin-computer/lib';
import type { Contract } from '@bitcoin-computer/lib/contract-env';
declare const Contract: Contract;
export declare class ChessChallengeTxWrapper extends Contract {
    chessGameTxHex: string;
    accepted: boolean;
    constructor(chessGameTxHex: string, publicKeyB: string);
    setAccepted(): void;
}
export declare class ChessChallengeTxWrapperHelper {
    computer: Computer;
    mod?: string;
    constructor({ computer, mod }: {
        computer: Computer;
        mod?: string;
    });
    createChessChallengeTxWrapper(chessGameTxHex: string, publicKeyB: string, ins: string[]): Promise<string>;
}
export {};
