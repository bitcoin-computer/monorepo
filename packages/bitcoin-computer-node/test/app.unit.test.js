"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedDelete = exports.authenticatedPost = exports.authenticatedGet = void 0;
/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-unused-expressions */
/* eslint max-classes-per-file: ["error", 10] */
const elliptic_1 = require("elliptic");
const bitcoin_computer_bitcore_1 = require("bitcoin-computer-bitcore");
const axios_1 = __importDefault(require("axios"));
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const db_1 = __importDefault(require("../src/db"));
const utils_1 = require("./utils");
const config_1 = __importDefault(require("../src/config"));
const { UN_P2SH_URL } = process.env;
const { crypto } = bitcoin_computer_bitcore_1.Bitcoin;
const { Random } = crypto;
const arrayEquals = (a1, a2) => a1.length === a2.length &&
    a1
        .slice()
        .sort()
        .every((value, index) => value === a2.slice().sort()[index]);
const authenticatedGet = async (route, baseUrl, authHeader) => axios_1.default.get(`${baseUrl}${route}`, {
    headers: {
        Authentication: authHeader,
    },
});
exports.authenticatedGet = authenticatedGet;
const authenticatedPost = async (route, data, baseUrl, authHeader) => axios_1.default.post(`${baseUrl}${route}`, data, {
    headers: {
        Authentication: authHeader,
    },
});
exports.authenticatedPost = authenticatedPost;
const authenticatedDelete = async (route, baseUrl, authHeader) => axios_1.default.delete(`${baseUrl}${route}`, {
    headers: {
        Authentication: authHeader,
    },
});
exports.authenticatedDelete = authenticatedDelete;
const ec = new elliptic_1.ec('secp256k1');
const key = ec.genKeyPair();
const publicKey = key.getPublic().encodeCompressed('hex');
const key2 = ec.genKeyPair();
const publicKey2 = key2.getPublic().encodeCompressed('hex');
describe('app', () => {
    describe('Smart Object API', () => {
        describe('POST /v1/${config.CHAIN}/${config.NETWORK}/revs', () => {
            afterEach(async () => {
                await db_1.default.none('DELETE FROM "NonStandard"');
            });
            it('Should return the latest rev for the single input object id', async () => {
                const txId = Random.getRandomBuffer(8).toString('hex');
                const txId2 = Random.getRandomBuffer(8).toString('hex');
                class A {
                }
                class B {
                }
                const contractString = A.toString();
                const contractString2 = B.toString();
                const classHash = crypto.Hash.sha256(Buffer.from(contractString)).toString('hex');
                const classHash2 = crypto.Hash.sha256(Buffer.from(contractString2)).toString('hex');
                await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash})', { id: `${txId}/0`, rev: `${txId}/0`, publicKeys: [publicKey], classHash });
                await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash2})', {
                    id: `${txId2}/0`,
                    rev: `${txId2}/2`,
                    publicKeys: [publicKey],
                    classHash2,
                });
                await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash})', {
                    id: `${txId2}/1`,
                    rev: `${txId2}/1`,
                    publicKeys: [publicKey2],
                    classHash,
                });
                const res2 = await (0, exports.authenticatedPost)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/revs`, { ids: [`${txId}/0`] }, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res2).to.not.be.undefined;
                (0, chai_1.expect)(res2.status).eq(200);
                (0, chai_1.expect)(res2.data.length).eq(1);
                (0, chai_1.expect)(res2.data[0]).eq(`${txId}/0`);
            });
            it('Should return the latest revs for an array of ids (without ordering)', async () => {
                const txId = Random.getRandomBuffer(8).toString('hex');
                class E {
                }
                class F {
                }
                const contractString = E.toString();
                const contractString2 = F.toString();
                const classHash = crypto.Hash.sha256(Buffer.from(contractString)).toString('hex');
                const classHash2 = crypto.Hash.sha256(Buffer.from(contractString2)).toString('hex');
                await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash})', { id: `${txId}/0`, rev: `${txId}/0`, publicKeys: [publicKey], classHash });
                await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash})', {
                    id: `${txId}/1`,
                    rev: `${txId}/1`,
                    publicKeys: [publicKey],
                    classHash: classHash2,
                });
                const res1 = await (0, exports.authenticatedPost)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/revs`, { ids: [`${txId}/1`, `${txId}/0`] }, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res1).to.not.be.undefined;
                (0, chai_1.expect)(res1.status).eq(200);
                (0, chai_1.expect)(res1.data.length).eq(2);
                (0, chai_1.expect)(res1.data.sort()).to.deep.eq([`${txId}/1`, `${txId}/0`].sort());
                const res2 = await (0, exports.authenticatedPost)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/revs`, { ids: [`${txId}/0`, `${txId}/1`] }, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res2).to.not.be.undefined;
                (0, chai_1.expect)(res2.status).eq(200);
                (0, chai_1.expect)(res2.data.length).eq(2);
                (0, chai_1.expect)(res2.data[0]).eq(`${txId}/0`);
                (0, chai_1.expect)(res2.data[1]).eq(`${txId}/1`);
            });
        });
        describe('GET /v1/${config.CHAIN}/${config.NETWORK}/non-standard-utxos', () => {
            describe('Endpoint normal behavior', () => {
                const txId = Random.getRandomBuffer(8).toString('hex');
                const txId2 = Random.getRandomBuffer(8).toString('hex');
                class C {
                }
                class D {
                }
                const contractString = C.toString();
                const contractString2 = D.toString();
                const classHash = crypto.Hash.sha256(Buffer.from(contractString)).toString('hex');
                const classHash2 = crypto.Hash.sha256(Buffer.from(contractString2)).toString('hex');
                (0, mocha_1.before)(async () => {
                    await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash})', {
                        id: `${txId}/0`,
                        rev: `${txId}/0`,
                        publicKeys: [publicKey],
                        classHash,
                    });
                    await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash})', {
                        id: `${txId2}/0`,
                        rev: `${txId2}/2`,
                        publicKeys: [publicKey],
                        classHash: classHash2,
                    });
                    await db_1.default.none('INSERT INTO "NonStandard" ("id", "rev", "publicKeys", "classHash") VALUES (${id}, ${rev}, ${publicKeys}, ${classHash})', {
                        id: `${txId}/1`,
                        rev: `${txId}/1`,
                        publicKeys: [publicKey],
                        classHash,
                    });
                });
                after(async () => {
                    await db_1.default.none('DELETE FROM "NonStandard"');
                });
                it('Should return the latest revs for a given public key', async () => {
                    const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/non-standard-utxos?publicKey=${publicKey}`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                    (0, chai_1.expect)(res).to.not.be.undefined;
                    (0, chai_1.expect)(res.status).eq(200);
                    (0, chai_1.expect)(res.data.length).eq(3);
                    (0, chai_1.expect)(arrayEquals[(res.data[0], res.data[1], `${txId}/0`, `${txId2}/2`)]);
                });
                it('Should return the latest revs for a given contract hash', async () => {
                    const res3 = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/non-standard-utxos?classHash=${classHash2}`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                    (0, chai_1.expect)(res3).to.not.be.undefined;
                    (0, chai_1.expect)(res3.status).eq(200);
                    (0, chai_1.expect)(res3.data.length).eq(1);
                    (0, chai_1.expect)(res3.data[0]).to.deep.eq(`${txId2}/2`);
                });
            });
            it('Should return blank if there are no latest revs for the given public key in the database', async () => {
                const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/non-standard-utxos?publicKey=${publicKey}`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res).to.not.be.undefined;
                (0, chai_1.expect)(res.status).eq(200);
                (0, chai_1.expect)(res.data.length).eq(0);
            });
            it('Should return blank if there are no parameters set', async () => {
                const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/non-standard-utxos`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res).to.not.be.undefined;
                (0, chai_1.expect)(res.status).eq(200);
                (0, chai_1.expect)(res.data.length).eq(0);
            });
            it('Should return blank if there are latest revs for the given public key in the database', async () => {
                const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/non-standard-utxos?publicKey=${publicKey}`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res).to.not.be.undefined;
                (0, chai_1.expect)(res.status).eq(200);
                (0, chai_1.expect)(res.data.length).eq(0);
            });
        });
        describe('GET /wallet/:address/utxos', () => {
            const address = 'mzoGRNh55y9j57TPdwRGi3nt9X4CFwpqUS';
            it('Should return the standard unspent transaction outputs for a given address', async () => {
                const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/wallet/${address}/utxos`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res).to.not.be.undefined;
                (0, chai_1.expect)(res.status).eq(200);
                // This expect fails if the test wallets are not funded so we skip it in that case.
                if (res.data.length) {
                    (0, chai_1.expect)(res.data[0].txid).to.be.a('string');
                    (0, chai_1.expect)(res.data[0].vout).to.be.a('string');
                    (0, chai_1.expect)(res.data[0].address).eq(address);
                    (0, chai_1.expect)(res.data[0].scriptPubKey).eq('76a914d3802d2126be127424c647f2e90cfa4a15b49a2388ac');
                    (0, chai_1.expect)(res.data[0].amount).to.be.a('number');
                    (0, chai_1.expect)(res.data[0].satoshis).to.be.a('number');
                }
            });
            it('Should return [] if the given address does not exist in the database', async () => {
                const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/wallet/2N7ZZBWXQtoWPvfmmPXcJtDiGxNGLzdsY4N/utxos/`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res).to.not.be.undefined;
                (0, chai_1.expect)(res.status).eq(200);
                (0, chai_1.expect)(res.data.length).eq(0);
            });
        });
        describe('GET /address/${address}/balance', () => {
            const address = 'mzoGRNh55y9j57TPdwRGi3nt9X4CFwpqUS';
            it('Should return the balance of a given address that exists in the database', async () => {
                const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/address/${address}/balance`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res).to.not.be.undefined;
                (0, chai_1.expect)(res.status).eq(200);
                (0, chai_1.expect)(res.data).to.be.a('number');
            });
            it('Should return 0 if the given address does not exist in the database', async () => {
                const res = await (0, exports.authenticatedGet)(`/v1/${config_1.default.CHAIN}/${config_1.default.NETWORK}/address/2N7ZZBWXQtoWPvfmmPXcJtDiGxNGLzdsY4N/balance/`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res).to.not.be.undefined;
                (0, chai_1.expect)(res.status).eq(200);
                (0, chai_1.expect)(res.data).eq(0);
            });
        });
    });
    describe('Off Chain Store API', () => {
        describe('GET /:id', () => {
            it('Should return data', async () => {
                const data = Math.random().toString();
                const hash = bitcoin_computer_bitcore_1.Bitcoin.crypto.Hash.sha256(Buffer.from(data)).toString('hex');
                await db_1.default.none('INSERT INTO "OffChain"("id", "data") VALUES(${id}, ${data})', {
                    data,
                    id: hash,
                });
                const res = await (0, exports.authenticatedGet)(`/v1/store/${hash}`, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res.status).eq(200);
                (0, chai_1.expect)(res.data).to.deep.eq(data);
                await db_1.default.none('DELETE FROM "OffChain" WHERE "id" = ${id}', { id: hash });
            });
        });
        describe('POST /', () => {
            it('Should post data', async () => {
                class A {
                    constructor() {
                        this.n = 1;
                    }
                }
                const data = { __cls: A.toString() }.toString();
                const body = { data };
                const res = await (0, exports.authenticatedPost)(`/v1/store`, body, UN_P2SH_URL, (0, utils_1.createAuthHeader)(key));
                (0, chai_1.expect)(res.status).eq(201);
                const hash = bitcoin_computer_bitcore_1.Bitcoin.crypto.Hash.sha256(Buffer.from(data)).toString('hex');
                (0, chai_1.expect)(res.data._url).eq(`${UN_P2SH_URL.toLowerCase()}/store/${hash}`);
                const dbResult = await db_1.default.any('SELECT "id", "data" FROM "OffChain" WHERE id = ${id}', {
                    id: hash,
                });
                (0, chai_1.expect)(dbResult.length).eq(1);
                (0, chai_1.expect)(dbResult[0].id).eq(hash);
                (0, chai_1.expect)(dbResult[0].data.toString()).eq(data);
                await db_1.default.none('DELETE FROM "OffChain" WHERE "id" = ${hash}', { hash });
            });
        });
    });
});
