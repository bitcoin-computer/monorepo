/* eslint-disable no-unused-expressions, @typescript-eslint/no-non-null-assertion, no-bitwise */
import * as assert from 'assert';
import { BIP32Factory } from 'bip32';
import * as ecc from '@bitcoin-computer/secp256k1';
import { ECPairFactory } from 'ecpair';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { getRandomAddress } from '../test_utils.js';
import { RegtestClient } from './regtest_client.js';
import { CHAIN, NETWORK } from './config/index.js';
import { getNetwork } from '../../src/networks.js';
import { Buffer } from 'buffer';
import {
  initEccLib,
  payments,
  Psbt,
  bufferUtils,
  Transaction,
} from '../../src/index.js';

const ECPair = ECPairFactory(ecc);
initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const randomAddress = getRandomAddress();
const restClient = new RegtestClient();
// let regtest = networks.regtest;
const regtest = getNetwork(CHAIN, NETWORK);

const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

const amountFactor = CHAIN === 'DOGE' || CHAIN === 'PEPE' ? 100 : 1;
function createPayment(_type: string, myKeys?: any[], network?: any): any {
  // eslint-disable-next-line no-param-reassign
  network = network || regtest;
  const splitType = _type.split('-').reverse();
  const isMultisig = splitType[0].slice(0, 4) === 'p2ms';
  const keys = myKeys || [];
  let m: number | undefined;
  if (isMultisig) {
    const match = splitType[0].match(/^p2ms\((\d+) of (\d+)\)$/);
    m = parseInt(match![1], 10);
    let n = parseInt(match![2], 10);
    if (keys.length > 0 && keys.length !== n) {
      throw new Error('Need n keys for multisig');
    }
    while (!myKeys && n > 1) {
      keys.push(ECPair.makeRandom({ network }));
      n -= 1;
    }
  }
  if (!myKeys) keys.push(ECPair.makeRandom({ network }));

  let payment: any;
  splitType.forEach(type => {
    if (type.slice(0, 4) === 'p2ms') {
      payment = payments.p2ms({
        m,
        pubkeys: keys.map(key => key.publicKey).sort((a, b) => a.compare(b)),
        network,
      });
    } else if (['p2sh', 'p2wsh'].indexOf(type) > -1) {
      payment = (payments as any)[type]({
        redeem: payment,
        network,
      });
    } else {
      payment = (payments as any)[type]({
        pubkey: keys[0].publicKey,
        network,
      });
    }
  });

  return {
    payment,
    keys,
  };
}

function getWitnessUtxo(out: any): any {
  // eslint-disable-next-line no-param-reassign
  delete out.address;
  // eslint-disable-next-line no-param-reassign
  out.script = Buffer.from(out.script, 'hex');
  return out;
}

async function getInputData(
  amount: number,
  payment: any,
  isSegwit: boolean,
  redeemType: string,
): Promise<any> {
  const unspent = await restClient.faucetScript(payment.output, amount);
  const utx = await restClient.getTx(unspent.txId);
  // for non segwit inputs, you must pass the full transaction buffer
  const nonWitnessUtxo = Buffer.from(utx.txHex, 'hex');
  // for segwit inputs, you only need the output script and value as an object.
  const witnessUtxo = getWitnessUtxo(utx.outs[unspent.vout]);
  const mixin = isSegwit ? { witnessUtxo } : { nonWitnessUtxo };
  const mixin2: any = {};
  // eslint-disable-next-line default-case
  switch (redeemType) {
    case 'p2sh':
      mixin2.redeemScript = payment.redeem.output;
      break;
    case 'p2wsh':
      mixin2.witnessScript = payment.redeem.output;
      break;
    case 'p2sh-p2wsh':
      mixin2.witnessScript = payment.redeem.redeem.output;
      mixin2.redeemScript = payment.redeem.output;
      break;
  }
  return {
    hash: unspent.txId,
    index: unspent.vout,
    ...mixin,
    ...mixin2,
  };
}

