"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInt32 = void 0;
function get4RandomBytes() {
    const bytes = new Uint8Array(4);
    window.crypto.getRandomValues(bytes);
    return bytes;
}
// Only to be used to initialize the context for rust-secp256k1
function generateInt32() {
    const array = get4RandomBytes();
    return ((array[0] << (3 * 8)) +
        (array[1] << (2 * 8)) +
        (array[2] << (1 * 8)) +
        array[3]);
}
exports.generateInt32 = generateInt32;
