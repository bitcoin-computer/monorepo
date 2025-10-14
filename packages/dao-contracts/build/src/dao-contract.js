import { Contract } from '@bitcoin-computer/lib';
export class Election extends Contract {
    constructor({ proposalMod, tokenRoot, description }) {
        super({ proposalMod, tokenRoot, description });
    }
    async proposalVotes() {
        const revs = await computer.getTXOs({ mod: this.proposalMod });
        const voteTxIdsSet = new Set(revs.map((r) => r.split(':')[0]));
        const validVotes = new Set(voteTxIdsSet);
        for (const voteTxId of voteTxIdsSet) {
            const ancestors = (await computer.getAncestors(voteTxId));
            const ancestorsSet = new Set(ancestors);
            ancestorsSet.delete(voteTxId);
            if ([...ancestorsSet].some(voteTxIdsSet.has, voteTxIdsSet)) {
                validVotes.delete(voteTxId);
            }
        }
        return Array.from(validVotes);
    }
    async validVotes() {
        const proposalVotes = await this.proposalVotes();
        const resolved = (await Promise.all(proposalVotes.map((txId) => computer.sync(txId)))).map(
        // @ts-expect-error type unknown
        (obj) => obj.res);
        return [...resolved].filter((r) => r.electionId === this._id && r.tokenRoot === this.tokenRoot);
    }
    async validRevVotes() {
        const votes = await this.validVotes();
        return votes.map((v) => v._rev);
    }
    async accepted() {
        const votes = await this.validVotes();
        return votes
            .filter((v) => v.vote === 'accept')
            .reduce((acc, curr) => acc + curr.tokensAmount, 0n);
    }
    async rejected() {
        const votes = await this.validVotes();
        return votes
            .filter((v) => v.vote === 'reject')
            .reduce((acc, curr) => acc + curr.tokensAmount, 0n);
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