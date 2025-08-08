/* eslint-disable  @typescript-eslint/ban-ts-comment */
import { Buffer } from 'buffer';
import { Contract } from '@bitcoin-computer/lib';
if (typeof global !== 'undefined')
    global.Buffer = Buffer;
export class Election extends Contract {
    constructor({ voteMod, description }) {
        super({ voteMod, description });
    }
    intersect(a, b) {
        const set1 = new Set(a);
        const result = new Set();
        for (const item of b) {
            if (set1.has(item)) {
                result.add(item);
            }
        }
        return Array.from(result);
    }
    async validVotes(revs) {
        const voteTxIdsSet = new Set(revs.map(r => r.split(':')[0]));
        const validVotes = new Set(voteTxIdsSet);
        for (const voteTxId of voteTxIdsSet) {
            // @ts-ignore
            const ancestors = await computer.db.wallet.restClient.getAncestors(voteTxId);
            const ancestorsSet = new Set(ancestors);
            ancestorsSet.delete(voteTxId);
            if ([...ancestorsSet].some(voteTxIdsSet.has, voteTxIdsSet)) {
                validVotes.delete(voteTxId);
            }
        }
        return Array.from(validVotes);
    }
    async acceptingVotes() {
        // @ts-ignore
        const revs = await computer.query({ mod: this.voteMod });
        const validVotes = await this.validVotes(revs);
        // @ts-ignore
        const resolved = (await Promise.all(validVotes.map((txId) => computer.sync(txId)))).map((obj) => obj.res);
        const acceptedVotes = [...resolved].filter((r) => r.vote === 'accept' && r.electionId === this._id);
        const count = acceptedVotes.reduce((acc, curr) => acc + curr.tokensAmount, 0n);
        return count;
    }
}
export class Vote extends Contract {
    constructor({ electionId, tokens, vote }) {
        super({ electionId, tokensAmount: tokens.reduce((acc, curr) => acc + curr.amount, 0n), vote });
    }
}
export default { Election, Vote };
//# sourceMappingURL=dao-contract.js.map