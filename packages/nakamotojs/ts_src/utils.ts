import * as bip39 from 'bip39';
import * as ecc from '@bitcoin-computer/secp256k1';
import { BIP32Factory } from 'bip32';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'elliptic'.
import * as pkg from 'elliptic';
import { payments } from './index.js';
import { getNetwork } from './networks.js';

const bip32 = BIP32Factory(ecc);

// todo: see if this can be moved
export function getRandomAddress(
  network = getNetwork('LTC', 'regtest'),
): string {
  const seed = bip39.mnemonicToSeedSync(bip39.generateMnemonic(), '');
  const rootKey = bip32.fromSeed(seed, network);
  const { publicKey: pubkey } = rootKey.derivePath("m/0'/0/0");

  const { address } = payments.p2pkh({ network, pubkey });
  if (address) return address;
  throw new Error('Cannot generate address');
}

export interface _Transaction {
  txId: string;
  txHex: string;
  vsize: number;
  version: number;
  locktime: number;
  ins: _Input[];
  outs: _Output[];
}

export interface _Input {
  txId: string;
  vout: number;
  script: string;
  sequence: string;
}

export interface _Output {
  value: number;
  script: string;
  address?: string;
}

export const rpcJSON2CB = (tx: any): _Transaction => {
  return {
    txId: tx.txid,
    txHex: tx.hex,
    vsize: tx.vsize,
    version: tx.version,
    locktime: tx.locktime,
    ins: tx.vin.map((x: any) => {
      if (x.coinbase) {
        return {
          coinbase: x.coinbase,
          sequence: x.sequence,
        };
      }
      return {
        txId: x.txid,
        vout: x.vout,
        script: x.scriptSig.hex,
        sequence: x.sequence,
      };
    }),
    outs: tx.vout.map((x: any) => {
      let address: string | undefined;
      if (x.scriptPubKey.addresses) {
        [address] = x.scriptPubKey.addresses;
      } else if (x.scriptPubKey.address) {
        address = x.scriptPubKey.address;
      } else {
        address = undefined;
      }
      return {
        address,
        script: x.scriptPubKey.hex,
        value: Math.round(x.value * 1e8), // satoshis
      };
    }),
  };
};
