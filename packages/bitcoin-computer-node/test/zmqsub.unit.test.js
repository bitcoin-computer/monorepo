"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
const bitcoind_rpc_1 = __importDefault(require("bitcoind-rpc"));
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const db_1 = __importDefault(require("../src/db"));
const zmqsub_1 = require("../src/zmqsub");
const config_1 = __importDefault(require("../src/config"));
const spendVinAction = __importStar(require("../src/actions/spend-vin.action"));
const syncVoutAction = __importStar(require("../src/actions/sync-vout.action"));
const syncNonStandardTxAction = __importStar(require("../src/actions/sync-non-standard-transaction.action"));
chai_1.default.use(sinon_chai_1.default);
const { Computer } = config_1.default.TESTING
    ? require('@bitcoin-computer/lib-testing')
    : // eslint-disable-next-line import/no-unresolved
        require('@bitcoin-computer/lib');
const { expect } = chai_1.default;
afterEach(() => {
    sinon_1.default.restore();
});
describe('zmqsub', () => {
    describe('rawTxSubscriber', () => {
        it('Should ignore a standard rawtx', async () => {
            const mainTxHex = '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0704ffff001d0104ffffffff0100f2052a0100000043410496b538e853519c726a2c91e61ec11600ae1390813a627c66fb8be7947be63c52da7589379515d4e0a604f8141781e62294721166bf621e73a82cbf2342c858eeac00000000';
            const txId = '0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098';
            const tx = {
                txid: txId,
                hash: '906c7434c759c8baf9bea2429a849942143cbed7bae22d34086bbfbafff2c582',
                version: 1,
                vin: [],
                vout: [
                    {
                        value: 5000000000 / 1e8,
                        n: 0,
                        scriptPubKey: {
                            hex: '410496b538e853519c726a2c91e61ec11600ae1390813a627c66fb8be7947be63c52da7589379515d4e0a604f8141781e62294721166bf621e73a82cbf2342c858eeac',
                            addresses: ['12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'],
                        },
                        txId,
                    },
                ],
                nLockTime: 0,
            };
            const txsMap = {};
            txsMap[mainTxHex] = tx;
            const outActionStub = sinon_1.default.stub(syncVoutAction, 'default').resolves();
            const txnFunc = sinon_1.default.stub(syncNonStandardTxAction, 'default');
            const decodeRawTransactionStub = sinon_1.default
                .stub(bitcoind_rpc_1.default.prototype, 'decodeRawTransaction')
                .callsFake((rawTx, callback) => {
                callback(null, { result: txsMap[rawTx] });
            });
            await (0, zmqsub_1.rawTxSubscriber)(mainTxHex);
            expect(txnFunc.calledWith([], [], [])).to.be.true;
            txnFunc.restore();
            decodeRawTransactionStub.restore();
            outActionStub.restore();
        });
        it('Should sync a coinbase testnet rawtx', async () => {
            const mainTxHex = '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0b03c58c01062f503253482fffffffff0386600f27010000001976a914dde4906f870df11cf316b15adb628a3c3cc9883988ac8ab8f60200000000434104ffd03de44a6e11b9917f3a29f9443283d9871c9d743ef30d5eddcd37094b64d1b3d8090496b53256786bf5c82932ec23c3b74d9f05a6f95a8b5529352656664bac00000000000000002a6a28e73cd21eb4ac1eb1ba3767f4bf12be98935656451df3d6dee34c125662bcd599000000000000010000000000';
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const transaction = await computer.db.fromTxHex(mainTxHex);
            const txsMap = {};
            txsMap[mainTxHex] = transaction;
            const outActionStub = sinon_1.default.stub(syncVoutAction, 'default').resolves();
            const inActionStub = sinon_1.default.stub(spendVinAction, 'default').resolves();
            const nonStandardActionStub = sinon_1.default.stub(syncNonStandardTxAction, 'default').resolves();
            const decodeRawTransactionStub = sinon_1.default
                .stub(bitcoind_rpc_1.default.prototype, 'decodeRawTransaction')
                .callsFake((rawTx, callback) => {
                callback(null, { result: txsMap[rawTx] });
            });
            await (0, zmqsub_1.rawTxSubscriber)(mainTxHex);
            expect(outActionStub.calledWith(transaction.tx.outputs, transaction.tx.id)).to.be.true;
            expect(inActionStub.calledWith(transaction.tx.inputs)).to.be.true;
            expect(nonStandardActionStub.calledWith([], [], [])).to.be.true;
            decodeRawTransactionStub.restore();
            outActionStub.restore();
            inActionStub.restore();
            nonStandardActionStub.restore();
        });
        it('Should sync a non-coinbase litecoin testnet rawtx', async () => {
            const mainTxHex = '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff1002c4030458a1c34e00000000a0110000ffffffff0100f2052a010000001976a91485c6c556d26d6e0f8c6a2be6346063a0be11322b88ac00000000';
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const transaction = await computer.db.fromTxHex(mainTxHex);
            const txsMap = {};
            txsMap[mainTxHex] = transaction;
            const decodeRawTransactionStub = sinon_1.default
                .stub(bitcoind_rpc_1.default.prototype, 'decodeRawTransaction')
                .callsFake((rawTx, callback) => {
                callback(null, { result: txsMap[rawTx] });
            });
            await db_1.default.none(
            // eslint-disable-next-line no-template-curly-in-string
            'INSERT INTO "Standard" ("rev", "address", "satoshis", "scriptPubKey") VALUES (${rev}, ${address}, ${satoshis}, ${scriptPubKey})', {
                rev: '116f8a9a64ec50b1bd1b7c7d655b48aa69679733f229eb55ed3826c9498cb780/1',
                address: 'Ld3irp3S8XnL1Dk4z6YSydNxskJ6i1ZXRW',
                satoshis: 400000,
                scriptPubKey: '473044022100acdd188269a805166645e4e77a1aeda6c51dee9dd8148a0f3090932955b5fb39021f27613c978b511767e15139f6485c44174a6b6aeee7d0826446eb8991e65aac0121029cbe86fb0276ee64905f635ea50951cf85a8b282a3f6100da62f85ad6cfdc4af',
            });
            const outActionStub = sinon_1.default.stub(syncVoutAction, 'default').resolves();
            const inActionStub = sinon_1.default.stub(spendVinAction, 'default').resolves();
            const nonStandardActionStub = sinon_1.default.stub(syncNonStandardTxAction, 'default').resolves();
            await (0, zmqsub_1.rawTxSubscriber)(mainTxHex);
            // cleanup
            await db_1.default.none('DELETE FROM "Standard"');
            expect(outActionStub.calledWith(transaction.tx.outputs, transaction.tx.id)).to.be.true;
            expect(inActionStub.calledWith(transaction.tx.inputs)).to.be.true;
            expect(nonStandardActionStub.calledWith([], [], [])).to.be.true;
            decodeRawTransactionStub.restore();
            outActionStub.restore();
            inActionStub.restore();
            nonStandardActionStub.restore();
            decodeRawTransactionStub.restore();
        });
        it('Should sync another coinbase testnet rawtx', async () => {
            const mainTxHex = '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0b03c58c01062f503253482fffffffff0386600f27010000001976a914dde4906f870df11cf316b15adb628a3c3cc9883988ac8ab8f60200000000434104ffd03de44a6e11b9917f3a29f9443283d9871c9d743ef30d5eddcd37094b64d1b3d8090496b53256786bf5c82932ec23c3b74d9f05a6f95a8b5529352656664bac00000000000000002a6a28e73cd21eb4ac1eb1ba3767f4bf12be98935656451df3d6dee34c125662bcd599000000000000010000000000';
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const transaction = await computer.db.fromTxHex(mainTxHex);
            const txsMap = {};
            txsMap[mainTxHex] = transaction;
            const outActionStub = sinon_1.default.stub(syncVoutAction, 'default').resolves();
            const inActionStub = sinon_1.default.stub(spendVinAction, 'default').resolves();
            const nonStandardActionStub = sinon_1.default.stub(syncNonStandardTxAction, 'default').resolves();
            const decodeRawTransactionStub = sinon_1.default
                .stub(bitcoind_rpc_1.default.prototype, 'decodeRawTransaction')
                .callsFake((rawTx, callback) => {
                callback(null, { result: txsMap[rawTx] });
            });
            await (0, zmqsub_1.rawTxSubscriber)(mainTxHex);
            expect(outActionStub.calledWith(transaction.tx.outputs, transaction.tx.id)).to.be.true;
            expect(inActionStub.calledWith(transaction.tx.inputs)).to.be.true;
            expect(nonStandardActionStub.calledWith([], [], [])).to.be.true;
            decodeRawTransactionStub.restore();
            outActionStub.restore();
            inActionStub.restore();
            nonStandardActionStub.restore();
            // expect(syncNonStandardTxAction).toHaveBeenLastCalledWith([], [], [])
            // expect(syncVoutAction).toHaveBeenLastCalledWith(transaction.tx.outputs, transaction.tx.id)
            // expect(spendVinAction).toHaveBeenLastCalledWith(transaction.tx.inputs)
        });
    });
});
