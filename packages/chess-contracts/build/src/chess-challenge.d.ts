import { Computer } from '@bitcoin-computer/lib';
export declare class ChessChallengeTxWrapper extends Contract {
    chessRev: string;
    wagerAmount: bigint;
    tokenRoot: string;
    publicKeyW: string;
    accepted: boolean;
    constructor(chessRev: string, wagerAmount: bigint, tokenRoot: string, publicKeyW: string, publicKeyB: string);
    setAccepted(): void;
}
export declare class ChessChallengeTxWrapperHelper {
    computer: Computer;
    mod?: string;
    constructor({ computer, mod }: {
        computer: Computer;
        mod?: string;
    });
    createChessChallengeTxWrapper(chessRev: string, wagerAmount: bigint, tokenRoot: string, publicKeyW: string, publicKeyB: string): Promise<string>;
}
