"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-expressions */
const bitcoin_computer_bitcore_1 = require("bitcoin-computer-bitcore");
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const sync_vout_action_1 = __importDefault(require("../src/actions/sync-vout.action"));
const standard_service_1 = __importDefault(require("../src/services/standard.service"));
const utils_1 = require("../src/utils");
chai_1.default.use(sinon_chai_1.default);
const { expect } = chai_1.default;
const { Script, Transaction } = bitcoin_computer_bitcore_1.Bitcoin;
const { UnspentOutput } = Transaction;
afterEach(() => {
    sinon_1.default.restore();
});
describe('sync-vout.action', () => {
    it('Should store a non-standard output', async () => {
        const txId = '6cb35dd6ab97be6f1e4dc17e6b5ae2ebc6d19db9ee25c1c577cd9532189eba17';
        const script = Script.fromString('21021aeaf2f8638a129a3156fbe7e5ef635226b0bafd495ff03afe2c843d7e3a4b51ac');
        const vout = [
            new bitcoin_computer_bitcore_1.Bitcoin.Transaction.Output({
                satoshis: 50.0 * 1e8,
                script: script.toBuffer(),
            }),
        ];
        const insertStub = sinon_1.default.stub(standard_service_1.default, 'insert').resolves();
        await (0, sync_vout_action_1.default)(vout, txId);
        expect(insertStub.calledWith([])).to.be.true;
        insertStub.restore();
    });
    it('Should store a standard output', async () => {
        const txId = '6cb35dd6ab97be6f1e4dc17e6b5ae2ebc6d19db9ee25c1c577cd9532189eba17';
        const script = Script.fromString('76a914a49e7d5083c1802bf399dead164a87f3b991609788ac');
        const vout = [
            new bitcoin_computer_bitcore_1.Bitcoin.Transaction.Output({
                satoshis: 50.0 * 1e8,
                script: script.toBuffer(),
            }),
        ];
        const insertStub = sinon_1.default.stub(standard_service_1.default, 'insert').resolves();
        await (0, sync_vout_action_1.default)(vout, txId);
        expect(insertStub.calledWith([
            new UnspentOutput({
                address: (0, utils_1.getAddressFromScript)(script),
                txid: txId,
                vout: 0,
                scriptPubKey: script.toHex(),
                amount: Math.round(vout[0].satoshis / 1e8),
                satoshis: Math.round(vout[0].satoshis),
            }),
        ])).to.be.true;
        insertStub.restore();
    });
});
