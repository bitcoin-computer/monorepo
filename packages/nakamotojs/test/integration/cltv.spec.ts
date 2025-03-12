/* eslint-disable no-unused-expressions, @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoin-computer/secp256k1';
import { before, describe, it } from 'mocha';
import {
  address as bAddress,
  script as bscript,
  payments,
  opcodes,
} from '../../src/index.js';
// @ts-ignore
import * as bip65 from 'bip65';
import { getRandomAddress } from '../test_utils.js';
import { RegtestClient } from './regtest_client.js';
import { Transaction } from '../../src/index.js';
import { CHAIN, NETWORK } from './config/index.js';
import { getNetwork } from '../../src/networks.js';

const ECPair = ECPairFactory(ecc);
const restClient = new RegtestClient();
const regtest = getNetwork(CHAIN, NETWORK);
const randomAddress = getRandomAddress();

function toOutputScript(address: string): Buffer {
  return bAddress.toOutputScript(address, regtest);
}

function idToHash(txid: string): Buffer {
  return Buffer.from(txid, 'hex').reverse();
}

const alice = ECPair.fromWIF(
  'cScfkGjbzzoeewVWmU2hYPUHeVGJRDdFt7WhmrVVGkxpmPP8BHWe',
  regtest,
);
const bob = ECPair.fromWIF(
  'cMkopUXKWsEzAjfa1zApksGRwjVpJRB3831qM9W4gKZsLwjHXA9x',
  regtest,
);
const amountFactor = CHAIN === 'DOGE' || CHAIN === 'PEPE' ? 10 : 1;

describe('nakamotojs (transactions w/ CLTV)', () => {
  // force update MTP
  before(async () => {
    await restClient.mine(11);
  });

  const hashType = Transaction.SIGHASH_ALL;

  interface KeyPair {
    publicKey: Buffer;
  }
  function cltvCheckSigOutput(
    aQ: KeyPair,
    bQ: KeyPair,
    lockTime: number,
  ): Buffer {
    return bscript.fromASM(
      `
      OP_IF
          ${bscript.number.encode(lockTime).toString('hex')}
          OP_CHECKLOCKTIMEVERIFY
          OP_DROP
      OP_ELSE
          ${bQ.publicKey.toString('hex')}
          OP_CHECKSIGVERIFY
      OP_ENDIF
      ${aQ.publicKey.toString('hex')}
      OP_CHECKSIG
    `
        .trim()
        .replace(/\s+/g, ' '),
    );
  }

  function utcNow(): number {
    return Math.floor(Date.now() / 1000);
  }

  // expiry past, {Alice's signature} OP_TRUE
  it(
    'can create (and broadcast via 3PBP) a Transaction where Alice can redeem ' +
      'the output after the expiry (in the past)',
    async () => {
      // 3 hours ago
      const lockTime = bip65.encode({ utc: utcNow() - 3600 * 3 });
      const redeemScript = cltvCheckSigOutput(alice, bob, lockTime);
      const { address } = payments.p2sh({
        redeem: { output: redeemScript, network: regtest },
        network: regtest,
      });

      // fund the P2SH(CLTV) address
      const unspent = await restClient.faucet(address!, 1e5 * amountFactor);
      const tx = new Transaction();
      tx.locktime = lockTime;
      // Note: nSequence MUST be <= 0xfffffffe otherwise OP_CHECKLOCKTIMEVERIFY will fail.
      tx.addInput(idToHash(unspent.txId), unspent.vout, 0xfffffffe);
      tx.addOutput(toOutputScript(randomAddress), BigInt(7e4 * amountFactor));

      // {Alice's signature} OP_TRUE
      const signatureHash = tx.hashForSignature(0, redeemScript, hashType);
      const redeemScriptSig = payments.p2sh({
        redeem: {
          input: bscript.compile([
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            opcodes.OP_TRUE,
          ]),
          output: redeemScript,
        },
      }).input;
      tx.setInputScript(0, redeemScriptSig!);

      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    },
  );

  // expiry will pass, {Alice's signature} OP_TRUE
  it(
    'can create (and broadcast via 3PBP) a Transaction where Alice can redeem ' +
      'the output after the expiry (in the future)',
    async () => {
      const height = await restClient.height();
      // 5 blocks from now
      const lockTime = bip65.encode({ blocks: height + 5 });
      const redeemScript = cltvCheckSigOutput(alice, bob, lockTime);
      const { address } = payments.p2sh({
        redeem: { output: redeemScript, network: regtest },
        network: regtest,
      });

      // fund the P2SH(CLTV) address
      const unspent = await restClient.faucet(address!, 1e5 * amountFactor);
      const tx = new Transaction();
      tx.locktime = lockTime;
      // Note: nSequence MUST be <= 0xfffffffe otherwise OP_CHECKLOCKTIMEVERIFY will fail.
      tx.addInput(idToHash(unspent.txId), unspent.vout, 0xfffffffe);
      tx.addOutput(toOutputScript(randomAddress), BigInt(7e4 * amountFactor));

      // {Alice's signature} OP_TRUE
      const signatureHash = tx.hashForSignature(0, redeemScript, hashType);
      const redeemScriptSig = payments.p2sh({
        redeem: {
          input: bscript.compile([
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            opcodes.OP_TRUE,
          ]),
          output: redeemScript,
        },
      }).input;
      tx.setInputScript(0, redeemScriptSig!);

      // TODO: test that it failures _prior_ to expiry, unfortunately, race conditions when run concurrently
      // ...
      // into the future!
      await restClient.mine(5);
      await restClient.broadcast(tx.toHex());
      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    },
  );

  // expiry ignored, {Bob's signature} {Alice's signature} OP_FALSE
  it(
    'can create (and broadcast via 3PBP) a Transaction where Alice and Bob can ' +
      'redeem the output at any time',
    async () => {
      // two hours ago
      const lockTime = bip65.encode({ utc: utcNow() - 3600 * 2 });
      const redeemScript = cltvCheckSigOutput(alice, bob, lockTime);
      const { address } = payments.p2sh({
        redeem: { output: redeemScript, network: regtest },
        network: regtest,
      });

      // fund the P2SH(CLTV) address
      const unspent = await restClient.faucet(address!, 2e5 * amountFactor);
      const tx = new Transaction();
      tx.locktime = lockTime;
      // Note: nSequence MUST be <= 0xfffffffe otherwise OP_CHECKLOCKTIMEVERIFY will fail.
      tx.addInput(idToHash(unspent.txId), unspent.vout, 0xfffffffe);
      tx.addOutput(toOutputScript(randomAddress), BigInt(8e4 * amountFactor));

      // {Alice's signature} {Bob's signature} OP_FALSE
      const signatureHash = tx.hashForSignature(0, redeemScript, hashType);
      const redeemScriptSig = payments.p2sh({
        redeem: {
          input: bscript.compile([
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            bscript.signature.encode(bob.sign(signatureHash), hashType),
            opcodes.OP_FALSE,
          ]),
          output: redeemScript,
        },
      }).input;
      tx.setInputScript(0, redeemScriptSig!);

      await restClient.broadcast(tx.toHex());
      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 8e4 * amountFactor,
      });
    },
  );

  // expiry in the future, {Alice's signature} OP_TRUE
  it(
    'can create (but fail to broadcast via 3PBP) a Transaction where Alice ' +
      'attempts to redeem before the expiry',
    async () => {
      // two hours from now
      const lockTime = bip65.encode({ utc: utcNow() + 3600 * 2 });
      const redeemScript = cltvCheckSigOutput(alice, bob, lockTime);
      const { address } = payments.p2sh({
        redeem: { output: redeemScript, network: regtest },
        network: regtest,
      });

      // fund the P2SH(CLTV) address
      const unspent = await restClient.faucet(address!, 2e5 * amountFactor);
      const tx = new Transaction();
      tx.locktime = lockTime;
      // Note: nSequence MUST be <= 0xfffffffe otherwise OP_CHECKLOCKTIMEVERIFY will fail.
      tx.addInput(idToHash(unspent.txId), unspent.vout, 0xfffffffe);
      tx.addOutput(toOutputScript(randomAddress), BigInt(1e5 * amountFactor));

      // {Alice's signature} OP_TRUE
      const signatureHash = tx.hashForSignature(0, redeemScript, hashType);
      const redeemScriptSig = payments.p2sh({
        redeem: {
          input: bscript.compile([
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            bscript.signature.encode(bob.sign(signatureHash), hashType),
            opcodes.OP_TRUE,
          ]),
          output: redeemScript,
        },
      }).input;
      tx.setInputScript(0, redeemScriptSig!);

      try {
        await restClient.broadcast(tx.toHex());
        throw new Error('This should fail');
      } catch (err: any) {
        assert.equal(err.message.slice(-9), 'non-final');
      }
    },
  );
});
