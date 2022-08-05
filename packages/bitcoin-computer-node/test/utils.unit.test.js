"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-expressions */
const elliptic_1 = require("elliptic");
const hash_js_1 = __importDefault(require("hash.js"));
const chai_1 = require("chai");
const utils_1 = require("../src/utils");
const utils_2 = require("./utils");
describe('utils', () => {
    describe('auth utils', () => {
        const ec = new elliptic_1.ec('secp256k1');
        const key = ec.genKeyPair();
        const publicKey = key.getPublic().encodeCompressed('hex');
        const msgHash = hash_js_1.default.sha256().update('message').digest('hex');
        const signature = key.sign(msgHash).toDER('hex');
        const timestamp = Date.now();
        it('Should create Authentication header and parse it', () => {
            const authHeader = (0, utils_2.createAuthHeader)(key, timestamp, signature);
            const authToken = (0, utils_1.parseAuthToken)(authHeader);
            (0, chai_1.expect)(authToken.signature).eq(signature);
            (0, chai_1.expect)(authToken.publicKey).eq(publicKey);
            (0, chai_1.expect)(authToken.timestamp).eq(timestamp);
            (0, chai_1.expect)(key.verify(msgHash, signature)).to.be.true;
        });
    });
    describe('arraysEqual utils', () => {
        it('Should work with identical arrays', () => {
            const a = [{ a: 20, b: 'hello', c: 'world' }];
            const b = [{ a: 20, b: 'hello', c: 'world' }];
            (0, chai_1.expect)((0, utils_1.equalArrays)(a, b)).eq(true);
        });
        it('Should work with object with different key order', () => {
            const a = [{ a: 20, c: 'world', b: 'hello' }];
            const b = [{ a: 20, b: 'hello', c: 'world' }];
            (0, chai_1.expect)((0, utils_1.equalArrays)(a, b)).eq(true);
        });
        it('Should work with object with different key order, different values', () => {
            const a = [{ a: 20, b: 'hello', c: 'world' }];
            const b = [{ a: 8, c: 'world', b: 'hello' }];
            (0, chai_1.expect)((0, utils_1.equalArrays)(a, b)).eq(false);
        });
        it('Should work with different arrays in length', () => {
            const a = [{ a: 20, c: 'world', b: 'hello' }];
            const b = [
                { a: 20, c: 'world', b: 'hello' },
                { a: 20, c: 'world', b: 'hello' },
            ];
            (0, chai_1.expect)((0, utils_1.equalArrays)(a, b)).eq(false);
        });
        it('Should work with object arrays containing different object types', () => {
            const a = [
                { a: 7, c: 'bye', b: 'bye' },
                { a: 20, c: 'world', b: 'hello' },
            ];
            const b = [
                { a: 20, c: 'world', b: 'hello' },
                { a: 7, c: 'bye', b: 'bye' },
            ];
            (0, chai_1.expect)((0, utils_1.equalArrays)(a, b)).eq(true);
        });
        it('Should work with same utxos set, different object ordering ', () => {
            const a = [
                {
                    address: 'mx4WdU51jPh6KKvT5Dq27wMJJUW81vbF7y',
                    amount: 49.99976817,
                    satoshis: 4999976817,
                    scriptPubKey: '76a914b579e625fdfdca267d3b57ccc130f501fa1a27d188ac',
                    txid: '5c84c2b6b95a97eab570da1820e5f099f2216d980aaf7d9823f4082252206e7f',
                    vout: 5,
                },
                {
                    address: 'mx4WdU51jPh6KKvT5Dq27wMJJUW81vbF7y',
                    amount: 50,
                    satoshis: 5000000000,
                    scriptPubKey: '76a914b579e625fdfdca267d3b57ccc130f501fa1a27d188ac',
                    txid: 'ac676b8137bd66513d6dbcdd7ae8721d9c7d6fc4b75ce4e939ea7e20805ed0ac',
                    vout: 0,
                },
                {
                    address: 'mx4WdU51jPh6KKvT5Dq27wMJJUW81vbF7y',
                    amount: 25,
                    satoshis: 2500000000,
                    scriptPubKey: '76a914b579e625fdfdca267d3b57ccc130f501fa1a27d188ac',
                    txid: '82dfd1af79519bad58f33608df7a01d3d2cced1b2f1864a7d91ca7b07289ad38',
                    vout: 0,
                },
            ];
            const b = [
                {
                    address: 'mx4WdU51jPh6KKvT5Dq27wMJJUW81vbF7y',
                    amount: 25,
                    satoshis: 2500000000,
                    scriptPubKey: '76a914b579e625fdfdca267d3b57ccc130f501fa1a27d188ac',
                    txid: '82dfd1af79519bad58f33608df7a01d3d2cced1b2f1864a7d91ca7b07289ad38',
                    vout: 0,
                },
                {
                    address: 'mx4WdU51jPh6KKvT5Dq27wMJJUW81vbF7y',
                    amount: 49.99976817,
                    satoshis: 4999976817,
                    scriptPubKey: '76a914b579e625fdfdca267d3b57ccc130f501fa1a27d188ac',
                    txid: '5c84c2b6b95a97eab570da1820e5f099f2216d980aaf7d9823f4082252206e7f',
                    vout: 5,
                },
                {
                    address: 'mx4WdU51jPh6KKvT5Dq27wMJJUW81vbF7y',
                    amount: 50,
                    satoshis: 5000000000,
                    scriptPubKey: '76a914b579e625fdfdca267d3b57ccc130f501fa1a27d188ac',
                    txid: 'ac676b8137bd66513d6dbcdd7ae8721d9c7d6fc4b75ce4e939ea7e20805ed0ac',
                    vout: 0,
                },
            ];
            (0, chai_1.expect)((0, utils_1.equalArrays)(a, b)).eq(true);
            (0, chai_1.expect)((0, utils_1.equalArrays)(b, a)).eq(true);
        });
    });
});
