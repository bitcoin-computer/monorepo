import { Token } from '@bitcoin-computer/TBC20';
import { Contract } from '@bitcoin-computer/lib';
type ElectionType = {
    voteMod: string;
    description: string;
};
type VoteType = {
    electionId: string;
    tokens: Token[];
    vote: 'accept' | 'reject';
};
export declare class Election extends Contract {
    voteMod: string;
    description: string;
    constructor({ voteMod, description }: ElectionType);
    validVotes(): Promise<string[]>;
    acceptingVotes(): Promise<bigint>;
}
export declare class Vote extends Contract {
    tokensAmount: bigint;
    vote: 'accept' | 'reject';
    electionId: string;
    constructor({ electionId, tokens, vote }: VoteType);
}
declare const _default: {
    Election: typeof Election;
    Vote: typeof Vote;
};
export default _default;
