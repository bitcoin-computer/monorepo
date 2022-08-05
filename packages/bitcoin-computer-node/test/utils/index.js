"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthHeader = void 0;
const hash_js_1 = __importDefault(require("hash.js"));
const config_1 = __importDefault(require("../../src/config"));
const createAuthHeader = (key, 
// eslint-disable-next-line default-param-last
clientTimestamp = Date.now(), signature) => {
    if (!signature) {
        const msgHash = hash_js_1.default
            .sha256()
            .update(config_1.default.BCN_URL + clientTimestamp)
            .digest('hex');
        // eslint-disable-next-line no-param-reassign
        signature = key.sign(msgHash).toDER('hex');
    }
    const publicKey = key.getPublic().encodeCompressed('hex');
    const tokenParts = [signature, publicKey, clientTimestamp];
    const authToken = Buffer.from(tokenParts.join(':')).toString('base64');
    const authHeader = `Bearer ${authToken}`;
    return authHeader;
};
exports.createAuthHeader = createAuthHeader;
