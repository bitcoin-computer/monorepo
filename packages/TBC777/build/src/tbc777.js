import { TBC20 } from './tbc20.js';
export class Escrow extends Contract {
    constructor() {
        super();
    }
}
export class TBC777 extends TBC20 {
    constructor(args) {
        super(args);
    }
    deposit(escrow, deposit) {
        if (deposit <= 0n)
            throw new Error('Deposit amount must be positive');
        if (this.amount < deposit)
            throw new Error('Insufficient balance for deposit');
        if (this.escrow)
            throw new Error('Token already in escrow');
        this.escrow = escrow;
        this.amount -= deposit;
    }
    async claim(rev) {
        if (!this.escrow)
            throw new Error('Token not in escrow');
        const finalState = await computer.sync(rev);
        if (finalState.status !== 'final')
            throw new Error('Escrow is not in final state');
        let currentRev = rev;
        while (true) {
            const prevRev = await computer.prev(currentRev);
            if (!prevRev)
                break;
            const prevState = await computer.sync(prevRev);
            if (prevState.status === 'final')
                throw new Error('Escrow was already finalized in a previous state');
            currentRev = prevRev;
        }
        const escrowId = finalState._id;
        const { claimable } = finalState;
        const uniqueDepositRevs = [...new Set(claimable.map((claim) => claim[0]))];
        const depositAmounts = await Promise.all(uniqueDepositRevs.map((depositRev) => TBC777.computeDeposit(depositRev, this._root, escrowId)));
        const depositAmount = depositAmounts.reduce((sum, amt) => sum + amt, 0n);
        const claimableAmount = finalState.claimable.reduce((sum, [, amt]) => sum + amt, 0n);
        if (claimableAmount > depositAmount)
            throw new Error('Escrow created tokens');
        const myClaim = finalState.claimable
            .filter(([rev]) => rev === this._rev)
            .reduce((sum, [, amt]) => sum + amt, 0n);
        this.amount += myClaim;
        this.escrow = undefined;
    }
    static async computeDeposit(depositRev, root, escrowId) {
        const deposit = await computer.sync(depositRev);
        if (deposit.escrow !== escrowId || deposit._root !== root)
            throw Error('Found invalid deposit');
        const prevRev = await computer.prev(depositRev);
        if (!prevRev)
            throw Error('Something went wrong');
        const prev = await computer.sync(prevRev);
        const delta = prev.amount - deposit.amount;
        if (delta < 0n)
            throw new Error('Something went wrong');
        return delta;
    }
}
