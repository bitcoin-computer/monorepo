import * as bip39 from 'bip39';
import * as ecc from '@bitcoin-computer/secp256k1';
import { BIP32Factory } from 'bip32';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'elliptic'.
import * as pkg from 'elliptic';
import { payments } from '../src/index.js';
import { getNetwork } from '../src/networks.js';

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
