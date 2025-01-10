/// <reference types="vite/client" />
import 'dotenv/config';
let VITE_API_BASE_URL;
let VITE_CHESS_GAME_MOD_SPEC;
let VITE_CHAIN;
let VITE_NETWORK;
let VITE_URL;
let VITE_MNEMONIC;
// Vite environment
if (import.meta.env && import.meta.env.MODE) {
    VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    VITE_CHESS_GAME_MOD_SPEC = import.meta.env.VITE_CHESS_GAME_MOD_SPEC;
    VITE_CHAIN = import.meta.env.VITE_CHAIN;
    VITE_NETWORK = import.meta.env.VITE_NETWORK;
    VITE_URL = import.meta.env.VITE_URL;
    VITE_MNEMONIC = import.meta.env.VITE_MNEMONIC;
    // Node.js environment
}
else if (typeof process === 'object' && process.versions && process.versions.node) {
    VITE_API_BASE_URL = process.env.VITE_API_BASE_URL;
    VITE_CHESS_GAME_MOD_SPEC = process.env.VITE_CHESS_GAME_MOD_SPEC;
    VITE_CHAIN = process.env.VITE_CHAIN;
    VITE_NETWORK = process.env.VITE_NETWORK;
    VITE_URL = process.env.VITE_URL;
    VITE_MNEMONIC = process.env.VITE_MNEMONIC;
}
else {
    throw new Error('Unsupported execution environment.');
}
const vars = [VITE_API_BASE_URL, VITE_CHESS_GAME_MOD_SPEC, VITE_CHAIN, VITE_NETWORK, VITE_URL];
if (vars.some((el) => el === undefined))
    throw new Error(`Please create a .env file ${vars}`);
export { VITE_API_BASE_URL, VITE_CHESS_GAME_MOD_SPEC, VITE_CHAIN, VITE_NETWORK, VITE_URL, VITE_MNEMONIC };
