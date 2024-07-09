import { getMockedRev } from './utils/index.js';
const { Contract } = await import('@bitcoin-computer/lib');
const randomPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c';
export class Payment extends Contract {
    constructor(_amount) {
        super({ _amount });
    }
    transfer(to) {
        this._owners = [to];
    }
    setAmount(a) {
        this._amount = a;
    }
}
export class PaymentMock {
    constructor(amount) {
        this._id = getMockedRev();
        this._rev = getMockedRev();
        this._root = getMockedRev();
        this._amount = amount;
        this._owners = [randomPublicKey];
    }
    transfer(to) {
        this._owners = [to];
    }
    setAmount(a) {
        this._amount = a;
    }
}
export class PaymentHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${Payment}`);
        return this.mod;
    }
    async createPaymentTx(amount) {
        const exp = `new Payment(${amount})`;
        return this.computer.encode({
            exp,
            mod: this.mod
        });
    }
    async getPayment(paymentTxId) {
        const [rev] = await this.computer.query({ ids: [`${paymentTxId}:0`] });
        const syncedPayment = await this.computer.sync(rev);
        return syncedPayment;
    }
}
