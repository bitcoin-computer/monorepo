import { getTestRev } from './utils';
const { Contract } = await import('@bitcoin-computer/lib');
export class Payment extends Contract {
    constructor(owner, _amount) {
        super({ _owners: [owner], _amount });
    }
    transfer(to) {
        this._owners = [to];
    }
}
export class PaymentMock {
    constructor(owner, amount) {
        const r = Math.floor(Math.random() * 1000);
        this._id = getTestRev(0, r);
        this._rev = getTestRev(0, r);
        this._root = getTestRev(0, r);
        this._owners = [owner];
        this._amount = amount;
    }
    transfer(to) {
        this._owners = [to];
    }
}
