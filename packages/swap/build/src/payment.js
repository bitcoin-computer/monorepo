import { getMockedRev } from './utils/index.js';
const randomPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c';
export class Payment extends Contract {
    constructor(_satoshis) {
        super({ _satoshis });
    }
    transfer(to) {
        this._owners = [to];
    }
    setSatoshis(a) {
        this._satoshis = a;
    }
}
export class PaymentMock {
    constructor(satoshis) {
        this._id = getMockedRev();
        this._rev = getMockedRev();
        this._root = getMockedRev();
        this._satoshis = satoshis;
        this._owners = [randomPublicKey];
    }
    transfer(to) {
        this._owners = [to];
    }
    setSatoshis(a) {
        this._satoshis = a;
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
    async createPaymentTx(satoshis) {
        const exp = `new Payment(${satoshis}n)`;
        return this.computer.encode({
            exp,
            mod: this.mod,
        });
    }
    async getPayment(paymentTxId) {
        const rev = await this.computer.latest(`${paymentTxId}:0`);
        const syncedPayment = await this.computer.sync(rev);
        return syncedPayment;
    }
}
export class Withdraw extends Contract {
    static exec(payments) {
        payments.forEach((payment) => payment.setSatoshis(0n));
    }
}
