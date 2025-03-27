/* eslint-disable no-unused-expressions, @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import { PsbtInput } from 'bip174/src/lib/interfaces';
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoin-computer/secp256k1';
import { before, describe, it } from 'mocha';
import {
  address as bAddress,
  script as bscript,
  opcodes,
  payments,
  Payment,
  Psbt,
} from '@bitcoin-computer/nakamotojs';
// @ts-ignore
import * as bip68 from 'bip68';
import * as varuint from 'varuint-bitcoin';
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

// This function is used to finalize a CSV transaction using PSBT.
// See first test above.
function csvGetFinalScripts(
  inputIndex: number,
  input: PsbtInput,
  script: Buffer,
  isSegwit: boolean,
  isP2SH: boolean,
  isP2WSH: boolean,
): {
  finalScriptSig: Buffer | undefined;
  finalScriptWitness: Buffer | undefined;
} {
  // Step 1: Check to make sure the meaningful script matches what you expect.
  const decompiled = bscript.decompile(script);
  // Checking if first OP is OP_IF... should do better check in production!
  // You may even want to check the public keys in the script against a
  // whitelist depending on the circumstances!!!
  // You also want to check the contents of the input to see if you have enough
  // info to actually construct the scriptSig and Witnesses.
  if (!decompiled || decompiled[0] !== opcodes.OP_IF) {
    throw new Error(`Can not finalize input #${inputIndex}`);
  }

  // Step 2: Create final scripts
  let payment: Payment = {
    network: regtest,
    output: script,
    // This logic should be more strict and make sure the pubkeys in the
    // meaningful script are the ones signing in the PSBT etc.
    input: bscript.compile([input.partialSig![0].signature, opcodes.OP_TRUE]),
  };
  if (isP2WSH && isSegwit)
    payment = payments.p2wsh({
      network: regtest,
      redeem: payment,
    });
  if (isP2SH)
    payment = payments.p2sh({
      network: regtest,
      redeem: payment,
    });

  function witnessStackToScriptWitness(witness: Buffer[]): Buffer {
    let buffer = Buffer.allocUnsafe(0);

    function writeSlice(slice: Buffer): void {
      buffer = Buffer.concat([buffer, Buffer.from(slice)]);
    }

    function writeVarInt(i: number): void {
      const currentLen = buffer.length;
      const varintLen = varuint.encodingLength(i);

      buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
      varuint.encode(i, buffer, currentLen);
    }

    function writeVarSlice(slice: Buffer): void {
      writeVarInt(slice.length);
      writeSlice(slice);
    }

    function writeVector(vector: Buffer[]): void {
      writeVarInt(vector.length);
      vector.forEach(writeVarSlice);
    }

    writeVector(witness);

    return buffer;
  }

  return {
    finalScriptSig: payment.input,
    finalScriptWitness:
      payment.witness && payment.witness.length > 0
        ? witnessStackToScriptWitness(payment.witness)
        : undefined,
  };
}

const alice = ECPair.fromWIF(
  'cScfkGjbzzoeewVWmU2hYPUHeVGJRDdFt7WhmrVVGkxpmPP8BHWe',
  regtest,
);
const bob = ECPair.fromWIF(
  'cMkopUXKWsEzAjfa1zApksGRwjVpJRB3831qM9W4gKZsLwjHXA9x',
  regtest,
);
const charles = ECPair.fromWIF(
  'cMkopUXKWsEzAjfa1zApksGRwjVpJRB3831qM9W4gKZsMSb4Ubnf',
  regtest,
);
const dave = ECPair.fromWIF(
  'cMkopUXKWsEzAjfa1zApksGRwjVpJRB3831qM9W4gKZsMwS4pqnx',
  regtest,
);

const amountFactor = CHAIN === 'DOGE' || CHAIN === 'PEPE' ? 10 : 1;

describe('nakamotojs (transactions w/ CSV)', () => {
  // force update MTP
  before(async () => {
    await restClient.mine(11);
  });

  const hashType = Transaction.SIGHASH_ALL;

  interface KeyPair {
    publicKey: Buffer;
  }
  // IF MTP (from when confirmed) > seconds, _alice can redeem
  function csvCheckSigOutput(
    _alice: KeyPair,
    _bob: KeyPair,
    sequence: number,
  ): Buffer {
    return bscript.fromASM(
      `
      OP_IF
          ${bscript.number.encode(sequence).toString('hex')}
          OP_CHECKSEQUENCEVERIFY
          OP_DROP
      OP_ELSE
          ${_bob.publicKey.toString('hex')}
          OP_CHECKSIGVERIFY
      OP_ENDIF
      ${_alice.publicKey.toString('hex')}
      OP_CHECKSIG
    `
        .trim()
        .replace(/\s+/g, ' '),
    );
  }

  // 2 of 3 multisig of _bob, _charles, _dave,
  // but after sequence1 time, _alice can allow the multisig to become 1 of 3.
  // but after sequence2 time, _alice can sign for the output all by themself.

  // Ref: https://github.com/bitcoinbook/bitcoinbook/blob/f8b883dcd4e3d1b9adf40fed59b7e898fbd9241f/ch07.asciidoc#complex-script-example

  // Note: nakamotojs will not offer specific support for problems with
  //       advanced script usages such as below. Use at your own risk.
  function complexCsvOutput(
    _alice: KeyPair,
    _bob: KeyPair,
    _charles: KeyPair,
    _dave: KeyPair,
    sequence1: number,
    sequence2: number,
  ): Buffer {
    return bscript.fromASM(
      `
      OP_IF
          OP_IF
              OP_2
          OP_ELSE
              ${bscript.number.encode(sequence1).toString('hex')}
              OP_CHECKSEQUENCEVERIFY
              OP_DROP
              ${_alice.publicKey.toString('hex')}
              OP_CHECKSIGVERIFY
              OP_1
          OP_ENDIF
          ${_bob.publicKey.toString('hex')}
          ${_charles.publicKey.toString('hex')}
          ${_dave.publicKey.toString('hex')}
          OP_3
          OP_CHECKMULTISIG
      OP_ELSE
          ${bscript.number.encode(sequence2).toString('hex')}
          OP_CHECKSEQUENCEVERIFY
          OP_DROP
          ${_alice.publicKey.toString('hex')}
          OP_CHECKSIG
      OP_ENDIF
    `
        .trim()
        .replace(/\s+/g, ' '),
    );
  }

  // expiry will pass, {Alice's signature} OP_TRUE
  it(
    'can create (and broadcast via 3PBP) a Transaction where Alice can redeem ' +
      'the output after the expiry (in the future) (simple CHECKSEQUENCEVERIFY)',
    async () => {
      // 5 blocks from now
      const sequence = bip68.encode({ blocks: 5 });
      const p2sh = payments.p2sh({
        redeem: {
          output: csvCheckSigOutput(alice, bob, sequence),
        },
        network: regtest,
      });

      // fund the P2SH(CSV) address
      const unspent = await restClient.faucet(
        p2sh.address!,
        1e5 * amountFactor,
      );
      const utx = await restClient.getTx(unspent.txId);
      // for non segwit inputs, you must pass the full transaction buffer
      const nonWitnessUtxo = Buffer.from(utx.txHex, 'hex');

      // This is an example of using the finalizeInput second parameter to
      // define how you finalize the inputs, allowing for any type of script.
      const tx = new Psbt({ network: regtest })
        .setVersion(2)
        .addInput({
          hash: unspent.txId,
          index: unspent.vout,
          sequence,
          redeemScript: p2sh.redeem!.output!,
          nonWitnessUtxo,
        })
        .addOutput({
          address: randomAddress,
          value: 7e4 * amountFactor,
        })
        .signInput(0, alice)
        .finalizeInput(0, csvGetFinalScripts) // See csvGetFinalScripts below
        .extractTransaction();

      // TODO: test that it failures _prior_ to expiry, unfortunately, race conditions when run concurrently
      // ...
      // into the future!
      await restClient.mine(10);

      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    },
  );

  // expiry in the future, {Alice's signature} OP_TRUE
  it(
    'can create (but fail to broadcast via 3PBP) a Transaction where Alice ' +
      'attempts to redeem before the expiry (simple CHECKSEQUENCEVERIFY)',
    async () => {
      // two hours after confirmation
      const sequence = bip68.encode({ seconds: 7168 });
      const p2sh = payments.p2sh({
        network: regtest,
        redeem: {
          output: csvCheckSigOutput(alice, bob, sequence),
        },
      });

      // fund the P2SH(CSV) address
      const unspent = await restClient.faucet(
        p2sh.address!,
        2e5 * amountFactor,
      );

      const tx = new Transaction();
      tx.version = 2;
      tx.addInput(idToHash(unspent.txId), unspent.vout, sequence);
      tx.addOutput(toOutputScript(randomAddress), BigInt(1e5 * amountFactor));

      // {Alice's signature} OP_TRUE
      const signatureHash = tx.hashForSignature(
        0,
        p2sh.redeem!.output!,
        hashType,
      );
      const redeemScriptSig = payments.p2sh({
        network: regtest,
        redeem: {
          network: regtest,
          output: p2sh.redeem!.output,
          input: bscript.compile([
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            bscript.signature.encode(bob.sign(signatureHash), hashType),
            opcodes.OP_TRUE,
          ]),
        },
      }).input;
      tx.setInputScript(0, redeemScriptSig!);

      try {
        await restClient.broadcast(tx.toHex());
        throw new Error('This should fail');
      } catch (err: any) {
        assert.equal(err.message.slice(-15), 'non-BIP68-final');
      }
    },
  );

  // Check first combination of complex CSV, 2 of 3
  it(
    'can create (and broadcast via 3PBP) a Transaction where Bob and Charles ' +
      'can send (complex CHECKSEQUENCEVERIFY)',
    async () => {
      // 2 blocks from now
      const sequence1 = bip68.encode({ blocks: 2 });
      // 5 blocks from now
      const sequence2 = bip68.encode({ blocks: 5 });
      const p2sh = payments.p2sh({
        redeem: {
          output: complexCsvOutput(
            alice,
            bob,
            charles,
            dave,
            sequence1,
            sequence2,
          ),
        },
        network: regtest,
      });

      // fund the P2SH(CCSV) address
      const unspent = await restClient.faucet(
        p2sh.address!,
        1e5 * amountFactor,
      );

      const tx = new Transaction();
      tx.version = 2;
      tx.addInput(idToHash(unspent.txId), unspent.vout);
      tx.addOutput(toOutputScript(randomAddress), BigInt(7e4 * amountFactor));

      // OP_0 {Bob sig} {Charles sig} OP_TRUE OP_TRUE
      const signatureHash = tx.hashForSignature(
        0,
        p2sh.redeem!.output!,
        hashType,
      );
      const redeemScriptSig = payments.p2sh({
        network: regtest,
        redeem: {
          network: regtest,
          output: p2sh.redeem!.output,
          input: bscript.compile([
            opcodes.OP_0,
            bscript.signature.encode(bob.sign(signatureHash), hashType),
            bscript.signature.encode(charles.sign(signatureHash), hashType),
            opcodes.OP_TRUE,
            opcodes.OP_TRUE,
          ]),
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

  // Check first combination of complex CSV, mediator + 1 of 3 after 2 blocks
  it(
    'can create (and broadcast via 3PBP) a Transaction where Alice (mediator) ' +
      'and Bob can send after 2 blocks (complex CHECKSEQUENCEVERIFY)',
    async () => {
      // 2 blocks from now
      const sequence1 = bip68.encode({ blocks: 2 });
      // 5 blocks from now
      const sequence2 = bip68.encode({ blocks: 5 });
      const p2sh = payments.p2sh({
        redeem: {
          output: complexCsvOutput(
            alice,
            bob,
            charles,
            dave,
            sequence1,
            sequence2,
          ),
        },
        network: regtest,
      });

      // fund the P2SH(CCSV) address
      const unspent = await restClient.faucet(
        p2sh.address!,
        1e5 * amountFactor,
      );

      const tx = new Transaction();
      tx.version = 2;
      tx.addInput(idToHash(unspent.txId), unspent.vout, sequence1); // Set sequence1 for input
      tx.addOutput(toOutputScript(randomAddress), BigInt(7e4 * amountFactor));

      // OP_0 {Bob sig} {Alice mediator sig} OP_FALSE OP_TRUE
      const signatureHash = tx.hashForSignature(
        0,
        p2sh.redeem!.output!,
        hashType,
      );
      const redeemScriptSig = payments.p2sh({
        network: regtest,
        redeem: {
          network: regtest,
          output: p2sh.redeem!.output,
          input: bscript.compile([
            opcodes.OP_0,
            bscript.signature.encode(bob.sign(signatureHash), hashType),
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            opcodes.OP_0,
            opcodes.OP_TRUE,
          ]),
        },
      }).input;
      tx.setInputScript(0, redeemScriptSig!);

      // Wait 2 blocks
      await restClient.mine(2);

      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 7e4 * amountFactor,
      });
    },
  );

  // Check first combination of complex CSV, mediator after 5 blocks
  it(
    'can create (and broadcast via 3PBP) a Transaction where Alice (mediator) ' +
      'can send after 5 blocks (complex CHECKSEQUENCEVERIFY)',
    async () => {
      // 2 blocks from now
      const sequence1 = bip68.encode({ blocks: 2 });
      // 5 blocks from now
      const sequence2 = bip68.encode({ blocks: 5 });
      const p2sh = payments.p2sh({
        redeem: {
          output: complexCsvOutput(
            alice,
            bob,
            charles,
            dave,
            sequence1,
            sequence2,
          ),
        },
        network: regtest,
      });

      // fund the P2SH(CCSV) address
      const unspent = await restClient.faucet(
        p2sh.address!,
        1e5 * amountFactor,
      );

      const tx = new Transaction();
      tx.version = 2;
      tx.addInput(idToHash(unspent.txId), unspent.vout, sequence2); // Set sequence2 for input
      tx.addOutput(toOutputScript(randomAddress), BigInt(7e4 * amountFactor));

      // {Alice mediator sig} OP_FALSE
      const signatureHash = tx.hashForSignature(
        0,
        p2sh.redeem!.output!,
        hashType,
      );
      const redeemScriptSig = payments.p2sh({
        network: regtest,
        redeem: {
          network: regtest,
          output: p2sh.redeem!.output,
          input: bscript.compile([
            bscript.signature.encode(alice.sign(signatureHash), hashType),
            opcodes.OP_0,
          ]),
        },
      }).input;
      tx.setInputScript(0, redeemScriptSig!);

      // Wait 5 blocks
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
});
