// https://en.bitcoin.it/wiki/List_of_address_prefixes
// Dogecoin BIP32 is a proposed standard: https://bitcointalk.org/index.php?topic=409731
import { getNetworkConfig } from './chains/index.js';
const cache = new Map();
function toNetwork(params) {
    return Object.freeze({
        messagePrefix: params.messagePrefix,
        bech32: params.bech32 ?? '',
        bip32: params.bip32,
        pubKeyHash: params.pubKeyHash,
        scriptHash: params.scriptHash,
        wif: params.wif,
    });
}
export function getNetwork(chain, network) {
    const key = `${chain}:${network}`;
    const cached = cache.get(key);
    if (cached)
        return cached;
    const resolved = getNetworkConfig(chain, network);
    const value = toNetwork(resolved);
    cache.set(key, value);
    return value;
}
export function getBech32Prefix(network) {
    if (typeof network.bech32 !== 'string' || network.bech32.length === 0) {
        throw new Error('Network does not define a bech32 prefix');
    }
    return network.bech32;
}
export const bitcoin = getNetwork('BTC', 'mainnet');
export const testnet = getNetwork('BTC', 'testnet');
export const regtest = getNetwork('BTC', 'regtest');
export const litecoin = getNetwork('LTC', 'mainnet');
export const litecointestnet = getNetwork('LTC', 'testnet');
export const litecoinregtest = getNetwork('LTC', 'regtest');
export const pepecoin = getNetwork('PEPE', 'mainnet');
export const pepecointestnet = getNetwork('PEPE', 'testnet');
export const pepecoinregtest = getNetwork('PEPE', 'regtest');
export const dogecoin = getNetwork('DOGE', 'mainnet');
export const dogecointestnet = getNetwork('DOGE', 'testnet');
export const dogecoinregtest = getNetwork('DOGE', 'regtest');
export const wojakcoin = getNetwork('WOJAK', 'mainnet');
export const wojakcointestnet = getNetwork('WOJAK', 'testnet');
export const wojakcoinregtest = getNetwork('WOJAK', 'regtest');
export const NETWORKS = {
    bitcoin,
    regtest,
    testnet,
    litecoin,
    litecoinregtest,
    litecointestnet,
    pepecoin,
    pepecoinregtest,
    pepecointestnet,
    dogecoin,
    dogecoinregtest,
    dogecointestnet,
    wojakcoin,
    wojakcoinregtest,
    wojakcointestnet,
};
