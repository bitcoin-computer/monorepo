/* eslint-disable no-unused-expressions, @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai';
import { ECPairFactory, ECPairInterface } from 'ecpair';
import * as ecc from '@bitcoin-computer/secp256k1';
import { before, describe, it } from 'mocha';
import {
  address as bAddress,
  crypto,
  payments,
  script as bscript,
  opcodes,
} from '@bitcoin-computer/nakamotojs';

import { getRandomAddress } from '../test_utils.js';
import { RegtestClient } from './regtest_client.js';
import { Transaction } from '../../src/index.js';
import { CHAIN, NETWORK } from './config/index.js';
import { getNetwork } from '../../src/networks.js';

export const fail = () => {
  expect(true).to.eq(false);
};

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

describe('nakamotojs (transactions)', () => {
  // force update MTP
  before(async () => {
    await restClient.mine(11);
  });

  const hashType = Transaction.SIGHASH_ALL;

  describe('Should redeem with a secret hash', () => {
    it('Can create (and broadcast) a Transaction where Alice can redeem the output knowing secret1 ', async () => {
      const secret = 'secret';
      const hash1 = crypto.sha256(crypto.sha256(Buffer.from(secret)));
      const redeemScript = bscript.fromASM(
        `OP_HASH256 ${hash1.toString('hex')} OP_EQUAL`,
      );
      const { address } = payments.p2sh({
        redeem: { output: redeemScript, network: regtest },
        network: regtest,
      });

      // fund the P2SH(script) address
      const unspent = await restClient.faucet(address!, 1e5 * amountFactor);
      const tx = new Transaction();
      tx.addInput(idToHash(unspent.txId), unspent.vout);
      tx.addOutput(toOutputScript(randomAddress), 7e4 * amountFactor);

      const redeemScriptSigInvalid = payments.p2sh({
        redeem: {
          input: bscript.compile([Buffer.from('sec2')]),
          output: redeemScript,
        },
      }).input;
      tx.setInputScript(0, redeemScriptSigInvalid!);

      await restClient.broadcast(tx.toHex()).then(fail, err => {
        expect(err.message).not.be.undefined;
      });

      const redeemScriptSigValid = payments.p2sh({
        redeem: {
          input: bscript.compile([Buffer.from(secret)]),
          output: redeemScript,
        },
      }).input;
      tx.setInputScript(0, redeemScriptSigValid!);

      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    });
  });

  describe('Should redeem with p2sh-p2pkh', () => {
    // redeem with public key and signature
    it('Can create (and broadcast) a Transaction where Alice can redeem with p2pkh ', async () => {
      const hash = crypto.hash160(alice.publicKey).toString('hex');
      const redeemScript = bscript.fromASM(
        `OP_DUP OP_HASH160 ${hash} OP_EQUALVERIFY OP_CHECKSIG`,
      );

      const { address } = payments.p2sh({
        redeem: { output: redeemScript, network: regtest },
        network: regtest,
      });

      // fund the P2SH(script) address
      const unspent = await restClient.faucet(address!, 1e5 * amountFactor);
      const tx = new Transaction();
      tx.addInput(idToHash(unspent.txId), unspent.vout);
      tx.addOutput(toOutputScript(randomAddress), 7e4 * amountFactor);

      const signatureHash = tx.hashForSignature(0, redeemScript, hashType);
      const redeemScriptSigValid = payments.p2sh({
        redeem: {
          input: bscript.compile([
            // alice signature
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            alice.publicKey,
          ]),
          output: redeemScript,
        },
      }).input;
      tx.setInputScript(0, redeemScriptSigValid!);

      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    });
  });

  describe('Should work for the chess smart contract (without draws)', () => {
    function createRedeemScriptHashPK(
      AlicePkHash: Buffer,
      BobPkHash: Buffer,
      AliceSecretHash: Buffer,
      BobSecretHash: Buffer,
    ): Buffer {
      return bscript.fromASM(
        ` 
          OP_IF
            OP_DUP OP_HASH160 ${AlicePkHash.toString('hex')} OP_EQUALVERIFY OP_CHECKSIG
            OP_VERIFY
            OP_HASH256
            ${AliceSecretHash.toString('hex')}
            OP_EQUAL
          OP_ELSE
            OP_DUP OP_HASH160 ${BobPkHash.toString('hex')} OP_EQUALVERIFY OP_CHECKSIG
            OP_VERIFY
            OP_HASH256
            ${BobSecretHash.toString('hex')}
            OP_EQUAL
          OP_ENDIF
        `
          .trim()
          .replace(/\s+/g, ' '),
      );
    }

    function createRedeemInput(
      secret: string,
      signatureHash: Buffer,
      redeemScript: Buffer,
      signer: ECPairInterface,
      isAlice: boolean,
    ): Buffer | undefined {
      return payments.p2sh({
        redeem: {
          input: bscript.compile([
            Buffer.from(secret),
            bscript.signature.encode(signer.sign(signatureHash), hashType),
            signer.publicKey,
            isAlice ? opcodes.OP_TRUE : opcodes.OP_FALSE,
          ]),
          output: redeemScript,
        },
      }).input;
    }

    let redeemScript: any;
    let tx: any;
    let signatureHash: any;
    const aliceSecret = 'aliceSecret';
    const bobSecret = 'bobSecret';

    beforeEach(async () => {
      redeemScript = undefined;
      tx = undefined;
      signatureHash = undefined;

      const aliceHash = crypto.sha256(crypto.sha256(Buffer.from(aliceSecret)));
      const bobHash = crypto.sha256(crypto.sha256(Buffer.from(bobSecret)));
      redeemScript = createRedeemScriptHashPK(
        crypto.hash160(alice.publicKey),
        crypto.hash160(bob.publicKey),
        aliceHash,
        bobHash,
      );
      const { address } = payments.p2sh({
        redeem: { output: redeemScript, network: regtest },
        network: regtest,
      });

      // fund the P2SH(script) address
      const unspent = await restClient.faucet(address!, 1e5 * amountFactor);
      tx = new Transaction();
      tx.addInput(idToHash(unspent.txId), unspent.vout);
      tx.addOutput(toOutputScript(randomAddress), 7e4 * amountFactor);

      signatureHash = tx.hashForSignature(0, redeemScript, hashType);
    });

    it('Can create (and broadcast) a Transaction where Alice can redeem with her pk and secret', async () => {
      // Alice valid
      const redeemScriptSigValidAlice = createRedeemInput(
        aliceSecret,
        signatureHash,
        redeemScript,
        alice,
        true,
      );
      tx.setInputScript(0, redeemScriptSigValidAlice!);
      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    });

    it('Should throw an error if Alice secret is invalid', async () => {
      // check invalid secret
      const redeemScriptSigInvalidAliceSecret = createRedeemInput(
        'invalidSecret',
        signatureHash,
        redeemScript,
        alice,
        true,
      );
      tx.setInputScript(0, redeemScriptSigInvalidAliceSecret!);
      await restClient.broadcast(tx.toHex()).then(fail, err => {
        expect(err.message).not.be.undefined;
      });
    });

    it('Should throw an error if Alice public key is invalid', async () => {
      // check invalid signature or pk
      const redeemScriptSigInvalidAliceSig = createRedeemInput(
        aliceSecret,
        signatureHash,
        redeemScript,
        bob,
        true,
      );
      tx.setInputScript(0, redeemScriptSigInvalidAliceSig!);
      await restClient.broadcast(tx.toHex()).then(fail, err => {
        expect(err.message).not.be.undefined;
      });
    });

    it('Can create (and broadcast) a Transaction where Bob can redeem with his pk and secret', async () => {
      // Bob valid
      const redeemScriptSigValidBob = createRedeemInput(
        bobSecret,
        signatureHash,
        redeemScript,
        bob,
        false,
      );
      tx.setInputScript(0, redeemScriptSigValidBob!);
      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    });

    it('Should throw an error if Bob secret is invalid ', async () => {
      // check invalid secret
      const redeemScriptSigInvalidBobSecret = createRedeemInput(
        'invalidSecret',
        signatureHash,
        redeemScript,
        bob,
        false,
      );
      tx.setInputScript(0, redeemScriptSigInvalidBobSecret!);
      await restClient.broadcast(tx.toHex()).then(fail, err => {
        expect(err.message).not.be.undefined;
      });
    });

    it('Should throw an error if Bob public key is invalid', async () => {
      // check invalid signature or pk
      const redeemScriptSigInvalidBobSig = createRedeemInput(
        bobSecret,
        signatureHash,
        redeemScript,
        alice,
        false,
      );
      tx.setInputScript(0, redeemScriptSigInvalidBobSig!);
      await restClient.broadcast(tx.toHex()).then(fail, err => {
        expect(err.message).not.be.undefined;
      });
    });
  });
});
