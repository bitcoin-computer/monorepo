import { Token } from '@bitcoin-computer/TBC20';
import { Contract } from '@bitcoin-computer/lib';
type ElectionType = {
    proposalMod: string;
    tokenRoot: string;
    description: string;
};
type VoteType = {
    electionId: string;
    tokens: Token[];
    vote: 'accept' | 'reject';
};
export declare class Election extends Contract {
    proposalMod: string;
    tokenRoot: string;
    description: string;
    constructor({ proposalMod, tokenRoot, description }: ElectionType);
    proposalVotes(): Promise<string[]>;
    private validVotes;
    validRevVotes(): Promise<string[]>;
    accepted(): Promise<bigint>;
    rejected(): Promise<bigint>;
}
export declare class Vote extends Contract {
    tokensAmount: bigint;
    vote: 'accept' | 'reject';
    electionId: string;
    tokenRoot: string;
    constructor({ electionId, tokens, vote }: VoteType);
}
declare const _default: {
    Election: typeof Election;
    Vote: typeof Vote;
};
export default _default;