// See bottom of file for some helper functions used to make the payment objects needed.
// let chain = 'BTC';
// before(async () => {
//   chain = CHAIN;
//   regtest = chain === 'LTC' ? networks.litecoinregtest : regtest;
// });

describe('nakamotojs (transactions with psbt)', () => {
  it('can create a 1-to-1 Transaction', () => {
    const alice = ECPair.fromWIF(
      'L2uPYXe17xSTqbCjZvL2DsyXPCbXspvcu5mHLDYUgzdUbZGSKrSr',
    );
    const psbt = new Psbt({ network: regtest });
    psbt.setVersion(2); // These are defaults. This line is not needed.
    psbt.setLocktime(0); // These are defaults. This line is not needed.
    psbt.addInput({
      // if hash is string, txid, if hash is Buffer, is reversed compared to txid
      hash: '7d067b4a697a09d2c3cff7d4d9506c9955e93bff41bf82d439da7d030382bc3e',
      index: 0,
      sequence: 0xffffffff, // These are defaults. This line is not needed.

      // non-segwit inputs now require passing the whole previous tx as Buffer
      nonWitnessUtxo: Buffer.from(
        '0200000001f9f34e95b9d5c8abcd20fc5bd4a825d1517be62f0f775e5f36da944d9' +
          '452e550000000006b483045022100c86e9a111afc90f64b4904bd609e9eaed80d48' +
          'ca17c162b1aca0a788ac3526f002207bb79b60d4fc6526329bf18a77135dc566020' +
          '9e761da46e1c2f1152ec013215801210211755115eabf846720f5cb18f248666fec' +
          '631e5e1e66009ce3710ceea5b1ad13ffffffff01' +
          // value in satoshis (Int64LE) = 0x015f90 = 90000
          '905f010000000000' +
          // scriptPubkey length
          '19' +
          // scriptPubkey
          '76a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac' +
          // locktime
          '00000000',
        'hex',
      ),

      // // If this input was segwit, instead of nonWitnessUtxo, you would add
      // // a witnessUtxo as follows. The scriptPubkey and the value only are needed.
      // witnessUtxo: {
      //   script: Buffer.from(
      //     '76a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac',
      //     'hex',
      //   ),
      //   value: 90000,
      // },

      // Not featured here:
      //   redeemScript. A Buffer of the redeemScript for P2SH
      //   witnessScript. A Buffer of the witnessScript for P2WSH
    });
    let sendAddress = '';
    switch (CHAIN) {
      case 'LTC': {
        sendAddress =
          'rltc1pgrlf9g8peg9yrwptm0mywp3af5zyaf327txf4fepgvc2lcg4y7eq99z4g8';
        break;
      }
      case 'DOGE': {
        sendAddress = 'mwKVAf8QNNj1AR32PtXdzEw6BY3eC1sr85';
        break;
      }
      default: {
        sendAddress = 'mwKVAf8QNNj1AR32PtXdzEw6BY3eC1sr85';
      }
    }

    psbt.addOutput({
      address: sendAddress,
      value: 80000,
    });
    psbt.signInput(0, alice);
    psbt.validateSignaturesOfInput(0, validator);
    psbt.finalizeAllInputs();
    if (CHAIN === 'LTC')
      assert.strictEqual(
        psbt.extractTransaction(true).toHex(),
        '02000000013ebc8203037dda39d482bf41ff3be955996c50d9d4f7cfc3d2097a694a7' +
          'b067d000000006a47304402201b893c59d39f21ce6df52dd78dd698744640bdb5ce88' +
          'ce334fef0e71499db62d02203d563824f631676dd01be61e5d27a2999a0fa5adf3d60' +
          '97d5da6db096692c8c101210365db9da3f8a260078a7e8f8b708a1161468fb2323ffd' +
          'a5ec16b261ec1056f455ffffffff01803801000000000022512040fe92a0e1ca0a41b' +
          '82bdbf647063d4d044ea62af2cc9aa7214330afe11527b200000000',
      );
    else if (CHAIN === 'DOGE')
      assert.strictEqual(
        psbt.extractTransaction(true).toHex(),
        '02000000013ebc8203037dda39d482bf41ff3be955996c50d9d4f7cfc3d2097a694a7' +
          'b067d000000006a473044022055ea78ebdc7aee0ed107ac08861ae70297fc7602753f' +
          '954ae2ad6e56c227ef0002203cd36bf5d232b5d623a14e2a4d8944d0364b98af4b33d' +
          '575fa4afcc188304c8f01210365db9da3f8a260078a7e8f8b708a1161468fb2323ffd' +
          'a5ec16b261ec1056f455ffffffff0180380100000000001976a914ad56cac3ee93942' +
          'cb0c3d24bc35a34af8a9920b888ac00000000',
      );
    else
      assert.strictEqual(
        psbt.extractTransaction(true).toHex(),
        '02000000013ebc8203037dda39d482bf41ff3be955996c50d9d4f7cfc3d2097a694a7' +
          'b067d000000006a473044022055ea78ebdc7aee0ed107ac08861ae70297fc7602753f9' +
          '54ae2ad6e56c227ef0002203cd36bf5d232b5d623a14e2a4d8944d0364b98af4b33d57' +
          '5fa4afcc188304c8f01210365db9da3f8a260078a7e8f8b708a1161468fb2323ffda5e' +
          'c16b261ec1056f455ffffffff0180380100000000001976a914ad56cac3ee93942cb0c' +
          '3d24bc35a34af8a9920b888ac00000000',
      );
  });

  it('can create (and broadcast via 3PBP) a typical Transaction', async () => {
    // these are { payment: Payment; keys: ECPair[] }
    const alice1 = createPayment('p2pkh', undefined, regtest);
    const alice2 = createPayment('p2pkh', undefined, regtest);

    // give Alice 2 unspent outputs
    const inputData1 = await getInputData(
      5e4 * amountFactor,
      alice1.payment,
      false,
      'noredeem',
    );
    const inputData2 = await getInputData(
      7e4 * amountFactor,
      alice2.payment,
      false,
      'noredeem',
    );
    {
      const {
        hash, // string of txid or Buffer of tx hash. (txid and hash are reverse order)
        index, // the output index of the txo you are spending
        nonWitnessUtxo, // the full previous transaction as a Buffer
      } = inputData1;
      assert.deepStrictEqual({ hash, index, nonWitnessUtxo }, inputData1);
    }

    // network is only needed if you pass an address to addOutput
    // using script (Buffer of scriptPubkey) instead will avoid needed network.
    const psbt = new Psbt({ network: regtest })
      .addInput(inputData1) // alice1 unspent
      .addInput(inputData2) // alice2 unspent
      .addOutput({
        address: 'mwCwTceJvYV27KXBc3NJZys6CjsgsoeHmf',
        value: 8e4,
      }) // the actual "spend"
      .addOutput({
        address: alice2.payment.address, // OR script, which is a Buffer.
        value: 1e4 * amountFactor,
      }); // Alice's change
    // (in)(5e4 + 7e4) - (out)(8e4 + 1e4) = (fee)3e4 = 30000, this is the miner fee

    // Let's show a new feature with PSBT.
    // We can have multiple signers sign in parrallel and combine them.
    // (this is not necessary, but a nice feature)

    // encode to send out to the signers
    const psbtBaseText = psbt.toBase64();

    // each signer imports
    const signer1 = Psbt.fromBase64(psbtBaseText);
    const signer2 = Psbt.fromBase64(psbtBaseText);

    // Alice signs each input with the respective private keys
    // signInput and signInputAsync are better
    // (They take the input index explicitly as the first arg)
    signer1.signAllInputs(alice1.keys[0]);
    signer2.signAllInputs(alice2.keys[0]);

    // If your signer object's sign method returns a promise, use the following
    // await signer2.signAllInputsAsync(alice2.keys[0])

    // encode to send back to combiner (signer 1 and 2 are not near each other)
    const s1text = signer1.toBase64();
    const s2text = signer2.toBase64();

    const final1 = Psbt.fromBase64(s1text);
    const final2 = Psbt.fromBase64(s2text);

    // final1.combine(final2) would give the exact same result
    psbt.combine(final1, final2);

    // Finalizer wants to check all signatures are valid before finalizing.
    // If the finalizer wants to check for specific pubkeys, the second arg
    // can be passed. See the first multisig example below.
    assert.strictEqual(psbt.validateSignaturesOfInput(0, validator), true);
    assert.strictEqual(psbt.validateSignaturesOfInput(1, validator), true);

    // This step it new. Since we separate the signing operation and
    // the creation of the scriptSig and witness stack, we are able to
    psbt.finalizeAllInputs();

    // build and broadcast our RegTest network
    await restClient.broadcast(psbt.extractTransaction(true).toHex());
  });

  it('buyer and seller can jointly create a partially signed transaction', async () => {
    const MIN = 1e5 * amountFactor;
    const N = 2e5 * amountFactor;

    // seller
    const seller = createPayment('p2pkh', undefined, regtest);

    const nftOutpoint = await getInputData(
      MIN,
      seller.payment,
      false,
      'noredeem',
    );
    const payToSeller = payments.p2pkh({
      pubkey: seller.keys[0].publicKey,
      network: regtest,
    });
    const sellerTx = new Transaction();
    sellerTx.addInput(Buffer.alloc(32), 0); // dummy input (N+MIN sat)
    sellerTx.addInput(
      bufferUtils.reverseBuffer(Buffer.from(nftOutpoint.hash, 'hex')),
      nftOutpoint.index,
    ); // seller unspent holding NFT (MIN Sat)
    sellerTx.addOutput(Buffer.alloc(8), BigInt(MIN)); // dummy output 0
    sellerTx.addOutput(payToSeller.output!, BigInt(N)); // N payment to seller

    // @ts-ignore
    sellerTx.sign(
      1,
      seller.keys[0],
      Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY,
      Transaction.fromHex(nftOutpoint.nonWitnessUtxo).outs[0].script,
    );

    // send to the off-chain protocol
    const txHex = sellerTx.toHex();

    expect(txHex).not.undefined;

    // buyer receive from off-chain protocol
    const buyerTx = Transaction.fromHex(txHex);

    assert.deepStrictEqual(buyerTx, sellerTx);
    const buyerPayment = createPayment('p2pkh', undefined, regtest);

    const buyerPayment0 = await getInputData(
      N + MIN,
      buyerPayment.payment,
      false,
      'noredeem',
    );

    const buyerPaymentToMiners = await getInputData(
      3e4 * amountFactor,
      buyerPayment.payment,
      false,
      'noredeem',
    );

    const buyerOutput0 = payments.p2pkh({
      pubkey: buyerPayment.keys[0].publicKey,
      network: regtest,
    });

    buyerPayment0.hash = bufferUtils.reverseBuffer(
      Buffer.from(buyerPayment0.hash, 'hex'),
    );
    buyerTx.updateInput(0, buyerPayment0); // N + MIN
    // miners fee
    buyerTx.addInput(
      bufferUtils.reverseBuffer(Buffer.from(buyerPaymentToMiners.hash, 'hex')),
      buyerPaymentToMiners.index,
    );
    // @ts-ignore
    buyerTx.updateOutput(0, {
      scriptPubKey: buyerOutput0.output!,
      value: BigInt(MIN),
    }); // Output 0
    buyerTx.addOutput(buyerOutput0.output!, BigInt(MIN)); // Output 2

    // @ts-ignore
    buyerTx.sign(
      0,
      buyerPayment.keys[0],
      Transaction.SIGHASH_ALL,
      Transaction.fromHex(buyerPayment0.nonWitnessUtxo).outs[0].script,
    );

    // @ts-ignore
    buyerTx.sign(
      2,
      buyerPayment.keys[0],
      Transaction.SIGHASH_ALL,
      Transaction.fromHex(buyerPaymentToMiners.nonWitnessUtxo).outs[0].script,
    );
    const finalTx = buyerTx.toHex();
    expect(finalTx).to.not.be.undefined;

    // send to the network
    await restClient.broadcast(finalTx);
  });

  it('can create (and broadcast via 3PBP) a Transaction with an OP_RETURN output', async () => {
    const alice1 = createPayment('p2pkh', undefined, regtest);
    const inputData1 = await getInputData(
      2e5 * amountFactor,
      alice1.payment,
      false,
      'noredeem',
    );

    const data = Buffer.from('nakamotojs', 'utf8');
    const embed = payments.embed({ data: [data] });

    const psbt = new Psbt({ network: regtest })
      .addInput(inputData1)
      .addOutput({
        script: embed.output!,
        value: 1000 * amountFactor,
      })
      .addOutput({
        address: randomAddress,
        value: 1e5 * amountFactor,
      })
      .signInput(0, alice1.keys[0]);

    assert.strictEqual(psbt.validateSignaturesOfInput(0, validator), true);
    psbt.finalizeAllInputs();

    // build and broadcast to the RegTest network
    await restClient.broadcast(psbt.extractTransaction(true).toHex());
  });

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2SH(P2MS(2 of 4)) (multisig) input', async () => {
    const multisig = createPayment('p2sh-p2ms(2 of 4)', undefined, regtest);
    const inputData1 = await getInputData(
      2e4 * amountFactor,
      multisig.payment,
      false,
      'p2sh',
    );
    {
      const {
        hash,
        index,
        nonWitnessUtxo,
        redeemScript, // NEW: P2SH needs to give redeemScript when adding an input.
      } = inputData1;
      assert.deepStrictEqual(
        { hash, index, nonWitnessUtxo, redeemScript },
        inputData1,
      );
    }

    const psbt = new Psbt({ network: regtest })
      .addInput(inputData1)
      .addOutput({
        address: randomAddress,
        value: 1e4 * amountFactor,
      })
      .signInput(0, multisig.keys[0])
      .signInput(0, multisig.keys[2]);

    assert.strictEqual(psbt.validateSignaturesOfInput(0, validator), true);
    assert.strictEqual(
      psbt.validateSignaturesOfInput(0, validator, multisig.keys[0].publicKey),
      true,
    );
    assert.throws(() => {
      psbt.validateSignaturesOfInput(0, validator, multisig.keys[3].publicKey);
    }, /No signatures for this pubkey/);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction(true);

    // build and broadcast to the Bitcoin RegTest network
    await restClient.broadcast(tx.toHex());

    await restClient.verify({
      txId: tx.getId(),
      address: randomAddress,
      vout: 0,
      satoshis: 1e4 * amountFactor,
    });
  });

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2SH(P2WPKH) input', async () => {
    const p2sh = createPayment('p2sh-p2wpkh', undefined, regtest);
    const inputData = await getInputData(
      5e4 * amountFactor,
      p2sh.payment,
      true,
      'p2sh',
    );
    const inputData2 = await getInputData(
      5e4 * amountFactor,
      p2sh.payment,
      true,
      'p2sh',
    );
    {
      const {
        hash,
        index,
        witnessUtxo, // NEW: this is an object of the output being spent { script: Buffer; value: Satoshis; }
        redeemScript,
      } = inputData;
      assert.deepStrictEqual(
        { hash, index, witnessUtxo, redeemScript },
        inputData,
      );
    }
    const keyPair = p2sh.keys[0];
    const outputData = {
      script: p2sh.payment.output, // sending to myself for fun
      value: 2e4 * amountFactor,
    };
    const outputData2 = {
      script: p2sh.payment.output, // sending to myself for fun
      value: 7e4 * amountFactor,
    };

    const tx = new Psbt({ network: regtest })
      .addInputs([inputData, inputData2])
      .addOutputs([outputData, outputData2])
      .signAllInputs(keyPair)
      .finalizeAllInputs()
      .extractTransaction(true);

    // build and broadcast to the Bitcoin RegTest network
    await restClient.broadcast(tx.toHex());

    await restClient.verify({
      txId: tx.getId(),
      address: p2sh.payment.address,
      vout: 0,
      satoshis: 2e4 * amountFactor,
    });
  });

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2SH(P2WPKH) input with nonWitnessUtxo', async () => {
    // For learning purposes, ignore this test.
    // REPEATING ABOVE BUT WITH nonWitnessUtxo by passing false to getInputData
    const p2sh = createPayment('p2sh-p2wpkh', undefined, regtest);
    const inputData = await getInputData(
      5e4 * amountFactor,
      p2sh.payment,
      false,
      'p2sh',
    );
    const inputData2 = await getInputData(
      5e4 * amountFactor,
      p2sh.payment,
      false,
      'p2sh',
    );
    const keyPair = p2sh.keys[0];
    const outputData = {
      script: p2sh.payment.output,
      value: 2e4 * amountFactor,
    };
    const outputData2 = {
      script: p2sh.payment.output,
      value: 7e4 * amountFactor,
    };
    const tx = new Psbt({ network: regtest })
      .addInputs([inputData, inputData2])
      .addOutputs([outputData, outputData2])
      .signAllInputs(keyPair)
      .finalizeAllInputs()
      .extractTransaction(true);
    await restClient.broadcast(tx.toHex());
    await restClient.verify({
      txId: tx.getId(),
      address: p2sh.payment.address,
      vout: 0,
      satoshis: 2e4 * amountFactor,
    });
  });

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2WPKH input', async () => {
    // the only thing that changes is you don't give a redeemscript for input data

    const p2wpkh = createPayment('p2wpkh', undefined, regtest);
    const inputData = await getInputData(
      5e4 * amountFactor,
      p2wpkh.payment,
      true,
      'noredeem',
    );
    {
      const { hash, index, witnessUtxo } = inputData;
      assert.deepStrictEqual({ hash, index, witnessUtxo }, inputData);
    }

    const psbt = new Psbt({ network: regtest })
      .addInput(inputData)
      .addOutput({
        address: randomAddress,
        value: 2e4 * amountFactor,
      })
      .signInput(0, p2wpkh.keys[0]);

    assert.strictEqual(psbt.validateSignaturesOfInput(0, validator), true);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction(true);

    // build and broadcast to the Bitcoin RegTest network
    await restClient.broadcast(tx.toHex());

    await restClient.verify({
      txId: tx.getId(),
      address: randomAddress,
      vout: 0,
      satoshis: 2e4 * amountFactor,
    });
  });

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2WPKH input with nonWitnessUtxo', async () => {
    // For learning purposes, ignore this test.
    // REPEATING ABOVE BUT WITH nonWitnessUtxo by passing false to getInputData
    const p2wpkh = createPayment('p2wpkh', undefined, regtest);
    const inputData = await getInputData(
      5e4 * amountFactor,
      p2wpkh.payment,
      false,
      'noredeem',
    );
    const psbt = new Psbt({ network: regtest })
      .addInput(inputData)
      .addOutput({
        address: randomAddress,
        value: 2e4 * amountFactor,
      })
      .signInput(0, p2wpkh.keys[0]);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction(true);
    await restClient.broadcast(tx.toHex());
    await restClient.verify({
      txId: tx.getId(),
      address: randomAddress,
      vout: 0,
      satoshis: 2e4 * amountFactor,
    });
  });

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2WSH(P2PK) input', async () => {
    const p2wsh = createPayment('p2wsh-p2pk', undefined, regtest);
    const inputData = await getInputData(
      5e4 * amountFactor,
      p2wsh.payment,
      true,
      'p2wsh',
    );
    {
      const {
        hash,
        index,
        witnessUtxo,
        witnessScript, // NEW: A Buffer of the witnessScript
      } = inputData;
      assert.deepStrictEqual(
        { hash, index, witnessUtxo, witnessScript },
        inputData,
      );
    }

    const psbt = new Psbt({ network: regtest })
      .addInput(inputData)
      .addOutput({
        address: randomAddress,
        value: 2e4 * amountFactor,
      })
      .signInput(0, p2wsh.keys[0]);

    assert.strictEqual(psbt.validateSignaturesOfInput(0, validator), true);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction(true);

    // build and broadcast to the Bitcoin RegTest network
    await restClient.broadcast(tx.toHex());

    await restClient.verify({
      txId: tx.getId(),
      address: randomAddress,
      vout: 0,
      satoshis: 2e4 * amountFactor,
    });
  });

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2WSH(P2PK) input with nonWitnessUtxo', async () => {
    // For learning purposes, ignore this test.
    // REPEATING ABOVE BUT WITH nonWitnessUtxo by passing false to getInputData
    const p2wsh = createPayment('p2wsh-p2pk', undefined, regtest);
    const inputData = await getInputData(
      5e4 * amountFactor,
      p2wsh.payment,
      false,
      'p2wsh',
    );
    const psbt = new Psbt({ network: regtest })
      .addInput(inputData)
      .addOutput({
        address: randomAddress,
        value: 2e4 * amountFactor,
      })
      .signInput(0, p2wsh.keys[0]);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction(true);
    await restClient.broadcast(tx.toHex());
    await restClient.verify({
      txId: tx.getId(),
      address: randomAddress,
      vout: 0,
      satoshis: 2e4 * amountFactor,
    });
  });

  it(
    'can create (and broadcast via 3PBP) a Transaction, w/ a ' +
      'P2SH(P2WSH(P2MS(3 of 4))) (SegWit multisig) input',
    async () => {
      const p2sh = createPayment('p2sh-p2wsh-p2ms(3 of 4)', undefined, regtest);
      const inputData = await getInputData(
        5e4 * amountFactor,
        p2sh.payment,
        true,
        'p2sh-p2wsh',
      );
      {
        const { hash, index, witnessUtxo, redeemScript, witnessScript } =
          inputData;
        assert.deepStrictEqual(
          { hash, index, witnessUtxo, redeemScript, witnessScript },
          inputData,
        );
      }

      const psbt = new Psbt({ network: regtest })
        .addInput(inputData)
        .addOutput({
          address: randomAddress,
          value: 2e4 * amountFactor,
        })
        .signInput(0, p2sh.keys[0])
        .signInput(0, p2sh.keys[2])
        .signInput(0, p2sh.keys[3]);

      assert.strictEqual(psbt.validateSignaturesOfInput(0, validator), true);
      assert.strictEqual(
        psbt.validateSignaturesOfInput(0, validator, p2sh.keys[3].publicKey),
        true,
      );
      assert.throws(() => {
        psbt.validateSignaturesOfInput(0, validator, p2sh.keys[1].publicKey);
      }, /No signatures for this pubkey/);
      psbt.finalizeAllInputs();

      const tx = psbt.extractTransaction(true);

      // build and broadcast to the Bitcoin RegTest network
      await restClient.broadcast(tx.toHex());

      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 2e4 * amountFactor,
      });
    },
  );

  it(
    'can create (and broadcast via 3PBP) a Transaction, w/ a ' +
      'P2SH(P2WSH(P2MS(3 of 4))) (SegWit multisig) input with nonWitnessUtxo',
    async () => {
      // For learning purposes, ignore this test.
      // REPEATING ABOVE BUT WITH nonWitnessUtxo by passing false to getInputData
      const p2sh = createPayment('p2sh-p2wsh-p2ms(3 of 4)', undefined, regtest);
      const inputData = await getInputData(
        5e4 * amountFactor,
        p2sh.payment,
        false,
        'p2sh-p2wsh',
      );
      const psbt = new Psbt({ network: regtest })
        .addInput(inputData)
        .addOutput({
          address: randomAddress,
          value: 2e4 * amountFactor,
        })
        .signInput(0, p2sh.keys[0])
        .signInput(0, p2sh.keys[2])
        .signInput(0, p2sh.keys[3]);
      psbt.finalizeAllInputs();
      const tx = psbt.extractTransaction(true);
      await restClient.broadcast(tx.toHex());
      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 2e4 * amountFactor,
      });
    },
  );

  it(
    'can create (and broadcast via 3PBP) a Transaction, w/ a ' +
      'P2SH(P2MS(2 of 2)) input with nonWitnessUtxo',
    async () => {
      const myKey = ECPair.makeRandom({ network: regtest });
      const myKeys = [
        myKey,
        ECPair.fromPrivateKey(myKey.privateKey!, { network: regtest }),
      ];
      const p2sh = createPayment('p2sh-p2ms(2 of 2)', myKeys, regtest);
      const inputData = await getInputData(
        5e4 * amountFactor,
        p2sh.payment,
        false,
        'p2sh',
      );
      const psbt = new Psbt({ network: regtest })
        .addInput(inputData)
        .addOutput({
          address: randomAddress,
          value: 2e4 * amountFactor,
        })
        .signInput(0, p2sh.keys[0]);
      psbt.finalizeAllInputs();
      const tx = psbt.extractTransaction(true);
      await restClient.broadcast(tx.toHex());
      await restClient.verify({
        txId: tx.getId(),
        address: randomAddress,
        vout: 0,
        satoshis: 2e4 * amountFactor,
      });
    },
  );

  it('can create (and broadcast via 3PBP) a Transaction, w/ a P2WPKH input using HD', async () => {
    const hdRoot = bip32.fromSeed(randomBytes(64));
    const masterFingerprint = hdRoot.fingerprint;
    const path = "m/84'/0'/0'/0/0";
    const childNode = hdRoot.derivePath(path);
    const pubkey = childNode.publicKey;

    // This information should be added to your input via updateInput
    // You can add multiple bip32Derivation objects for multisig, but
    // each must have a unique pubkey.
    //
    // This is useful because as long as you store the masterFingerprint on
    // the PSBT Creator's server, you can have the PSBT Creator do the heavy
    // lifting with derivation from your m/84'/0'/0' xpub, (deriving only 0/0 )
    // and your signer just needs to pass in an HDSigner interface (ie. bip32 library)
    const updateData = {
      bip32Derivation: [
        {
          masterFingerprint,
          path,
          pubkey,
        },
      ],
    };
    const p2wpkh = createPayment('p2wpkh', [childNode], regtest);
    const inputData = await getInputData(
      5e4 * amountFactor,
      p2wpkh.payment,
      true,
      'noredeem',
    );
    {
      const { hash, index, witnessUtxo } = inputData;
      assert.deepStrictEqual({ hash, index, witnessUtxo }, inputData);
    }

    // You can add extra attributes for updateData into the addInput(s) object(s)
    Object.assign(inputData, updateData);

    const psbt = new Psbt({ network: regtest })
      .addInput(inputData)
      // .updateInput(0, updateData) // if you didn't merge the bip32Derivation with inputData
      .addOutput({
        address: randomAddress,
        value: 2e4 * amountFactor,
      })
      .signInputHD(0, hdRoot); // must sign with root!!!

    assert.strictEqual(psbt.validateSignaturesOfInput(0, validator), true);
    assert.strictEqual(
      psbt.validateSignaturesOfInput(0, validator, childNode.publicKey),
      true,
    );
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction(true);

    // build and broadcast to the Bitcoin RegTest network
    await restClient.broadcast(tx.toHex());

    await restClient.verify({
      txId: tx.getId(),
      address: randomAddress,
      vout: 0,
      satoshis: 2e4 * amountFactor,
    });
  });
});
