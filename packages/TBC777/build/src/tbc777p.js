import { TBC20 } from './tbc20.js';
export class Escrow extends Contract {
}
export class TBC777P extends TBC20 {
    constructor(args) {
        super({ withdrawRevs: [], escrowId: undefined, ...args });
    }
    deposit(escrowId, deposit) {
        if (deposit <= 0n)
            throw new Error('Deposit amount must be positive');
        if (this.amount < deposit)
            throw new Error('Insufficient balance for deposit');
        this.escrowId = escrowId;
        this.amount -= deposit;
    }
    async withdraw(withdrawRev) {
        if (this.withdrawRevs.includes(withdrawRev))
            throw new Error('Cannot withdraw multiple times');
        if (!(await TBC777P.isValidAtRev(withdrawRev, this._root)))
            throw new Error('Escrow balance too low');
        this.amount += await TBC777P.computeMyWithdraw(withdrawRev, this._id);
        this.withdrawRevs.push(withdrawRev);
    }
    static async computeMyWithdraw(withdrawRev, myId) {
        const { amountByWithdrawId } = await computer.sync(withdrawRev);
        const myAmountByWithdrawId = amountByWithdrawId.filter(([id]) => id === myId);
        return myAmountByWithdrawId.reduce((prev, curr) => prev + curr[1], 0n);
    }
    static async isValidAtRev(withdrawRev, myRoot) {
        const allStates = [];
        let currentRev = withdrawRev;
        while (true) {
            allStates.push(await computer.sync(currentRev));
            const prevRev = await computer.prev(currentRev);
            if (!prevRev)
                break;
            currentRev = prevRev;
        }
        const totalDeposits = await TBC777P.computeDeposits(allStates, myRoot);
        const totalWithdraws = await TBC777P.computeWithdraws(allStates);
        return totalDeposits - totalWithdraws >= 0;
    }
    static async computeDeposits(allStates, root) {
        if (allStates.length === 0)
            return 0n;
        const escrowId = allStates[0]._id;
        const allDepositRevs = new Set(allStates.reduce((prev, curr) => prev.concat(curr.depositRevs), []));
        const deposits = await Promise.all([...allDepositRevs].map((rev) => computer.sync(rev)));
        const depositAmounts = await Promise.all(deposits.map((deposit) => TBC777P.computeDeposit(deposit, escrowId, root)));
        return depositAmounts.reduce((prev, curr) => curr + prev, 0n);
    }
    static async computeDeposit(token, escrowId, root) {
        if (token.escrowId !== escrowId)
            return 0n;
        if (token._root !== root)
            return 0n;
        const prevRev = await computer.prev(token._rev);
        const prevToken = await computer.sync(prevRev);
        return prevToken.amount - token.amount;
    }
    static async computeWithdraws(allStates) {
        let total = 0n;
        for (const state of allStates) {
            total += state.amountByWithdrawId.reduce((prev, curr) => prev + curr[1], 0n);
        }
        return total;
    }
}
