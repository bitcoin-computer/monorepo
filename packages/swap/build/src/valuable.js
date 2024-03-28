import { getTestRev } from './utils/index.js';
const { Contract } = await import('@bitcoin-computer/lib');
const randomPublicKey = '023e21361b53bb2e625cc1f41d18b35ae882e88d8d107df1c3711fa8bc54db8fed';
export class Valuable extends Contract {
    setAmount(amount) {
        this._amount = amount;
    }
}
export class ValuableMock {
    constructor() {
        const r = Math.floor(Math.random() * 100000);
        this._id = getTestRev(1, r);
        this._rev = getTestRev(1, r);
        this._root = getTestRev(1, r);
        this._owners = [randomPublicKey];
        this._amount = 7860;
    }
    setAmount(amount) {
        this._amount = amount;
    }
}
