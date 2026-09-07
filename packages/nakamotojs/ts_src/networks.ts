// https://en.bitcoin.it/wiki/List_of_address_prefixes
// Dogecoin BIP32 is a proposed standard: https://bitcointalk.org/index.php?topic=409731
import { getNetworkConfig } from './chains/index.js';

export interface Network {
  messagePrefix: string;
  // Present on all built-ins (dummy prefix for chains that do not use bech32).
  // ChainConfig.bech32 is optional; getNetwork fills an empty string if omitted.
  bech32: string;
  bip32: Bip32;
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
}

interface Bip32 {
  public: number;
  private: number;
}

const cache = new Map<string, Network>();

function toNetwork(params: {
  messagePrefix: string;
  bech32?: string;
  bip32: Bip32;
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
}): Network {
  return Object.freeze({
    messagePrefix: params.messagePrefix,
    bech32: params.bech32 ?? '',
    bip32: params.bip32,
    pubKeyHash: params.pubKeyHash,
    scriptHash: params.scriptHash,
    wif: params.wif,
  });
}

export function getNetwork(chain: string, network: string): Network {
  const key = `${chain}:${network}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const resolved = getNetworkConfig(chain, network);
  const value = toNetwork(resolved);
  cache.set(key, value);
  return value;
}

export function getBech32Prefix(network: Network): string {
  if (typeof network.bech32 !== 'string' || network.bech32.length === 0) {
    throw new Error('Network does not define a bech32 prefix');
  }
  return network.bech32;
}

export const bitcoin: Network = getNetwork('BTC', 'mainnet');
export const testnet: Network = getNetwork('BTC', 'testnet');
export const regtest: Network = getNetwork('BTC', 'regtest');

export const litecoin: Network = getNetwork('LTC', 'mainnet');
export const litecointestnet: Network = getNetwork('LTC', 'testnet');
export const litecoinregtest: Network = getNetwork('LTC', 'regtest');

export const pepecoin: Network = getNetwork('PEPE', 'mainnet');
export const pepecointestnet: Network = getNetwork('PEPE', 'testnet');
export const pepecoinregtest: Network = getNetwork('PEPE', 'regtest');

export const dogecoin: Network = getNetwork('DOGE', 'mainnet');
export const dogecointestnet: Network = getNetwork('DOGE', 'testnet');
export const dogecoinregtest: Network = getNetwork('DOGE', 'regtest');

export const wojakcoin: Network = getNetwork('WOJAK', 'mainnet');
export const wojakcointestnet: Network = getNetwork('WOJAK', 'testnet');
export const wojakcoinregtest: Network = getNetwork('WOJAK', 'regtest');

export const NETWORKS: Record<string, Network> = {
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
