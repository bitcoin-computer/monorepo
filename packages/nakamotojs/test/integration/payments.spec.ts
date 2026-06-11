/* eslint-disable no-unused-expressions, @typescript-eslint/no-non-null-assertion */
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoin-computer/secp256k1';
import { describe, it } from 'mocha';
import { Psbt, payments } from '../../src/index.js';
import p2msFixtures from '../fixtures/p2ms.js';
import p2pkFixtures from '../fixtures/p2pk.js';
import p2pkhFixtures from '../fixtures/p2pkh.js';
import p2wpkhFixtures from '../fixtures/p2wpkh.js';
import { getRandomAddress } from '../test_utils.js';
import { RegtestClient } from './regtest_client.js';
import { CHAIN, NETWORK } from './config/index.js';
import { getNetwork } from '../../src/networks.js';
import { Buffer } from 'buffer';

const fixturesMap: any = {
  p2ms: p2msFixtures,
  p2pk: p2pkFixtures,
  p2pkh: p2pkhFixtures,
  p2wpkh: p2wpkhFixtures,
};

const ECPair = ECPairFactory(ecc);
const restClient = new RegtestClient();
const network = getNetwork(CHAIN, NETWORK);
const keyPairs = [
  ECPair.makeRandom({ network }),
  ECPair.makeRandom({ network }),
];

const amountFactor = CHAIN === 'DOGE' || CHAIN === 'PEPE' ? 10 : 1;

async function buildAndSign(
  depends: any,
  prevOutput: any,
  redeemScript: any,
  witnessScript: any,
): Promise<null | string> {
  const unspent = await restClient.faucetScript(prevOutput, 5e4 * amountFactor);
  const utx = await restClient.getTx(unspent.txId);

  const psbt = new Psbt({ network })
    .addInput({
      hash: unspent.txId,
      index: unspent.vout,
      nonWitnessUtxo: Buffer.from(utx.txHex, 'hex'),
      ...(redeemScript ? { redeemScript } : {}),
      ...(witnessScript ? { witnessScript } : {}),
    })
    .addOutput({
      address: getRandomAddress(),
      value: 2e4,
    });

  if (depends.signatures) {
    keyPairs.forEach(keyPair => {
      psbt.signInput(0, keyPair);
    });
  } else if (depends.signature) {
    psbt.signInput(0, keyPairs[0]);
  }

  return restClient.broadcast(
    psbt.finalizeAllInputs().extractTransaction().toHex(),
  );
}

['p2ms', 'p2pk', 'p2pkh', 'p2wpkh'].forEach(k => {
  const fixtures = fixturesMap[k];
  // const fixtures = require(`../fixtures/${k}`)
  const { depends } = fixtures.dynamic;
  const fn: any = (payments as any)[k];

  const base: any = {};
  if (depends.pubkey) base.pubkey = keyPairs[0].publicKey;
  if (depends.pubkeys) base.pubkeys = keyPairs.map(x => x.publicKey);
  if (depends.m) base.m = base.pubkeys.length;

  const { output } = fn(base);
  if (!output) throw new TypeError('Missing output');

  describe(`nakamotojs (payments - ${k})`, () => {
    it('can broadcast as an output, and be spent as an input', async () => {
      Object.assign(depends, { prevOutScriptType: k });
      await buildAndSign(depends, output, undefined, undefined);
    });

    it(`can (as P2SH(${k})) broadcast as an output, and be spent as an input`, async () => {
      const p2sh = payments.p2sh({
        redeem: { output },
        network,
      });
      Object.assign(depends, { prevOutScriptType: `p2sh-${k}` });
      await buildAndSign(depends, p2sh.output, p2sh.redeem!.output, undefined);
    });

    // NOTE: P2WPKH cannot be wrapped in P2WSH, consensus fail
    if (k === 'p2wpkh') return;

    it(`can (as P2WSH(${k})) broadcast as an output, and be spent as an input`, async () => {
      const p2wsh = payments.p2wsh({
        redeem: { output },
        network,
      });
      Object.assign(depends, { prevOutScriptType: `p2wsh-${k}` });
      await buildAndSign(
        depends,
        p2wsh.output,
        undefined,
        p2wsh.redeem!.output,
      );
    });

    it(`can (as P2SH(P2WSH(${k}))) broadcast as an output, and be spent as an input`, async () => {
      const p2wsh = payments.p2wsh({
        redeem: { output },
        network,
      });
      const p2sh = payments.p2sh({
        redeem: { output: p2wsh.output },
        network,
      });

      Object.assign(depends, { prevOutScriptType: `p2sh-p2wsh-${k}` });
      await buildAndSign(
        depends,
        p2sh.output,
        p2sh.redeem!.output,
        p2wsh.redeem!.output,
      );
    });
  });
});
