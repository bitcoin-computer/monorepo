import { Contract } from '@bitcoin-computer/lib';
import { TBC20 } from './tbc20.js';
export class Escrow extends Contract {
}
export class TBC777M extends TBC20 {
    constructor(args) {
        super({ withdrawn: [], finalWithdrawn: [], escrowId: undefined, ...args });
    }
    deposit(escrowId, deposit) {
        if (deposit <= 0n)
            throw new Error('Deposit amount must be positive');
        if (this.amount < deposit)
            throw new Error('Insufficient balance for deposit');
        this.escrowId = escrowId;
        this.amount -= deposit;
    }
    async withdraw(rev) {
        const { _id, _root } = this;
        if (this.withdrawn.includes(rev))
            throw new Error('Cannot withdraw multiple times');
        const balance = await TBC777M.getBalance(rev, _root);
        if (balance < 0n)
            throw new Error(`Escrow balance (${balance}) too low`);
        this.withdrawn.push(rev);
        this.amount += await TBC777M.computeWithdraw(rev, _id, _root);
    }
    async withdrawFinal(rev) {
        const { _id, _root } = this;
        if (this.finalWithdrawn.includes(rev))
            throw new Error('Cannot withdraw multiple times');
        const balance = await TBC777M.getBalance(rev, _root);
        if (balance < 0n)
            throw new Error(`Escrow balance (${balance}) too low`);
        const finalWithdraw = await TBC777M.computeFinalWithdraw(rev, _id, _root);
        this.finalWithdrawn.push(rev);
        this.amount += finalWithdraw;
    }
    static async computeWithdraw(rev, _id, _root) {
        const { withdraws } = await computer.sync(rev);
        return withdraws.reduce((total, [root, id, amount]) => (root === _root && id === _id ? total + amount : total), 0n);
    }
    static async computeFinalWithdraw(rev, _id, _root) {
        if ((await computer.last(rev)) !== rev)
            return 0n;
        const { finalWithdraws } = await computer.sync(rev);
        return finalWithdraws.reduce((total, [root, id, amount]) => (root === _root && id === _id ? total + amount : total), 0n);
    }
    static async getBalance(rev, root) {
        const states = [];
        let current = rev;
        while (true) {
            states.push(await computer.sync(current));
            const previous = await computer.prev(current);
            if (!previous)
                break;
            current = previous;
        }
        const deposits = await TBC777M.computeDeposits(states, root);
        const withdraws = await TBC777M.computeWithdraws(states, root);
        const finalWithdraws = await TBC777M.computeFinalWithdraws(states, root);
        return deposits - withdraws - finalWithdraws;
    }
    static async computeDeposits(states, root) {
        if (states.length === 0)
            return 0n;
        const escrowId = states[0]._id;
        const depositRevs = new Set(states.flatMap((state) => state.deposits.filter(([r]) => r === root).map(([, rev]) => rev)));
        const deposits = await Promise.all([...depositRevs].map((rev) => computer.sync(rev)));
        const depositAmounts = await Promise.all(deposits.map((deposit) => TBC777M.computeDeposit(deposit, escrowId, root)));
        return depositAmounts.reduce((prev, curr) => curr + prev, 0n);
    }
    static async computeDeposit(token, escrowId, root) {
        if (token._root !== root)
            return 0n;
        const nextRev = await computer.next(token._rev);
        const nextToken = await computer.sync(nextRev);
        if (nextToken.escrowId !== escrowId)
            return 0n;
        return token.amount - nextToken.amount;
    }
    static async computeWithdraws(states, root) {
        let total = 0n;
        for (const state of states) {
            const amounts = TBC777M.claimAmounts(state.withdraws, root);
            total += amounts.reduce((prev, amt) => prev + amt, 0n);
        }
        return total;
    }
    static async computeFinalWithdraws(states, root) {
        if (states.length === 0)
            return 0n;
        const [finalState] = states;
        const amounts = TBC777M.claimAmounts(finalState.finalWithdraws ?? [], root);
        return amounts.reduce((prev, amt) => prev + amt, 0n);
    }
    static claimAmounts(claims, root) {
        const amounts = claims.filter(([r]) => r === root).map(([, , amt]) => amt);
        if (amounts.some((amt) => typeof amt !== 'bigint' || amt < 0n))
            throw new Error('Escrow claim amounts must be non-negative bigints');
        return amounts;
    }
}
