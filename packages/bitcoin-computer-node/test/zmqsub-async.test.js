"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
const bitcoin_computer_bitcore_1 = require("bitcoin-computer-bitcore");
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const zmqsub_1 = require("../src/zmqsub");
const config_1 = __importDefault(require("../src/config"));
const utils_1 = require("../src/utils");
const get_balance_action_1 = __importDefault(require("../src/actions/get-balance.action"));
const rpc_client_1 = __importDefault(require("../src/rpc-client"));
const send_raw_transaction_action_1 = __importDefault(require("../src/actions/send-raw-transaction.action"));
const get_rpc_utxos_action_1 = __importDefault(require("../src/actions/get-rpc-utxos.action"));
chai_1.default.use(sinon_chai_1.default);
const { Computer } = config_1.default.TESTING
    ? require('@bitcoin-computer/lib-testing')
    : // eslint-disable-next-line import/no-unresolved
        require('@bitcoin-computer/lib');
const { expect } = chai_1.default;
const { Script, Transaction } = bitcoin_computer_bitcore_1.Bitcoin;
const sampleTxs = [];
let bitcoinRpcGetTransactionStub;
beforeEach(async () => {
    // empty sample Txs array
    sampleTxs.splice(0, sampleTxs.length);
    // create transactions
    const { CHAIN, NETWORK, BCN_URL } = config_1.default;
    const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
    const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
    const computer3 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
    await rpc_client_1.default.generateToAddress(1, computer1.db.wallet.address.toString());
    await rpc_client_1.default.generateToAddress(1, computer2.db.wallet.address.toString());
    await rpc_client_1.default.generateToAddress(100, computer3.db.wallet.address.toString());
    const data1 = [
        { a: Math.random().toString(), _owners: [computer2.db.wallet.publicKey.toString()] },
    ];
    const data2 = [
        { b: Math.random().toString(), _owners: [computer3.db.wallet.publicKey.toString()] },
    ];
    const data3 = [{ c: Math.random().toString() }];
    const tx1 = await computer1.db.createTx([], data1);
    const [utxo1] = await (0, get_rpc_utxos_action_1.default)(computer1.db.wallet.address.toString());
    expect(utxo1).to.not.be.undefined;
    tx1.tx.from(new Transaction.UnspentOutput(utxo1));
    tx1.tx.to(computer2.db.wallet.address, 30000);
    tx1.tx.change(computer1.db.wallet.address);
    tx1.tx.sign(computer1.db.wallet.privateKey, 0x01);
    await (0, send_raw_transaction_action_1.default)(tx1.tx.toString());
    const outputIndex = 0;
    const rev = `${tx1.tx.hash}/${outputIndex}`;
    const tx2 = await computer2.db.createTx([rev], data2);
    const utxo2s = await (0, get_rpc_utxos_action_1.default)(computer2.db.wallet.address.toString());
    expect(utxo2s.length).eq(2);
    tx2.tx.from([new Transaction.UnspentOutput(utxo2s.sort((a, b) => a.satoshis - b.satoshis)[0])]);
    tx2.tx.to(computer3.db.wallet.address.toString(), 20000);
    tx2.tx.change(computer2.db.wallet.address.toString());
    tx2.tx.sign(computer2.db.wallet.privateKey.toString(), 0x01);
    await (0, send_raw_transaction_action_1.default)(tx2.tx.toString());
    const revTx2 = `${tx2.tx.id}/0`;
    const tx3 = await computer3.db.createTx([revTx2], data3);
    const utxo3s = await (0, get_rpc_utxos_action_1.default)(computer3.db.wallet.address.toString());
    expect(utxo3s).not.to.be.undefined;
    expect(utxo3s.length).eq(1);
    tx3.tx.from([new Transaction.UnspentOutput(utxo3s[0])]);
    tx3.tx.to(computer1.db.wallet.address.toString(), 10000);
    tx3.tx.change(computer3.db.wallet.address.toString());
    tx3.tx.sign(computer3.db.wallet.privateKey.toString(), 0x01);
    await (0, send_raw_transaction_action_1.default)(tx3.tx.toString());
    sampleTxs.push(tx1);
    sampleTxs.push(tx2);
    sampleTxs.push(tx3);
});
afterEach(() => {
    sinon_1.default.restore();
});
describe('zmqsub', () => {
    describe('rawTxSubscriber', () => {
        it.skip('Should sync correctly standard case t1, t2, t3', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const data1 = [{ a: 'a' }];
            const data2 = [{ b: 'b' }];
            const tx1 = await computer1.db.createTx([], data1);
            tx1.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: '0000000000000000000000000000000000000000000000000000000000000000',
                outputIndex: 0xffffffff,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            const rawTx = tx1.tx.toString();
            await (0, zmqsub_1.rawTxSubscriber)(rawTx);
            const tx2 = await computer2.db.createTx([], data2);
            tx2.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: tx1.tx.hash,
                outputIndex: 0,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx2.tx.to(computer1.db.wallet.address.toString(), 10000);
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            const tx3 = await computer1.db.createTx([], data2);
            tx3.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: tx2.tx.hash,
                outputIndex: 0,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx3.tx.to(computer1.db.wallet.address.toString(), 10000);
            await (0, zmqsub_1.rawTxSubscriber)(tx3.tx.toString());
            const dbBalance1 = await (0, get_balance_action_1.default)(computer1.db.wallet.address.toString());
            expect(dbBalance1).to.be.greaterThan(0);
            const dbBalance2 = await (0, get_balance_action_1.default)(computer2.db.wallet.address.toString());
            expect(dbBalance2).eq(0);
        });
        it.skip('Should skip when receiving a transaction twice: t1, t2, t2 - standard spent', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const data1 = [{ a: 'a' }];
            const data2 = [{ b: 'b' }];
            const tx1 = await computer1.db.createTx([], data1);
            tx1.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: '0000000000000000000000000000000000000000000000000000000000000000',
                outputIndex: 0xffffffff,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            // tx1.tx.outputs = [0: nonStandardOutput, 1: op_return, 2: standard]
            await (0, zmqsub_1.rawTxSubscriber)(tx1.tx.toString());
            const tx2 = await computer2.db.createTx([], data2);
            tx2.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: tx1.tx.hash,
                outputIndex: 2,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx2.tx.to(computer1.db.wallet.address.toString(), 10000);
            const spentStatusBefore = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusBefore)).eq(false);
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            // Check if tx1.outputs have been spend by tx2.inputs
            const spentStatusAfter1 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter1)).eq(true);
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            const spentStatusAfter2 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter2)).eq(true);
        });
        it.skip('Should skip when receiving a transaction twice: t1, t2, t2 - nonStandard spent', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const data1 = [{ a: 'a' }];
            const data2 = [{ b: 'b' }];
            const tx1 = await computer1.db.createTx([], data1);
            tx1.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: '0000000000000000000000000000000000000000000000000000000000000000',
                outputIndex: 0xffffffff,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            // tx1.tx.outputs = [0: nonStandardOutput, 1: op_return, 2: standard]
            await (0, zmqsub_1.rawTxSubscriber)(tx1.tx.toString());
            const txsMap = {};
            txsMap[tx1.tx.txid] = tx1.tx;
            bitcoinRpcGetTransactionStub.restore();
            sinon_1.default.stub(rpc_client_1.default, 'getTransaction').callsFake(async (id) => {
                return { result: txsMap[id] };
            });
            // RpcClient.__setMockTxsMap(txsMap)
            /*
            mock
              .onPost(`http://127.0.0.1:3000/v1/${config.CHAIN}/${config.NETWORK}/tx/bulk/`)
              .reply(200, [tx1.tx.toString('hex')])
            mock
              .onGet(`http://127.0.0.1:3000/v1/${config.CHAIN}/${config.NETWORK}/tx/${tx1.tx.hash}`)
              .reply(200, tx1.tx.toString('hex'))
            */
            const rev = `${tx1.tx.hash}/0`;
            const tx2 = await computer2.db.createTx([rev], data2);
            tx2.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: tx1.tx.hash,
                outputIndex: 2,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx2.tx.to(computer1.db.wallet.address.toString(), 10000);
            const spentStatusBefore = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusBefore)).eq(false);
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            // Check if tx1.outputs have been spend by tx2.inputs
            const spentStatusAfter1 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter1)).eq(true);
        });
        it.skip('Should sync correctly when missing t2: t1, t2(x), t3', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const data1 = [{ a: 'a' }];
            const data2 = [{ b: 'b' }];
            const data3 = [{ c: 'c' }];
            const tx1 = await computer1.db.createTx([], data1);
            tx1.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: '0000000000000000000000000000000000000000000000000000000000000000',
                outputIndex: 0xffffffff,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            // Sending tx1: tx1.tx.outputs = [0: nonStandardOutput, 1: op_return, 2: standard]
            await (0, zmqsub_1.rawTxSubscriber)(tx1.tx.toString());
            // creates t2, but we will NOT send it.
            const revTx1 = `${tx1.tx.hash}/0`;
            /*
            mock
              .onPost(`http://127.0.0.1:3000/v1/${config.CHAIN}/${config.NETWORK}/tx/bulk/`)
              .reply(200, [tx1.tx.toString('hex')])
            mock
              .onGet(`http://127.0.0.1:3000/v1/${config.CHAIN}/${config.NETWORK}/tx/${tx1.tx.hash}`)
              .reply(200, tx1.tx.toString('hex'))
            */
            const tx2 = await computer2.db.createTx([revTx1], data2);
            tx2.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: tx1.tx.hash,
                outputIndex: 2,
                sequenceNumber: 0xffffffff,
                script: new Script(),
            }));
            tx2.tx.sign(computer1.db.wallet.privateKey, 0x01);
            tx2.tx.to(computer1.db.wallet.address.toString(), 10000);
            const spentStatusBefore = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusBefore)).eq(false);
            /*
            mock
              .onPost(`http://127.0.0.1:3000/v1/${config.CHAIN}/${config.NETWORK}/tx/bulk/`)
              .reply(200, [tx2.tx.toString('hex')])
            mock
              .onGet(`http://127.0.0.1:3000/v1/${config.CHAIN}/${config.NETWORK}/tx/${tx2.tx.hash}`)
              .reply(200, tx2.tx.toString('hex'))
            */
            const txsMap = {};
            txsMap[tx1.tx.id] = tx1.tx;
            txsMap[tx2.tx.id] = tx2.tx;
            bitcoinRpcGetTransactionStub.restore();
            sinon_1.default.stub(rpc_client_1.default, 'getTransaction').callsFake(async (id) => {
                return { result: txsMap[id] };
            });
            const revTx2 = `${tx2.tx.hash}/0`;
            const tx3 = await computer2.db.createTx([revTx2], data3);
            tx3.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: tx2.tx.hash,
                outputIndex: 2,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx3.tx.to(computer1.db.wallet.address.toString(), 5000);
            // Sending tx3. This should repair tx2
            await (0, zmqsub_1.rawTxSubscriber)(tx3.tx.toString());
            // Check if tx1.outputs have been spent
            const spentStatusTx1After = await (0, zmqsub_1.getInputsSpentStatus)(tx1);
            expect((0, utils_1.areInputsSpent)(spentStatusTx1After)).eq(false);
            // Check if tx2.outputs have been spent
            const spentStatusTx2After = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusTx2After)).eq(true);
            // Check if tx3.outputs have not been spent
            const spentStatusTx3After = await (0, zmqsub_1.getInputsSpentStatus)(tx3);
            expect((0, utils_1.areInputsSpent)(spentStatusTx3After)).eq(true);
        });
        it.skip('Should skip when receiving a transaction twice: t1, t2, t2 - nonStandard and standard spent', async () => {
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer1 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const computer2 = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const data1 = [{ a: 'a' }];
            const data2 = [{ b: 'b' }];
            const tx1 = await computer1.db.createTx([], data1);
            tx1.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: '0000000000000000000000000000000000000000000000000000000000000000',
                outputIndex: 0xffffffff,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx1.tx.to(computer1.db.wallet.address.toString(), 10000);
            // Sending tx1: tx1.tx.outputs = [0: nonStandardOutput, 1: op_return, 2: standard]
            await (0, zmqsub_1.rawTxSubscriber)(tx1.tx.toString());
            const outputIndex = 0;
            const rev = `${tx1.tx.hash}/${outputIndex}`;
            /*
            mock
              .onPost(`http://127.0.0.1:3000/v1/${config.CHAIN}/${config.NETWORK}/tx/bulk/`)
              .reply(200, [tx1.tx])
            */
            const tx2 = await computer2.db.createTx([rev], data2);
            tx2.tx.uncheckedAddInput(new Transaction.Input({
                prevTxId: tx1.tx.hash,
                outputIndex: 2,
                sequenceNumber: 0xffffffff,
                script: new Script('OP_0 OP_0'),
            }));
            tx2.tx.to(computer1.db.wallet.address.toString(), 10000);
            const spentStatusBefore = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusBefore)).eq(false);
            // Sending tx2
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            // Check if tx1.outputs have been spend by tx2.inputs
            const spentStatusAfter1 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter1)).eq(true);
            // sending tx2 again, nothing should change
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            const spentStatusAfter2 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter2)).eq(true);
            // sending tx2 and again...and so on, nothing should change
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            const spentStatusAfter3 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter3)).eq(true);
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            const spentStatusAfter4 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter4)).eq(true);
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            const spentStatusAfter5 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter5)).eq(true);
            await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
            const spentStatusAfter6 = await (0, zmqsub_1.getInputsSpentStatus)(tx2);
            expect((0, utils_1.areInputsSpent)(spentStatusAfter6)).eq(true);
        });
    });
    describe('tx%i, tx%i, tx%i', () => {
        ;
        [
            [0, 0, 1],
            [0, 1, 1],
            [1, 1, 0],
            [1, 1, 2],
            [1, 2, 2],
            [2, 2, 1],
            [2, 1, 1],
            [2, 0, 1],
            [2, 1, 0],
            [2, 0, 0],
            [0, 1, 2],
            [0, 2, 1],
            [2, 2, 2],
        ].forEach(([a, b, c]) => {
            it(`Should sync correctly tx${a} tx${b} tx${c}`, async () => {
                const tx1 = sampleTxs[a];
                const tx2 = sampleTxs[b];
                const tx3 = sampleTxs[c];
                // Sending txs to node
                await (0, zmqsub_1.rawTxSubscriber)(tx1.tx.toString());
                await (0, zmqsub_1.rawTxSubscriber)(tx2.tx.toString());
                await (0, zmqsub_1.rawTxSubscriber)(tx3.tx.toString());
                // we expect the inputs of all transactions to be spent
                const tx1InputsSpentStatus = await (0, zmqsub_1.getInputsSpentStatus)(sampleTxs[0]);
                expect((0, utils_1.areInputsSpent)(tx1InputsSpentStatus)).eq(true);
                const tx2InputsSpentStatus = await (0, zmqsub_1.getInputsSpentStatus)(sampleTxs[1]);
                expect((0, utils_1.areInputsSpent)(tx2InputsSpentStatus)).eq(true);
                const spentStatusAfterTx3 = await (0, zmqsub_1.getInputsSpentStatus)(sampleTxs[2]);
                expect((0, utils_1.areInputsSpent)(spentStatusAfterTx3)).eq(true);
            });
        });
    });
});
