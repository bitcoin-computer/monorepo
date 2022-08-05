"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-expressions */
const elliptic_1 = require("elliptic");
const crypto_1 = __importDefault(require("crypto"));
const mock_express_response_1 = __importDefault(require("mock-express-response"));
const mock_express_request_1 = __importDefault(require("mock-express-request"));
const fs_1 = __importDefault(require("fs"));
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const auth_1 = __importDefault(require("../src/middleware/auth"));
const config_1 = __importDefault(require("../src/config"));
const user_service_1 = __importDefault(require("../src/services/user.service"));
const utils_1 = require("./utils");
const accesslist_1 = __importDefault(require("../src/middleware/accesslist"));
chai_1.default.use(sinon_chai_1.default);
const { expect } = chai_1.default;
afterEach(() => {
    sinon_1.default.restore();
});
describe('middleware', () => {
    describe('auth middleware', () => {
        const clientTimestamp = Date.now();
        const ec = new elliptic_1.ec('secp256k1');
        const key = ec.genKeyPair();
        const publicKey = key.getPublic().encodeCompressed('hex');
        describe('Successful authentication', () => {
            const mockRequest = new mock_express_request_1.default({
                headers: {
                    Authentication: (0, utils_1.createAuthHeader)(key),
                },
            });
            const mockResponse = new mock_express_response_1.default();
            const mockNextFn = sinon_1.default.fake();
            // TODO: revisit this test when fixing auth check (#112 https://trello.com/c/jSXud0VH)
            it.skip('Should call next() function and add a new user for the first time', async () => {
                const selectStub = sinon_1.default
                    .stub(user_service_1.default, 'select')
                    .resolves({ publicKey, clientTimestamp: 123 });
                await (0, auth_1.default)(mockRequest, mockResponse, mockNextFn);
                const insertStub = sinon_1.default.stub(user_service_1.default, 'insert').resolves();
                const updateStub = sinon_1.default.stub(user_service_1.default, 'update').resolves();
                expect(insertStub.calledOnce);
                expect(updateStub.notCalled);
                expect(mockNextFn).to.have.been.called;
                insertStub.restore();
                updateStub.restore();
                selectStub.restore();
            });
            // TODO: revisit this test when fixing auth check (#112 https://trello.com/c/jSXud0VH)
            it.skip('Should call next() function and touch the user otherwise', async () => {
                const selectStub = sinon_1.default
                    .stub(user_service_1.default, 'select')
                    .resolves({ publicKey, clientTimestamp: 123 });
                await (0, auth_1.default)(mockRequest, mockResponse, mockNextFn);
                const insertStub = sinon_1.default.stub(user_service_1.default, 'insert').resolves();
                const updateStub = sinon_1.default.stub(user_service_1.default, 'update').resolves();
                expect(insertStub.notCalled);
                expect(updateStub.calledOnce);
                expect(mockNextFn).to.have.been.called;
                insertStub.restore();
                updateStub.restore();
                selectStub.restore();
            });
        });
        describe('Failed authentication', () => {
            it('Should set `401 Unauthorized` status if Authentication header is missing', async () => {
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default();
                const mockNextFn = sinon_1.default.fake();
                await (0, auth_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockNextFn).to.have.been.called;
            });
            it('Should set `401 Unauthorized` status if signature is too old', async () => {
                const timestampTooOld = Date.now() - config_1.default.SIGNATURE_FRESHNESS_MINUTES * 1000 * 60 - 1;
                const mockRequest = new mock_express_request_1.default({
                    headers: {
                        Authentication: (0, utils_1.createAuthHeader)(key, timestampTooOld),
                    },
                });
                const mockResponse = new mock_express_response_1.default();
                const mockNextFn = sinon_1.default.fake();
                await (0, auth_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockResponse.statusCode).eq(401);
                // eslint-disable-next-line no-underscore-dangle
                expect(mockResponse._getJSON()).to.deep.equal({ error: 'Signature is too old.' });
                expect(mockNextFn).to.not.have.been.called;
            });
            it('Should set `401 Unauthorized` status if signature verification failed', async () => {
                const signature = key.sign('something-else').toDER('hex');
                const mockRequest = new mock_express_request_1.default({
                    headers: {
                        Authentication: (0, utils_1.createAuthHeader)(key, Date.now(), signature),
                    },
                });
                const mockResponse = new mock_express_response_1.default();
                const mockNextFn = sinon_1.default.fake();
                await (0, auth_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockResponse.statusCode).eq(401);
                // eslint-disable-next-line no-underscore-dangle
                expect(mockResponse._getJSON()).to.deep.equal({
                    error: "The origin and public key pair doesn't match the signature.",
                });
                expect(mockNextFn).to.not.have.been.called;
            });
            it('Should set `401 Unauthorized` status if signature is invalid', async () => {
                const signature = 'invalid-signature';
                const mockRequest = new mock_express_request_1.default({
                    headers: {
                        Authentication: (0, utils_1.createAuthHeader)(key, Date.now(), signature),
                    },
                });
                const mockResponse = new mock_express_response_1.default();
                const mockNextFn = sinon_1.default.fake();
                await (0, auth_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockResponse.statusCode).eq(401);
                // eslint-disable-next-line no-underscore-dangle
                expect(mockResponse._getJSON()).to.deep.equal({ error: 'Signature without r or s' });
                expect(mockNextFn).to.not.have.been.called;
            });
            // TODO: revisit this test when fixing auth check (#112 https://trello.com/c/jSXud0VH)
            it.skip('Should set `401 Unauthorized` status in case of replay', async () => {
                const mockRequest = new mock_express_request_1.default({
                    headers: {
                        Authentication: (0, utils_1.createAuthHeader)(key, clientTimestamp),
                    },
                });
                const mockResponse = new mock_express_response_1.default();
                const mockNextFn = sinon_1.default.fake();
                const selectStub = sinon_1.default
                    .stub(user_service_1.default, 'select')
                    .resolves({ publicKey, clientTimestamp });
                await (0, auth_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockResponse.statusCode).eq(401);
                // eslint-disable-next-line no-underscore-dangle
                expect(mockResponse._getJSON()).to.deep.equal({
                    error: 'Please use a fresh authentication token.',
                });
                expect(mockNextFn).to.not.have.been.called;
                selectStub.restore();
            });
        });
    });
    describe('accesslist middleware', () => {
        const publicKey = crypto_1.default.randomBytes(33).toString('hex');
        const publicKey2 = crypto_1.default.randomBytes(33).toString('hex');
        describe('whitelist', () => {
            it('Should allow whitelisted public keys only', async () => {
                const bcnConfig = {
                    whitelist: [publicKey],
                };
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockNextFn).to.have.been.called;
                sinonReadFileSyncStub.restore();
            });
            it('Should set `403 Unauthenticated` status if whitelist does not contain public key', async () => {
                const bcnConfig = {
                    whitelist: [publicKey2],
                };
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockResponse.statusCode).eq(403);
                // eslint-disable-next-line no-underscore-dangle
                expect(mockResponse._getJSON()).to.deep.equal({
                    error: `Public key ${publicKey} is not allowed.`,
                });
                expect(mockNextFn).to.not.have.been.called;
                sinonReadFileSyncStub.restore();
            });
            it('Should set `403 Unauthenticated` if whitelist is empty', async () => {
                const bcnConfig = {
                    whitelist: [],
                };
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockResponse.statusCode).eq(403);
                // eslint-disable-next-line no-underscore-dangle
                expect(mockResponse._getJSON()).to.deep.equal({
                    error: `Public key ${publicKey} is not allowed.`,
                });
                expect(mockNextFn).to.not.have.been.called;
                sinonReadFileSyncStub.restore();
            });
            it('Should disable feature if whitelist is undefined', async () => {
                const bcnConfig = {};
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockNextFn).to.have.been.called;
                sinonReadFileSyncStub.restore();
            });
        });
        describe('blacklist', () => {
            it('Should set `403 Unauthenticated` status for blacklisted public keys only', async () => {
                const bcnConfig = {
                    blacklist: [publicKey],
                };
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockResponse.statusCode).eq(403);
                // eslint-disable-next-line no-underscore-dangle
                expect(mockResponse._getJSON()).to.deep.equal({
                    error: `Public key ${publicKey} is not allowed.`,
                });
                expect(mockNextFn).to.not.have.been.called;
                sinonReadFileSyncStub.restore();
            });
            it('Should allow all public keys otherwise', async () => {
                const bcnConfig = {
                    blacklist: [publicKey2],
                };
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockNextFn).to.have.been.called;
                sinonReadFileSyncStub.restore();
            });
            it('Should disable feature if blacklist is empty', async () => {
                const bcnConfig = {
                    blacklist: [],
                };
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockNextFn).to.have.been.called;
                sinonReadFileSyncStub.restore();
            });
            it('Should disable feature if blacklist is undefined', async () => {
                const bcnConfig = {};
                const sinonReadFileSyncStub = sinon_1.default
                    .stub(fs_1.default, 'readFileSync')
                    .returns(Buffer.from(JSON.stringify(bcnConfig)));
                const mockRequest = new mock_express_request_1.default();
                const mockResponse = new mock_express_response_1.default({
                    locals: {
                        authToken: { publicKey },
                    },
                });
                const mockNextFn = sinon_1.default.fake();
                (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
                expect(mockNextFn).to.have.been.called;
                sinonReadFileSyncStub.restore();
            });
        });
        it('Should throw an error if "auth" middleware is not installed', () => {
            const mockRequest = new mock_express_request_1.default();
            const mockResponse = new mock_express_response_1.default();
            const mockNextFn = sinon_1.default.fake();
            (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn);
            expect(mockNextFn).to.have.been.called;
        });
        it("Should disable feature if bcn.config.json file doesn't exist", () => {
            const mockRequest = new mock_express_request_1.default();
            const mockResponse = new mock_express_response_1.default({
                locals: {
                    authToken: { publicKey },
                },
            });
            const mockNextFn = sinon_1.default.fake();
            const sinonReadFileSyncStub = sinon_1.default.stub(fs_1.default, 'readFileSync').callsFake(() => {
                throw new Error("ENOENT: no such file or directory, open '/Users/bitcoin-computer-node-secret/bcn.config.json'");
            });
            // The error should be silenced if bcn.config.json file doesn't exist.
            expect(() => (0, accesslist_1.default)(mockRequest, mockResponse, mockNextFn)).not.throws("ENOENT: no such file or directory, open '/Users/bitcoin-computer-node-secret/bcn.config.json'");
            expect(mockNextFn).to.have.been.called;
            sinonReadFileSyncStub.restore();
        });
    });
});
