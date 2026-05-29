import { TBC20 } from './tbc20.js';
export class Escrow extends Contract {
}
export class EscrowAuditor {
    static async walkHistory(rev) {
        const states = [];
        let current = rev;
        while (current) {
            states.push((await computer.sync(current)));
            current = (await computer.prev(current));
        }
        return states;
    }
    static collectRevisions(states, lineage) {
        const depositRevs = new Set();
        const withdrawEntries = new Set();
        const finalEntries = new Set();
        if (states.length === 0)
            return { depositRevs, withdrawEntries, finalEntries };
        const [finalState] = states;
        for (const { deposits, withdraws } of states) {
            for (const [r, rev] of deposits) {
                if (r === lineage)
                    depositRevs.add(rev);
            }
            for (const [r, id, amt] of withdraws) {
                if (r === lineage)
                    withdrawEntries.add([id, amt]);
            }
        }
        for (const [r, id, amt] of finalState.finalWithdraws) {
            if (r === lineage)
                finalEntries.add([id, amt]);
        }
        return { depositRevs, withdrawEntries, finalEntries };
    }
    static async sumDeposits(depositRevs, escrow, token) {
        const getDepositAmount = async (rev) => {
            const deposit = await computer.sync(rev);
            if (!(await token.isValidDeposit(deposit)))
                return 0n;
            return await TBC777.computeDepositAmount(deposit, escrow, token.root);
        };
        const amounts = await Promise.all([...depositRevs].map(getDepositAmount));
        return amounts.reduce((sum, amt) => sum + amt, 0n);
    }
    static sumClaims(entries) {
        return [...entries].reduce((sum, [, amt]) => sum + amt, 0n);
    }
    static async getAudit(states, token) {
        if (states.length === 0) {
            return {
                totalDeposited: 0n,
                totalRegularAuthorized: 0n,
                totalFinalAuthorized: 0n,
                regularClaimable: 0n,
                finalClaimable: 0n,
                availableBalance: 0n,
                isTerminal: false,
            };
        }
        const lineage = token.root;
        const tokenId = token._id;
        const { depositRevs, withdrawEntries, finalEntries } = this.collectRevisions(states, lineage);
        const escrow = states[0]._id;
        const rev = states[0]._rev;
        const totalDeposited = await this.sumDeposits(depositRevs, escrow, token);
        const totalRegularAuthorized = this.sumClaims(withdrawEntries);
        const totalFinalAuthorized = this.sumClaims(finalEntries);
        const getClaimable = (entries) => entries
            .filter(([r, id]) => r === lineage && id === tokenId)
            .reduce((sum, [, , amt]) => sum + amt, 0n);
        const { withdraws, finalWithdraws } = states[0];
        const regularClaimable = getClaimable(withdraws);
        const isTerminal = (await computer.last(rev)) === rev;
        const finalClaimable = isTerminal ? getClaimable(finalWithdraws) : 0n;
        const availableBalance = totalDeposited - totalRegularAuthorized - totalFinalAuthorized;
        return {
            totalDeposited,
            totalRegularAuthorized,
            totalFinalAuthorized,
            regularClaimable,
            finalClaimable,
            availableBalance,
            isTerminal,
        };
    }
    static async audit(escrowRev, token) {
        const states = await this.walkHistory(escrowRev);
        return this.getAudit(states, token);
    }
}
export class TBC777 extends TBC20 {
    constructor(args) {
        const { amount, remoteRoot } = args;
        if (amount !== undefined) {
            if (amount < 0n)
                throw new Error('Amount cannot be negative');
            if (amount === 0n && !remoteRoot)
                throw new Error('Zero amount is only valid for remote-root tokens');
            if (remoteRoot && amount !== 0n)
                throw new Error('Remote-root tokens must be created with amount 0n');
        }
        const { withdrawn, finalWithdrawn, escrow, ...rest } = args;
        super({
            ...TBC777.CLEAN_STATE,
            ...rest,
            withdrawn: withdrawn ?? [],
            finalWithdrawn: finalWithdrawn ?? [],
        });
    }
    get root() {
        return this.remoteRoot || this._root;
    }
    merge() {
        throw new Error('merge() is disabled in TBC777.');
    }
    _createTransferToken(to, amount) {
        const ctor = this.constructor;
        const { _id, _root, _rev, _owners, withdrawn, finalWithdrawn, escrow, ...preserved } = this;
        return new ctor({ ...preserved, to, amount });
    }
    deposit(escrow, deposit) {
        if (deposit <= 0n)
            throw new Error('Deposit amount must be positive');
        if (this.amount < deposit)
            throw new Error('Insufficient balance for deposit');
        this.escrow = escrow;
        this.amount -= deposit;
    }
    async getBalance(escrowRev) {
        const audit = await EscrowAuditor.audit(escrowRev, this);
        return audit.availableBalance;
    }
    get depositTuple() {
        return [this.root, this._rev];
    }
    get isValidDeposit() {
        return async (cand) => (await this.isEqualTo(cand)) && (await TBC777.isValidMint(cand));
    }
    async withdraw(rev) {
        return this._withdraw(rev, false);
    }
    async finalWithdraw(rev) {
        return this._withdraw(rev, true);
    }
    async _withdraw(rev, isFinal) {
        const targetList = isFinal ? this.finalWithdrawn : this.withdrawn;
        if (targetList.includes(rev))
            throw new Error('Cannot withdraw multiple times');
        const { availableBalance, regularClaimable, finalClaimable, isTerminal } = await EscrowAuditor.audit(rev, this);
        const claimable = isFinal ? finalClaimable : regularClaimable;
        if (availableBalance < 0)
            throw new Error(`Escrow available balance (${availableBalance}) too low`);
        if (claimable <= 0n)
            throw new Error(`Claimable ${isFinal ? 'final ' : ''}withdraw amount is zero or negative`);
        if (isFinal && !isTerminal)
            throw new Error("finalWithdraws can only be claimed from the escrow's last revision");
        this.amount += claimable;
        targetList.push(rev);
        if (!isFinal)
            this.escrow = undefined;
    }
    async isEqualTo(other) {
        if (this.sameLineage(other))
            return true;
        if (this.root === other.root)
            return await this._semanticEqualTo(other);
        return false;
    }
    sameLineage(other) {
        return !this.remoteRoot && !other.remoteRoot && this._root === other._root;
    }
    async _semanticEqualTo(other) {
        try {
            const { mod: myMod, exp: myExp, env: myEnv } = await TBC777.getSignature(this);
            const { mod: otherMod, exp: otherExp, env: otherEnv } = await TBC777.getSignature(other);
            const { TBC777: my777, TBC20: my20 } = await computer.load(myMod);
            const { TBC777: other777, TBC20: other20 } = await computer.load(otherMod);
            if (my777.toString() !== other777.toString() || my20.toString() !== other20.toString())
                return false;
            const isEmptyEnv = (env) => env != null &&
                typeof env === 'object' &&
                Object.getPrototypeOf(env) === Object.prototype &&
                Object.keys(env).length === 0;
            if (!isEmptyEnv(myEnv) || !isEmptyEnv(otherEnv))
                return false;
            return TBC777.makeRegex(myExp).test(otherExp);
        }
        catch {
            return false;
        }
    }
    static async getSignature(token) {
        const txId = token._root.split(':')[0];
        return computer.decode(txId);
    }
    static async computeDepositAmount(depositData, escrow, lineage) {
        const root = depositData.remoteRoot || depositData._root;
        if (root !== lineage)
            return 0n;
        const nextRev = await computer.next(depositData._rev);
        if (!nextRev)
            return 0n;
        const nextToken = (await computer.sync(nextRev));
        if (String(nextToken.escrow) !== String(escrow))
            return 0n;
        return depositData.amount - nextToken.amount;
    }
    static async isValidMint(token) {
        if (!token.remoteRoot)
            return true;
        if (token.withdrawn.length === 0 && token.finalWithdrawn.length === 0)
            return false;
        const { amount } = await computer.sync(token._id);
        return amount === 0n;
    }
    static makeRegex(exp) {
        const toMatch = exp.match(/to\s*:\s*'(0[23][0-9a-fA-F]{64})'/)?.[1];
        const amountMatch = exp.match(/amount\s*:\s*(0|[1-9]\d*)n/)?.[1];
        const nameMatch = exp.match(/name\s*:\s*'([^']+)'/)?.[1];
        const symbolMatch = exp.match(/symbol\s*:\s*'([^']+)'/)?.[1];
        if (!toMatch || !amountMatch || !nameMatch || !symbolMatch)
            throw new Error('Input string is not in a valid TBC777 constructor form');
        if (amountMatch === '0' && !exp.includes('remoteRoot'))
            throw new Error('Zero amount is only valid for remote-root tokens');
        const noStrings = exp
            .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '""')
            .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""');
        if (/\b(class|extends|function)\b/.test(noStrings))
            throw new Error('Constructor expression contains forbidden keywords');
        const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = `^\\s*new\\s+TBC777\\s*\\(\\s*\\{[\\s\\S]*?` +
            `(?=.*to\\s*:\\s*'(0[23][0-9a-fA-F]{64})')` +
            `(?=.*amount\\s*:\\s*(0|[1-9]\\d*)n)` +
            `(?=.*name\\s*:\\s*'${escape(nameMatch)}')` +
            `(?=.*symbol\\s*:\\s*'${escape(symbolMatch)}')` +
            `(?!.*\\b(class|extends|function)\\b)` +
            `[\\s\\S]*\\}\\s*\\)\\s*$`;
        return new RegExp(pattern);
    }
}
TBC777.CLEAN_STATE = {
    withdrawn: [],
    finalWithdrawn: [],
    escrow: undefined,
};
