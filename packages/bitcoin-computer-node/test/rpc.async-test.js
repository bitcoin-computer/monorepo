"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-expressions */
const chai_1 = require("chai");
const bitcoin_computer_bitcore_1 = require("bitcoin-computer-bitcore");
const config_1 = __importDefault(require("../src/config"));
const rpc_client_1 = __importDefault(require("../src/rpc-client"));
const get_rpc_utxos_action_1 = __importDefault(require("../src/actions/get-rpc-utxos.action"));
const send_raw_transaction_action_1 = __importDefault(require("../src/actions/send-raw-transaction.action"));
const { Computer } = config_1.default.TESTING
    ? require('@bitcoin-computer/lib-testing')
    : // eslint-disable-next-line import/no-unresolved
        require('@bitcoin-computer/lib');
const { Transaction } = bitcoin_computer_bitcore_1.Bitcoin;
describe('rpc', () => {
    describe('sendTransaction', () => {
        it('should send a transaction created with the bitcore library', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer3 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            await rpc_client_1.default.generateToAddress(1, computer1.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(1, computer2.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(100, computer3.db.wallet.address.toString());
            const tx = new Transaction();
            const [utxo1] = await (0, get_rpc_utxos_action_1.default)(computer1.db.wallet.address.toString());
            (0, chai_1.expect)(utxo1).to.not.be.undefined;
            tx.from(new Transaction.UnspentOutput(utxo1));
            tx.to(computer1.db.wallet.address.toString(), 10000);
            tx.change(computer1.db.wallet.address.toString());
            tx.sign(computer1.db.wallet.privateKey.toString(), 0x01);
            const rawTx = await (0, send_raw_transaction_action_1.default)(tx.toString());
            (0, chai_1.expect)(rawTx).to.not.be.undefined;
        });
        it('should send a transaction created with @bitcoin-computer/lib', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer3 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            await rpc_client_1.default.generateToAddress(1, computer1.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(1, computer2.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(100, computer3.db.wallet.address.toString());
            const tx1 = await computer1.db.createTx([], []);
            const [utxo1] = await (0, get_rpc_utxos_action_1.default)(computer1.db.wallet.address.toString());
            (0, chai_1.expect)(utxo1).to.not.be.undefined;
            tx1.tx.from(new Transaction.UnspentOutput(utxo1));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            tx1.tx.change(computer1.db.wallet.address.toString());
            tx1.tx.sign(computer1.db.wallet.privateKey.toString(), 0x01);
            const rawTx = await (0, send_raw_transaction_action_1.default)(tx1.tx.toString());
            (0, chai_1.expect)(rawTx).to.not.be.undefined;
        });
        it('should send a transaction created with @bitcoin-computer/lib having data', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer3 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            await rpc_client_1.default.generateToAddress(1, computer1.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(1, computer2.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(100, computer3.db.wallet.address.toString());
            const datum = [{ a: Math.random().toString() }];
            const tx1 = await computer1.db.createTx([], datum);
            const [utxo1] = await (0, get_rpc_utxos_action_1.default)(computer1.db.wallet.address.toString());
            (0, chai_1.expect)(utxo1).to.not.be.undefined;
            tx1.tx.from(new Transaction.UnspentOutput(utxo1));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            tx1.tx.change(computer1.db.wallet.address.toString());
            tx1.tx.sign(computer1.db.wallet.privateKey.toString(), 0x01);
            const rawTx = await (0, send_raw_transaction_action_1.default)(tx1.tx.toString());
            (0, chai_1.expect)(rawTx).to.not.be.undefined;
        });
        it('should send two transaction created with @bitcoin-computer/lib having data, and spending a revision', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer3 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            await rpc_client_1.default.generateToAddress(1, computer1.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(1, computer2.db.wallet.address.toString());
            await rpc_client_1.default.generateToAddress(100, computer3.db.wallet.address.toString());
            const datum1 = [{ a: Math.random().toString(), _owners: [computer2.getPublicKey()] }];
            const datum2 = [{ b: Math.random().toString() }];
            const tx1 = await computer1.db.createTx([], datum1);
            const [utxo1] = await (0, get_rpc_utxos_action_1.default)(computer1.db.wallet.address.toString());
            (0, chai_1.expect)(utxo1).to.not.be.undefined;
            tx1.tx.from(new Transaction.UnspentOutput(utxo1));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            tx1.tx.change(computer1.db.wallet.address.toString());
            tx1.tx.sign(computer1.db.wallet.privateKey.toString(), 0x01);
            const rawTx1 = await (0, send_raw_transaction_action_1.default)(tx1.tx.toString());
            (0, chai_1.expect)(rawTx1).to.not.be.undefined;
            const outputIndex = 0;
            const rev = `${tx1.tx.id}/${outputIndex}`;
            const tx2 = await computer2.db.createTx([rev], datum2);
            const [utxo2] = await (0, get_rpc_utxos_action_1.default)(computer2.db.wallet.address.toString());
            (0, chai_1.expect)(utxo2).to.not.be.undefined;
            tx2.tx.from([new Transaction.UnspentOutput(utxo2)]);
            tx2.tx.to(computer1.db.wallet.address.toString(), 10000);
            tx2.tx.change(computer2.db.wallet.address.toString());
            tx2.tx.sign(computer2.db.wallet.privateKey.toString(), 0x01);
            const rawTx2 = await (0, send_raw_transaction_action_1.default)(tx2.tx.toString());
            (0, chai_1.expect)(rawTx2).to.not.be.undefined;
        });
    });
});
