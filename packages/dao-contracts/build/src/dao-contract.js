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
    async acceptingVotes() {
        // @ts-ignore
        const revs = await computer.query({ mod: this.voteMod });
        // remove duplicated entries :> possible problem, if we transfer the token, we have
        // txId_A:0, txId_A:1, then we are skipping the tx with the new token?
        const txIdsSet = new Set(revs.map((r) => r.split(':')[0]));
        const txIds = Array.from(txIdsSet);
        const result = txIds;
        for (const id of txIds) {
            // @ts-ignore
            const ancestors = await computer.db.wallet.restClient.getAncestors(id);
            // id belongs to the ancestors, we should remove it before checking intersect
            const index = ancestors.indexOf(id);
            if (index !== -1)
                ancestors.splice(index, 1);
            const notNew = this.intersect(ancestors, txIds).length > 0;
            if (notNew) {
                const index = result.indexOf(id);
                if (index !== -1)
                    result.splice(index, 1);
            }
        }
        // @ts-ignore
        const resolved = (await Promise.all(result.map((txId) => computer.sync(txId)))).map((obj) => obj.res);
        const acceptedVotes = [...resolved].filter((r) => r.vote === 'accept' && r.electionId === this._id);
        let count = 0n;
        for (const v of acceptedVotes) {
            // sync to tokens
            // @ts-ignore
            const tokens = await Promise.all(v.tokenRevs.map((rev) => computer.sync(rev)));
            count += tokens.reduce((acc, curr) => acc + curr.amount, 0n);
        }
        return count;
    }
}
export class Vote extends Contract {
    constructor({ electionId, tokens, vote }) {
        super({ electionId, tokenRevs: tokens.map(t => t._rev), vote });
    }
}
export default { Election, Vote };
//# sourceMappingURL=dao-contract.js.map