import { Transaction } from '@bitcoin-computer/nakamotojs';
const { Contract } = await import('@bitcoin-computer/lib');
export class Sale extends Contract {
    static exec(a, b) {
        const [ownerA] = a._owners;
        const [ownerB] = b._owners;
        a.transfer(ownerB);
        b.transfer(ownerA);
        return [b, a];
    }
}
export class SaleHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${Sale}`);
        return this.mod;
    }
    createSaleTx(nft, payment) {
        const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction;
        return this.computer.encode({
            exp: `Sale.exec(nft, payment)`,
            env: { nft: nft._rev, payment: payment._rev },
            mocks: { payment },
            sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
            inputIndex: 0,
            fund: false,
            mod: this.mod,
        });
    }
    static checkSaleTx() {
    }
    static finalizeSaleTx(tx, payment, scriptPubKey) {
        const [paymentTxId, paymentIndex] = payment._rev.split(':');
        const index = parseInt(paymentIndex, 10);
        tx.updateInput(1, { txId: paymentTxId, index });
        tx.updateOutput(1, { scriptPubKey });
        return tx;
    }
}
