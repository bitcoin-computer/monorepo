/* eslint-disable no-unused-expressions, @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoin-computer/secp256k1';
import { describe, it } from 'mocha';
import { PsbtInput, TapLeafScript, TapLeaf } from 'bip174/src/lib/interfaces';
import {
  bip371,
  crypto,
  initEccLib,
  Psbt,
  payments,
  script as bscript,
  Signer,
} from '@bitcoin-computer/nakamotojs';
import { witnessStackToScriptWitness } from '../../src/psbt/psbtutils.js';
import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { Taptree } from '../../src/types';
import { getRandomAddress } from '../test_utils.js';
import { RegtestClient } from './regtest_client.js';
import { CHAIN, NETWORK } from './config/index.js';
import { getNetwork } from '../../src/networks.js';
import { Buffer } from 'buffer';

const { toXOnly, tapTreeToList, tapTreeFromList } = bip371;

initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);
const restClient = new RegtestClient();
const regtest = getNetwork(CHAIN, NETWORK);
const randomAddress = getRandomAddress();

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey]),
  );
}

// This logic will be extracted to ecpair
function tweakSigner(signer: Signer, opts: any = {}): Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  if (!privateKey) {
    throw new Error('Private key is required for tweaking signer!');
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash),
  );
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!');
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

function buildLeafIndexFinalizer(
  tapLeafScript: TapLeafScript,
  leafIndex: number,
): (
  inputIndex: number,
  _input: PsbtInput,
  _tapLeafHashToFinalize?: Buffer,
) => {
  finalScriptWitness: Buffer | undefined;
} {
  return (
    inputIndex: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: PsbtInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _tapLeafHashToFinalize?: Buffer,
  ): {
    finalScriptWitness: Buffer | undefined;
  } => {
    try {
      const scriptSolution = [
        Buffer.from([leafIndex]),
        Buffer.from([leafIndex]),
      ];
      const witness = scriptSolution
        .concat(tapLeafScript.script)
        .concat(tapLeafScript.controlBlock);
      return { finalScriptWitness: witnessStackToScriptWitness(witness) };
    } catch (err) {
      throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
    }
  };
}

describe('nakamotojs (transaction with taproot)', () => {
  if (CHAIN === 'BTC' || CHAIN === 'LTC') {
    it('can verify the BIP86 HD wallet vectors for taproot single sig (& sending example)', async () => {
      // Values taken from BIP86 document
      const mnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const xprv =
        'xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu';
      const path = `m/86'/0'/0'/0/0`; // Path to first child of receiving wallet on first account
      const internalPubkey = Buffer.from(
        'cc8a4bc64d897bddc5fbc2f670f7a8ba0b386779106cf1223c6fc5d7cd6fc115',
        'hex',
      );
      const expectedAddress =
        'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr';

      // Verify the above (Below is no different than other HD wallets)
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const rootKey = bip32.fromSeed(seed);
      assert.strictEqual(rootKey.toBase58(), xprv);
      const childNode = rootKey.derivePath(path);
      // Since internalKey is an xOnly pubkey, we drop the DER header byte
      const childNodeXOnlyPubkey = childNode.publicKey.slice(1, 33);
      assert.deepEqual(childNodeXOnlyPubkey, internalPubkey);

      // This is new for taproot
      // Note: we are using mainnet here to get the correct address
      // The output is the same no matter what the network is.
      const { address, output } = payments.p2tr({
        internalPubkey,
      });
      if (!output) throw new Error('output not defined');
      assert.strictEqual(address, expectedAddress);
      // Used for signing, since the output and address are using a tweaked key
      // We must tweak the signer in the same way.
      const tweakedChildNode = childNode.tweak(
        crypto.taggedHash('TapTweak', childNodeXOnlyPubkey),
      );

      // amount from faucet
      const amount = 42e4;
      // amount to send
      const sendAmount = amount - 1e4;
      // Send some sats to the address via faucet. Get the hash and index. (txid/vout)
      const { txId: hash, vout: index } = await restClient.faucetScript(
        output,
        amount,
      );
      // Sent 420000 sats to taproot address

      const psbt = new Psbt({ network: regtest })
        .addInput({
          hash,
          index,
          witnessUtxo: { value: amount, script: output },
          tapInternalKey: childNodeXOnlyPubkey,
        })
        .addOutput({
          value: sendAmount,
          address: randomAddress,
        })
        .signInput(0, tweakedChildNode)
        .finalizeAllInputs();

      const tx = psbt.extractTransaction();
      await restClient.broadcast(tx.toHex());
      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: sendAmount,
      });
    });

    it('can create (and broadcast via 3PBP) a taproot key-path spend Transaction', async () => {
      const internalKey = bip32.fromSeed(randomBytes(64), regtest);
      const p2pkhKey = bip32.fromSeed(randomBytes(64), regtest);

      const { output } = payments.p2tr({
        internalPubkey: toXOnly(internalKey.publicKey),
        network: regtest,
      });

      const { output: p2pkhOutput } = payments.p2pkh({
        pubkey: p2pkhKey.publicKey,
        network: regtest,
      });

      // amount from faucet
      const amount = 42e4;
      // amount to send
      const sendAmount = amount - 1e4;
      // get faucet
      const unspent = await restClient.faucetScript(output!, amount);

      // non segwit utxo
      const p2pkhUnspent = await restClient.faucetScript(p2pkhOutput!, amount);
      const utx = await restClient.getTx(p2pkhUnspent.txId);
      const nonWitnessUtxo = Buffer.from(utx.txHex, 'hex');

      const psbt = new Psbt({ network: regtest });
      psbt.addInput({
        hash: unspent.txId,
        index: 0,
        witnessUtxo: { value: amount, script: output! },
        tapInternalKey: toXOnly(internalKey.publicKey),
      });
      psbt.addInput({ index: 0, hash: p2pkhUnspent.txId, nonWitnessUtxo });

      const sendInternalKey = bip32.fromSeed(randomBytes(64), regtest);
      const sendPubKey = toXOnly(sendInternalKey.publicKey);
      const { address: sendAddress } = payments.p2tr({
        internalPubkey: sendPubKey,
        network: regtest,
      });

      psbt.addOutput({
        value: sendAmount,
        address: sendAddress!,
        tapInternalKey: sendPubKey,
      });

      const tweakedSigner = tweakSigner(internalKey!, { network: regtest });
      await psbt.signInputAsync(0, tweakedSigner);
      await psbt.signInputAsync(1, p2pkhKey);

      psbt.finalizeAllInputs();
      const tx = psbt.extractTransaction();
      const rawTx = tx.toBuffer();

      const hex = rawTx.toString('hex');

      await restClient.broadcast(hex);
      await restClient.verify({
        txId: tx.getId(),
        address: sendAddress!,
        vout: 0,
        satoshis: sendAmount,
      });
    });

    it('can create (and broadcast via 3PBP) a taproot key-path spend Transaction (with unused scriptTree)', async () => {
      const internalKey = bip32.fromSeed(randomBytes(64), regtest);
      const leafKey = bip32.fromSeed(randomBytes(64), regtest);

      const leafScriptAsm = `${toXOnly(leafKey.publicKey).toString('hex')} OP_CHECKSIG`;
      const leafScript = bscript.fromASM(leafScriptAsm);

      const scriptTree = {
        output: leafScript,
      };

      const { output, address, hash } = payments.p2tr({
        internalPubkey: toXOnly(internalKey.publicKey),
        scriptTree,
        network: regtest,
      });

      // amount from faucet
      const amount = 42e4;
      // amount to send
      const sendAmount = amount - 1e4;
      // get faucet
      const unspent = await restClient.faucetScript(output!, amount);

      const psbt = new Psbt({ network: regtest });
      psbt.addInput({
        hash: unspent.txId,
        index: 0,
        witnessUtxo: { value: amount, script: output! },
        tapInternalKey: toXOnly(internalKey.publicKey),
        tapMerkleRoot: hash,
      });
      psbt.addOutput({ value: sendAmount, address: address! });

      const tweakedSigner = tweakSigner(internalKey!, {
        tweakHash: hash,
        network: regtest,
      });
      psbt.signInput(0, tweakedSigner);

      psbt.finalizeAllInputs();
      const tx = psbt.extractTransaction();
      const rawTx = tx.toBuffer();

      const hex = rawTx.toString('hex');

      await restClient.broadcast(hex);
      await restClient.verify({
        txId: tx.getId(),
        address: address!,
        vout: 0,
        satoshis: sendAmount,
      });
    });

    it('can create (and broadcast via 3PBP) a taproot script-path spend Transaction - OP_CHECKSIG', async () => {
      const internalKey = bip32.fromSeed(randomBytes(64), regtest);
      const leafKey = bip32.fromSeed(randomBytes(64), regtest);

      const leafScriptAsm = `${toXOnly(leafKey.publicKey).toString('hex')} OP_CHECKSIG`;
      const leafScript = bscript.fromASM(leafScriptAsm);

      const scriptTree: Taptree = [
        [
          {
            output: bscript.fromASM(
              '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            ),
          },
          [
            {
              output: bscript.fromASM(
                '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac1 OP_CHECKSIG',
              ),
            },
            {
              output: bscript.fromASM(
                '2258b1c3160be0864a541854eec9164a572f094f7562628281a8073bb89173a7 OP_CHECKSIG',
              ),
            },
          ],
        ],
        [
          {
            output: bscript.fromASM(
              '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac2 OP_CHECKSIG',
            ),
          },
          [
            {
              output: bscript.fromASM(
                '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac3 OP_CHECKSIG',
              ),
            },
            [
              {
                output: bscript.fromASM(
                  '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac4 OP_CHECKSIG',
                ),
              },
              {
                output: leafScript,
              },
            ],
          ],
        ],
      ];
      const redeem = {
        output: leafScript,
        redeemVersion: 192,
      };

      const { output, witness } = payments.p2tr({
        internalPubkey: toXOnly(internalKey.publicKey),
        scriptTree,
        redeem,
        network: regtest,
      });

      // amount from faucet
      const amount = 42e4;
      // amount to send
      const sendAmount = amount - 1e4;
      // get faucet
      const unspent = await restClient.faucetScript(output!, amount);

      const psbt = new Psbt({ network: regtest });
      psbt.addInput({
        hash: unspent.txId,
        index: 0,
        witnessUtxo: { value: amount, script: output! },
      });
      psbt.updateInput(0, {
        tapLeafScript: [
          {
            leafVersion: redeem.redeemVersion,
            script: redeem.output,
            controlBlock: witness![witness!.length - 1],
          },
        ],
      });

      const sendInternalKey = bip32.fromSeed(randomBytes(64), regtest);
      const sendPubKey = toXOnly(sendInternalKey.publicKey);
      const { address: sendAddress } = payments.p2tr({
        internalPubkey: sendPubKey,
        scriptTree,
        network: regtest,
      });

      psbt.addOutput({
        value: sendAmount,
        address: sendAddress!,
        tapInternalKey: sendPubKey,
        tapTree: { leaves: tapTreeToList(scriptTree) },
      });

      psbt.signInput(0, leafKey);
      psbt.finalizeInput(0);
      const tx = psbt.extractTransaction();
      const rawTx = tx.toBuffer();
      const hex = rawTx.toString('hex');

      await restClient.broadcast(hex);
      await restClient.verify({
        txId: tx.getId(),
        address: sendAddress!,
        vout: 0,
        satoshis: sendAmount,
      });
    });

    it('can create (and broadcast via 3PBP) a taproot script-path spend Transaction - OP_CHECKSEQUENCEVERIFY', async () => {
      const internalKey = bip32.fromSeed(randomBytes(64), regtest);
      const leafKey = bip32.fromSeed(randomBytes(64), regtest);
      const leafPubkey = toXOnly(leafKey.publicKey).toString('hex');

      const leafScriptAsm = `OP_10 OP_CHECKSEQUENCEVERIFY OP_DROP ${leafPubkey} OP_CHECKSIG`;
      const leafScript = bscript.fromASM(leafScriptAsm);

      const scriptTree: Taptree = [
        {
          output: bscript.fromASM(
            '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
          ),
        },
        [
          {
            output: bscript.fromASM(
              '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            ),
          },
          {
            output: leafScript,
          },
        ],
      ];
      const redeem = {
        output: leafScript,
        redeemVersion: 192,
      };

      const { output, witness } = payments.p2tr({
        internalPubkey: toXOnly(internalKey.publicKey),
        scriptTree,
        redeem,
        network: regtest,
      });

      // amount from faucet
      const amount = 42e4;
      // amount to send
      const sendAmount = amount - 1e4;
      // get faucet
      const unspent = await restClient.faucetScript(output!, amount);

      const psbt = new Psbt({ network: regtest });
      psbt.addInput({
        hash: unspent.txId,
        index: 0,
        sequence: 10,
        witnessUtxo: { value: amount, script: output! },
      });
      psbt.updateInput(0, {
        tapLeafScript: [
          {
            leafVersion: redeem.redeemVersion,
            script: redeem.output,
            controlBlock: witness![witness!.length - 1],
          },
        ],
      });

      const sendInternalKey = bip32.fromSeed(randomBytes(64), regtest);
      const sendPubKey = toXOnly(sendInternalKey.publicKey);
      const { address: sendAddress } = payments.p2tr({
        internalPubkey: sendPubKey,
        scriptTree,
        network: regtest,
      });

      psbt.addOutput({ value: sendAmount, address: sendAddress! });
      // just to test that updateOutput works as expected
      psbt.updateOutput(0, {
        tapInternalKey: sendPubKey,
        tapTree: { leaves: tapTreeToList(scriptTree) },
      });

      await psbt.signInputAsync(0, leafKey);

      psbt.finalizeInput(0);
      const tx = psbt.extractTransaction();
      const rawTx = tx.toBuffer();
      const hex = rawTx.toString('hex');

      try {
        // broadcast before the confirmation period has expired
        await restClient.broadcast(hex);
        throw new Error('Broadcast should fail.');
      } catch (err) {
        if ((err as any).message !== 'non-BIP68-final')
          throw new Error(
            `Expected OP_CHECKSEQUENCEVERIFY validation to fail. But it faild with: ${err}`,
          );
      }
      await restClient.mine(10);
      await restClient.broadcast(hex);
      await restClient.verify({
        txId: tx.getId(),
        address: sendAddress!,
        vout: 0,
        satoshis: sendAmount,
      });
    });

    it('can create (and broadcast via 3PBP) a taproot script-path spend Transaction - OP_CHECKSIGADD (3-of-3)', async () => {
      const internalKey = bip32.fromSeed(randomBytes(64), regtest);

      const leafKeys: any[] = [];
      const leafPubkeys: string[] = [];
      for (let i = 0; i < 3; i += 1) {
        const leafKey = bip32.fromSeed(randomBytes(64), regtest);
        leafKeys.push(leafKey);
        leafPubkeys.push(toXOnly(leafKey.publicKey).toString('hex'));
      }

      const leafScriptAsm = `${leafPubkeys[2]} OP_CHECKSIG ${leafPubkeys[1]} OP_CHECKSIGADD ${leafPubkeys[0]} OP_CHECKSIGADD OP_3 OP_NUMEQUAL`;

      const leafScript = bscript.fromASM(leafScriptAsm);

      const scriptTree: Taptree = [
        {
          output: bscript.fromASM(
            '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
          ),
        },
        [
          {
            output: bscript.fromASM(
              '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            ),
          },
          {
            output: leafScript,
          },
        ],
      ];
      const redeem = {
        output: leafScript,
        redeemVersion: 192,
      };

      const { output, address, witness } = payments.p2tr({
        internalPubkey: toXOnly(internalKey.publicKey),
        scriptTree,
        redeem,
        network: regtest,
      });

      // amount from faucet
      const amount = 42e4;
      // amount to send
      const sendAmount = amount - 1e4;
      // get faucet
      const unspent = await restClient.faucetScript(output!, amount);

      const psbt = new Psbt({ network: regtest });
      psbt.addInput({
        hash: unspent.txId,
        index: 0,
        witnessUtxo: { value: amount, script: output! },
      });
      psbt.updateInput(0, {
        tapLeafScript: [
          {
            leafVersion: redeem.redeemVersion,
            script: redeem.output,
            controlBlock: witness![witness!.length - 1],
          },
        ],
      });

      psbt.addOutput({ value: sendAmount, address: address! });

      // random order for signers
      psbt.signInput(0, leafKeys[1]);
      psbt.signInput(0, leafKeys[2]);
      psbt.signInput(0, leafKeys[0]);

      psbt.finalizeInput(0);
      const tx = psbt.extractTransaction();
      const rawTx = tx.toBuffer();
      const hex = rawTx.toString('hex');

      await restClient.broadcast(hex);
      await restClient.verify({
        txId: tx.getId(),
        address: address!,
        vout: 0,
        satoshis: sendAmount,
      });
    });

    it('can create (and broadcast via 3PBP) a taproot script-path spend Transaction - custom finalizer', async () => {
      const leafCount = 8;
      const leaves = Array.from({ length: leafCount }).map(
        (_, index) =>
          ({
            depth: 3,
            leafVersion: 192,
            script: bscript.fromASM(`OP_ADD OP_${index * 2} OP_EQUAL`),
          }) as TapLeaf,
      );
      const scriptTree = tapTreeFromList(leaves);

      for (let leafIndex = 1; leafIndex < leafCount; leafIndex += 1) {
        const redeem = {
          output: bscript.fromASM(`OP_ADD OP_${leafIndex * 2} OP_EQUAL`),
          redeemVersion: 192,
        };

        const internalKey = bip32.fromSeed(randomBytes(64), regtest);
        const { output, witness } = payments.p2tr({
          internalPubkey: toXOnly(internalKey.publicKey),
          scriptTree,
          redeem,
          network: regtest,
        });

        // amount from faucet
        const amount = 42e4;
        // amount to send
        const sendAmount = amount - 1e4;
        // get faucet
        // eslint-disable-next-line no-await-in-loop
        const unspent = await restClient.faucetScript(output!, amount);

        const psbt = new Psbt({ network: regtest });
        psbt.addInput({
          hash: unspent.txId,
          index: 0,
          witnessUtxo: { value: amount, script: output! },
        });

        const tapLeafScript: TapLeafScript = {
          leafVersion: redeem.redeemVersion,
          script: redeem.output,
          controlBlock: witness![witness!.length - 1],
        };
        psbt.updateInput(0, { tapLeafScript: [tapLeafScript] });

        const sendInternalKey = bip32.fromSeed(randomBytes(64), regtest);
        const sendPubKey = toXOnly(sendInternalKey.publicKey);
        const { address: sendAddress } = payments.p2tr({
          internalPubkey: sendPubKey,
          scriptTree,
          network: regtest,
        });
        expect(sendAddress).to.not.be.undefined;
        psbt.addOutput({
          value: sendAmount,
          address: sendAddress!,
        });

        const leafIndexFinalizerFn = buildLeafIndexFinalizer(
          tapLeafScript,
          leafIndex,
        );
        psbt.finalizeInput(0, leafIndexFinalizerFn);
        const tx = psbt.extractTransaction();
        const rawTx = tx.toBuffer();
        const hex = rawTx.toString('hex');
        // eslint-disable-next-line no-await-in-loop
        await restClient.broadcast(hex);
        // eslint-disable-next-line no-await-in-loop
        await restClient.verify({
          txId: tx.getId(),
          address: sendAddress!,
          vout: 0,
          satoshis: sendAmount,
        });
      }
    });
  }
});
