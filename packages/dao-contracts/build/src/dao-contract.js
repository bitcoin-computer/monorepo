import { Contract } from '@bitcoin-computer/lib';
export class Election extends Contract {
    constructor({ voteMod, description }) {
        super({ voteMod, description });
    }
    async validVotes() {
        const revs = await computer.getTXOs({ mod: this.voteMod });
        const voteTxIdsSet = new Set(revs.map((r) => r.split(':')[0]));
        const validVotes = new Set(voteTxIdsSet);
        for (const voteTxId of voteTxIdsSet) {
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
        const validVotes = await this.validVotes();
        const resolved = (await Promise.all(validVotes.map((txId) => computer.sync(txId)))).map(
        // @ts-expect-error type unknown
        (obj) => obj.res);
        const acceptedVotes = [...resolved].filter((r) => r.vote === 'accept' && r.electionId === this._id);
        const count = acceptedVotes.reduce((acc, curr) => acc + curr.tokensAmount, 0n);
        return count;
    }
}
export class Vote extends Contract {
    constructor({ electionId, tokens, vote }) {
        super({
            electionId,
            tokensAmount: tokens.reduce((acc, curr) => acc + curr.amount, 0n),
            vote,
        });
    }
}
export default { Election, Vote };
//# sourceMappingURL=dao-contract.js.map