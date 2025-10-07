import { Contract } from '@bitcoin-computer/lib';
export class Election extends Contract {
    constructor({ proposalMod, tokenRoot, description }) {
        super({ proposalMod, tokenRoot, description });
    }
    async validVotes() {
        const revs = await computer.getTXOs({ mod: this.proposalMod });
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
        const acceptedVotes = [...resolved].filter((r) => r.vote === 'accept' && r.electionId === this._id && r.tokenRoot === this.tokenRoot);
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
            tokenRoot: tokens[0]._root,
        });
        // check that all tokens have the same root
        const tokenRoots = new Set(tokens.map((t) => t._root));
        if (tokenRoots.size > 1) {
            throw new Error('All tokens must have the same root');
        }
    }
}
export default { Election, Vote };
//# sourceMappingURL=dao-contract.js.map