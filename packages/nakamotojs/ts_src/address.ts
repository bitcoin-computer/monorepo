import { Network } from './networks.js';
import * as networks from './networks.js';
import { p2pkh, p2sh, p2wpkh, p2wsh, p2tr } from './payments/index.js';
import * as bscript from './script.js';
import { typeforce, tuple, Hash160bit, UInt8 } from './types.js';
import { toXOnly } from './psbt/bip371.js';
import { bech32, bech32m } from 'bech32';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bs58check from 'bs58check';
import { Buffer } from 'buffer';
export interface Base58CheckResult {
  hash: Buffer;
  version: number;
}

export interface Bech32Result {
  version: number;
  prefix: string;
  data: Buffer;
}

const FUTURE_SEGWIT_MAX_SIZE: number = 40;
const FUTURE_SEGWIT_MIN_SIZE: number = 2;
const FUTURE_SEGWIT_MAX_VERSION: number = 16;
const FUTURE_SEGWIT_MIN_VERSION: number = 2;
const FUTURE_SEGWIT_VERSION_DIFF: number = 0x50;
const FUTURE_SEGWIT_VERSION_WARNING: string =
  'WARNING: Sending to a future segwit version address can lead to loss of funds. ' +
  'End users MUST be warned carefully in the GUI and asked if they wish to proceed ' +
  'with caution. Wallets should verify the segwit version from the output of fromBech32, ' +
  'then decide when it is safe to use which version of segwit.';

function _toFutureSegwitAddress(output: Buffer, network: Network): string {
  const data = output.slice(2);

  if (
    data.length < FUTURE_SEGWIT_MIN_SIZE ||
    data.length > FUTURE_SEGWIT_MAX_SIZE
  )
    throw new TypeError('Invalid program length for segwit address');

  const version = output[0] - FUTURE_SEGWIT_VERSION_DIFF;

  if (
    version < FUTURE_SEGWIT_MIN_VERSION ||
    version > FUTURE_SEGWIT_MAX_VERSION
  )
    throw new TypeError('Invalid version for segwit address');

  if (output[1] !== data.length)
    throw new TypeError('Invalid script for segwit address');

  console.warn(FUTURE_SEGWIT_VERSION_WARNING);

  return toBech32(data, version, network.bech32);
}

export function fromBase58Check(address: string): Base58CheckResult {
  const payload = Buffer.from(bs58check.decode(address));

  // TODO: 4.0.0, move to "toOutputScript"
  if (payload.length < 21) throw new TypeError(address + ' is too short');
  if (payload.length > 21) throw new TypeError(address + ' is too long');

  const version = payload.readUint8(0);
  const hash = payload.slice(1);

  return { version, hash };
}

export function fromBech32(address: string): Bech32Result {
  let result;
  let version;
  try {
    result = bech32.decode(address);
  } catch (e) {}

  if (result) {
    version = result.words[0];
    if (version !== 0) throw new TypeError(address + ' uses wrong encoding');
  } else {
    result = bech32m.decode(address);
    version = result.words[0];
    if (version === 0) throw new TypeError(address + ' uses wrong encoding');
  }

  const data = bech32.fromWords(result.words.slice(1));

  return {
    version,
    prefix: result.prefix,
    data: Buffer.from(data),
  };
}

export function toBase58Check(hash: Buffer, version: number): string {
  typeforce(tuple(Hash160bit, UInt8), arguments);

  const payload = Buffer.allocUnsafe(21);
  payload.writeUInt8(version, 0);
  hash.copy(payload, 1);

  return bs58check.encode(payload);
}

export function toBech32(
  data: Buffer,
  version: number,
  prefix: string,
): string {
  const words = bech32.toWords(data);
  words.unshift(version);

  return version === 0
    ? bech32.encode(prefix, words)
    : bech32m.encode(prefix, words);
}

export function fromOutputScript(output: Buffer, network?: Network): string {
  // TODO: Network
  network = network || networks.bitcoin;

  try {
    return p2pkh({ output, network }).address as string;
  } catch (e) {}
  try {
    return p2sh({ output, network }).address as string;
  } catch (e) {}
  try {
    return p2wpkh({ output, network }).address as string;
  } catch (e) {}
  try {
    return p2wsh({ output, network }).address as string;
  } catch (e) {}
  try {
    return p2tr({ output, network }).address as string;
  } catch (e) {}
  try {
    return _toFutureSegwitAddress(output, network);
  } catch (e) {}

  throw new Error(bscript.toASM(output) + ' has no matching Address');
}

export function toOutputScript(address: string, network?: Network): Buffer {
  network = network || networks.bitcoin;

  let decodeBase58: Base58CheckResult | undefined;
  let decodeBech32: Bech32Result | undefined;
  try {
    decodeBase58 = fromBase58Check(address);
  } catch (e) {}

  if (decodeBase58) {
    if (decodeBase58.version === network.pubKeyHash)
      return p2pkh({ hash: decodeBase58.hash }).output as Buffer;
    if (decodeBase58.version === network.scriptHash)
      return p2sh({ hash: decodeBase58.hash }).output as Buffer;
  } else {
    try {
      decodeBech32 = fromBech32(address);
    } catch (e) {}

    if (decodeBech32) {
      if (decodeBech32.prefix !== network.bech32)
        throw new Error(address + ' has an invalid prefix');
      if (decodeBech32.version === 0) {
        if (decodeBech32.data.length === 20)
          return p2wpkh({ hash: decodeBech32.data }).output as Buffer;
        if (decodeBech32.data.length === 32)
          return p2wsh({ hash: decodeBech32.data }).output as Buffer;
      } else if (decodeBech32.version === 1) {
        if (decodeBech32.data.length === 32)
          return p2tr({ pubkey: decodeBech32.data }).output as Buffer;
      } else if (
        decodeBech32.version >= FUTURE_SEGWIT_MIN_VERSION &&
        decodeBech32.version <= FUTURE_SEGWIT_MAX_VERSION &&
        decodeBech32.data.length >= FUTURE_SEGWIT_MIN_SIZE &&
        decodeBech32.data.length <= FUTURE_SEGWIT_MAX_SIZE
      ) {
        console.warn(FUTURE_SEGWIT_VERSION_WARNING);

        return bscript.compile([
          decodeBech32.version + FUTURE_SEGWIT_VERSION_DIFF,
          decodeBech32.data,
        ]);
      }
    }
  }

  throw new Error(address + ' has no matching Script');
}

export function fromPublicKey(
  publicKey: Buffer,
  type: string,
  network?: Network,
): string {
  network = network || networks.bitcoin;

  if (type === 'p2pkh')
    return p2pkh({ pubkey: publicKey, network }).address as string;
  if (type === 'p2wpkh')
    return p2wpkh({ pubkey: publicKey, network }).address as string;
  if (type === 'p2tr')
    return p2tr({
      internalPubkey: toXOnly(publicKey),
      network,
    }).address as string;

  throw new Error('Unknown or unsupported type');
}
