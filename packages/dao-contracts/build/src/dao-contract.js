import { Contract } from '@bitcoin-computer/lib';
export class Election extends Contract {
    constructor({ proposalMod, tokenRoot, description }) {
        super({ proposalMod, tokenRoot, description });
    }
    regexEscape(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    normalize(str) {
        return str
            .replace(/\s+/g, '')
            .replace(/,([})])/g, '$1')
            .trim();
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
        const module = await computer.load(this.proposalMod);
        const voteClassStr = module['Vote'].toString();
        const normalizedClass = this.normalize(voteClassStr);
        const regex = new RegExp('^' +
            this.regexEscape(normalizedClass) +
            "newVote\\({electionId:'" +
            this.regexEscape(this._id) +
            "',tokens:\\[(__bc\\d+__(?:,__bc\\d+__)*)\\],vote:'(accept|reject)'\\}\\)$");
        const isValid = await Promise.all(resolved.map(async (r) => {
            const decoded = await computer.decode(r._rev.substring(0, 64));
            const normExp = this.normalize(decoded.exp);
            const match = regex.exec(normExp);
            if (!match)
                return false;
            const tokensStr = match[1];
            const voteFromExp = match[2];
            if (voteFromExp !== r.vote)
                return false;
            const tokenPlaceholders = tokensStr.split(',');
            const indices = tokenPlaceholders.map((ph) => {
                const m = ph.match(/^__bc(\d+)__$/);
                if (!m)
                    return NaN;
                return parseInt(m[1], 10);
            });
            if (indices.some(isNaN) || indices.length < 1)
                return false;
            for (let i = 0; i < indices.length; i++) {
                if (indices[i] !== i)
                    return false;
            }
            return true;
        }));
        return resolved.filter((r, i) => r.electionId === this._id && r.tokenRoot === this.tokenRoot && isValid[i]);
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