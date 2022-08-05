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
const bitcoin_computer_bitcore_1 = require("bitcoin-computer-bitcore");
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const sync_action_1 = require("../src/actions/sync.action");
const selectSyncAction = __importStar(require("../src/actions/select-sync.action"));
const updateSyncAction = __importStar(require("../src/actions/update-sync.action"));
const config_1 = __importDefault(require("../src/config"));
const syncTransactionAction = __importStar(require("../src/actions/sync-transaction.action"));
chai_1.default.use(sinon_chai_1.default);
const { Computer } = config_1.default.TESTING
    ? require('@bitcoin-computer/lib-testing')
    : // eslint-disable-next-line import/no-unresolved
        require('@bitcoin-computer/lib');
const { expect } = chai_1.default;
const { Script } = bitcoin_computer_bitcore_1.Bitcoin;
afterEach(() => {
    sinon_1.default.restore();
});
describe('actions', () => {
    describe('partialSync', () => {
        // todo: fix this test. We need to ensure that this test and sync.action create
        // the same computer object. Currently a random computer object is created here
        // and in sync.action.
        it.skip('Should sync transactions received from RpcClient', async () => {
            const block = {
                tx: [
                    {
                        id: '3b414cae474b3a3138048240f4e133ca5292b51f322ef9a94fb96677bbb37083',
                        hash: '3b414cae474b3a3138048240f4e133ca5292b51f322ef9a94fb96677bbb37083',
                        version: 2,
                        size: 148,
                        locktime: 0,
                        vin: [
                            {
                                // @ts-ignore
                                coinbase: '03398e15105361746f736869204e616b616d6f746f40000000cf760000',
                                sequenceNumber: 4294967295,
                            },
                        ],
                        vout: [
                            {
                                _satoshis: 0.76953981 * 1e8,
                                n: 0,
                                _scriptBuffer: Script.fromString('76a91447c84ac74fd7117005bc84504320068ba0f3490988ac').toBuffer(),
                                txId: '3b414cae474b3a3138048240f4e133ca5292b51f322ef9a94fb96677bbb37083',
                            },
                            {
                                _satoshis: 0.01171889 * 1e8,
                                n: 1,
                                _scriptBuffer: Script.fromString('76a91447c84ac74fd7117005bc84504320068ba0f3490988ac').toBuffer(),
                                txId: '3b414cae474b3a3138048240f4e133ca5292b51f322ef9a94fb96677bbb37083',
                            },
                        ],
                        hex: '02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff1d03398e15105361746f736869204e616b616d6f746f40000000cf760000ffffffff027d399604000000001976a91447c84ac74fd7117005bc84504320068ba0f3490988acb1e11100000000001976a91447c84ac74fd7117005bc84504320068ba0f3490988ac00000000',
                    },
                    {
                        id: '901b20288fe7787c76f8dd5af5f09cb932879484db652f466a07e33aed22d255',
                        hash: '901b20288fe7787c76f8dd5af5f09cb932879484db652f466a07e33aed22d255',
                        version: 1,
                        size: 618,
                        locktime: 0,
                        vin: [
                            {
                                prevTxId: Buffer.from('72c127a6b9f953e5a84c852b7215694e3993661e21e6b7525934a5960835e067'),
                                outputIndex: 0,
                                script: Script.fromString('00473044022052e766bffd20b421d9aa777cafd5951d5ceeef179f0068712a4a7f1ee1551d1e022066a5c14ac23c7feba582eb45eacfa973f1c6f5f8a4033607b4dfece5335125bd41'),
                                sequenceNumber: 4294967295,
                            },
                            {
                                prevTxId: Buffer.from('bf11b7381a2fcb4ae91764a07b71f8d5ca703070ad8d66dbdfbde1e36310c244'),
                                outputIndex: 1,
                                script: Script.fromString('483045022100e4c3ac05b3ff6c4300fd4f36514ac7f251e5ecce2c5f6b8886d55f76d19745e702201d96e89558663f9b327fa619db8384cfe0c55f08b84c7a53e8830ba592b94418412103a63c9cffaad5c8e23b272e0506808ea1daa9a9eb79279ab514d2e05f8598207a'),
                                sequenceNumber: 4294967295,
                            },
                        ],
                        vout: [
                            {
                                _satoshis: 0.00004 * 1e8,
                                n: 0,
                                _scriptBuffer: Script.fromString('512103a63c9cffaad5c8e23b272e0506808ea1daa9a9eb79279ab514d2e05f8598207a51ae4d04017b225f5f696e646578223a7b226f626a223a307d2c225f5f66756e63223a2273657454616773222c225f5f61726773223a5b5b22346462313538373566616362636166643432633661313838386330346137396365616332646438323839346664643465313033373763363337323134616538643a30222c22363236626539656431623464613764363763643633303664303635303062303961333562646266376163386565373762383161363333663464636439373763393a30222c22626631316237333831613266636234616539313736346130376237316638643563613730333037306164386436366462646662646531653336333130633234343a30225d5d7d75').toBuffer(),
                                txId: '901b20288fe7787c76f8dd5af5f09cb932879484db652f466a07e33aed22d255',
                            },
                            {
                                _satoshis: 0.05967315 * 1e8,
                                n: 1,
                                _scriptBuffer: Script.fromString('76a914d5741755803fad66991309467ed4e11691d2952d88ac').toBuffer(),
                                txId: '901b20288fe7787c76f8dd5af5f09cb932879484db652f466a07e33aed22d255',
                            },
                        ],
                        hex: '010000000267e0350896a5345952b7e6211e6693394e6915722b854ca8e553f9b9a627c172000000004900473044022052e766bffd20b421d9aa777cafd5951d5ceeef179f0068712a4a7f1ee1551d1e022066a5c14ac23c7feba582eb45eacfa973f1c6f5f8a4033607b4dfece5335125bd41ffffffff44c21063e3e1bddfdb668dad703070cad5f8717ba06417e94acb2f1a38b711bf010000006b483045022100e4c3ac05b3ff6c4300fd4f36514ac7f251e5ecce2c5f6b8886d55f76d19745e702201d96e89558663f9b327fa619db8384cfe0c55f08b84c7a53e8830ba592b94418412103a63c9cffaad5c8e23b272e0506808ea1daa9a9eb79279ab514d2e05f8598207affffffff02a00f000000000000fd2d01512103a63c9cffaad5c8e23b272e0506808ea1daa9a9eb79279ab514d2e05f8598207a51ae4d04017b225f5f696e646578223a7b226f626a223a307d2c225f5f66756e63223a2273657454616773222c225f5f61726773223a5b5b22346462313538373566616362636166643432633661313838386330346137396365616332646438323839346664643465313033373763363337323134616538643a30222c22363236626539656431623464613764363763643633303664303635303062303961333562646266376163386565373762383161363333663464636439373763393a30222c22626631316237333831613266636234616539313736346130376237316638643563613730333037306164386436366462646662646531653336333130633234343a30225d5d7d75d30d5b00000000001976a914d5741755803fad66991309467ed4e11691d2952d88ac00000000',
                    },
                ],
                hash: '000000000000028d144d6cbdb4cf24aca08f809a4757f9c60ec52193bcf36039',
                confirmations: 9,
                size: 2084,
                height: 1412665,
                version: 536870912,
                versionHex: '20000000',
                merkleroot: '1c9280ffb4d2dba33aa3046a3e575c4f25161f1c49d6b07f1fadd72956ba5a99',
                num_tx: 4,
                time: 1614777746,
                mediantime: 1614773734,
                nonce: 624756396,
                bits: '1a036bc7',
                difficulty: 4904102.384756399,
                chainwork: '0000000000000000000000000000000000000000000000ed3aca86bcd6ca7a29',
                previousblockhash: '0000000000000106d2fb351c2574a316c4b792cf6240813e3eeb7d7368e3c91c',
                nextblockhash: '00000000000000440335e8941b5c1eb61c8eb161fddcdc704a413d306e30cfd6',
            };
            const blocksMap = {};
            blocksMap[block.hash] = block;
            // partialSync a single block
            const syncedHeight = block.height;
            const bitcoindSyncedHeight = block.height;
            const selectActionStub = sinon_1.default.stub(selectSyncAction, 'default').resolves({
                syncedHeight,
                bitcoindSyncedHeight,
                bitcoindSyncedProgress: 0.999,
            });
            const updateActionStub = sinon_1.default.stub(updateSyncAction, 'default').resolves();
            const syncTractionActionStub = sinon_1.default.stub(syncTransactionAction, 'default').resolves();
            // RpcClient.__setMockBlockCount(1)
            // RpcClient.__setMockBlockHashes(block.height, block.hash)
            // RpcClient.__setMockBlocksMap(blocksMap)
            // mock above methods when converting
            await (0, sync_action_1.partialSync)(syncedHeight, bitcoindSyncedHeight, 0.999);
            const { CHAIN, NETWORK, BCN_URL } = config_1.default;
            const computer = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL });
            const bcTxs = await Promise.all(block.tx.map((tx) => computer.db.fromTxHex(tx.hex)));
            expect(syncTractionActionStub.calledOnce).to.be.true;
            expect(syncTractionActionStub.calledWith(bcTxs)).to.be.true;
            expect(updateActionStub.calledOnce).to.be.true;
            selectActionStub.restore();
            updateActionStub.restore();
            syncTractionActionStub.restore();
        });
    });
});
