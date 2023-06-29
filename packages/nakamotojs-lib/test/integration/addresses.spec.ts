import * as assert from 'assert';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { describe, it } from 'mocha';
import * as bitcoin from '../..';
import { regtestUtils } from './_regtest';

const ECPair = ECPairFactory(ecc);
const dhttp = regtestUtils.dhttp;
const TESTNET = bitcoin.networks.testnet;

describe('nakamotojs-lib (addresses)', () => {
  it(
    'can generate a random address [and support the retrieval of ' +
      'transactions for that address (via 3PBP)]',
    async () => {
      const keyPair = ECPair.makeRandom();
      const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

      // bitcoin P2PKH addresses start with a '1'
      assert.strictEqual(address!.startsWith('1'), true);

      const result = await dhttp({
        method: 'GET',
        url: 'https://blockchain.info/rawaddr/' + address,
      });

      // random private keys [probably!] have no transactions
      assert.strictEqual((result as any).n_tx, 0);
      assert.strictEqual((result as any).total_received, 0);
      assert.strictEqual((result as any).total_sent, 0);
    },
  );

  // TODO: use another API or another way for querying balance of an address
  it.skip(
    'can generate a random address for Litecoin [and support the retrieval of ' +
      'transactions for that address (via 3PBP)]',
    async () => {
      const keyPair = ECPair.makeRandom();
      const { address } = bitcoin.payments.p2pkh({
        network: bitcoin.networks.litecoin,
        pubkey: keyPair.publicKey,
      });

      // bitcoin P2PKH addresses start with a '1'
      assert.strictEqual(address!.startsWith('L'), true);

      const result = await dhttp({
        method: 'GET',
        url: 'https://blockchain.info/rawaddr/' + address,
      });

      // random private keys [probably!] have no transactions
      assert.strictEqual((result as any).n_tx, 0);
      assert.strictEqual((result as any).total_received, 0);
      assert.strictEqual((result as any).total_sent, 0);
    },
  );

  it('can import an address via WIF', () => {
    const keyPair = ECPair.fromWIF(
      'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
    );
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

    assert.strictEqual(address, '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH');
  });

  it('can import a Litecoin address via WIF', () => {
    const keyPair = ECPair.fromWIF(
      'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
      bitcoin.networks.litecoin,
    );
    const { address } = bitcoin.payments.p2pkh({
      network: bitcoin.networks.litecoin,
      pubkey: keyPair.publicKey,
    });

    assert.strictEqual(address, 'LVuDpNCSSj6pQ7t9Pv6d6sUkLKoqDEVUnJ');
  });

  it('can generate a P2SH, pay-to-multisig (2-of-3) address', () => {
    const pubkeys = [
      '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
      '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
      '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
    ].map(hex => Buffer.from(hex, 'hex'));
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2ms({ m: 2, pubkeys }),
    });

    assert.strictEqual(address, '36NUkt6FWUi3LAWBqWRdDmdTWbt91Yvfu7');
  });

  it('can generate a Litecoin P2SH, pay-to-multisig (2-of-3) address', () => {
    const pubkeys = [
      '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
      '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
      '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
    ].map(hex => Buffer.from(hex, 'hex'));
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2ms({
        network: bitcoin.networks.litecoin,
        m: 2,
        pubkeys,
      }),
    });

    assert.strictEqual(address, 'MCad4mWDTbZU8fn5wPQy3QsrqJUaz2ha6c');
  });

  it('can generate a SegWit address', () => {
    const keyPair = ECPair.fromWIF(
      'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
    );
    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });

    assert.strictEqual(address, 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
  });

  it('can generate a Litecoin SegWit address', () => {
    const keyPair = ECPair.fromWIF(
      'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
      bitcoin.networks.litecoin,
    );
    const { address } = bitcoin.payments.p2wpkh({
      network: bitcoin.networks.litecoin,
      pubkey: keyPair.publicKey,
    });

    assert.strictEqual(address, 'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kgmn4n9');
  });

  it('can generate a SegWit address (via P2SH)', () => {
    const keyPair = ECPair.fromWIF(
      'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
    );
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }),
    });

    assert.strictEqual(address, '3JvL6Ymt8MVWiCNHC7oWU6nLeHNJKLZGLN');
  });

  it('can generate a Litecoin SegWit address (via P2SH)', () => {
    const keyPair = ECPair.fromWIF(
      'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
      bitcoin.networks.litecoin,
    );
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        network: bitcoin.networks.litecoin,
        pubkey: keyPair.publicKey,
      }),
    });

    assert.strictEqual(address, 'MR8UQSBr5ULwWheBHznrHk2jxyxkHQu8vB');
  });

  it('can generate a P2WSH (SegWit), pay-to-multisig (3-of-4) address', () => {
    const pubkeys = [
      '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
      '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
      '023e4740d0ba639e28963f3476157b7cf2fb7c6fdf4254f97099cf8670b505ea59',
      '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
    ].map(hex => Buffer.from(hex, 'hex'));
    const { address } = bitcoin.payments.p2wsh({
      redeem: bitcoin.payments.p2ms({ m: 3, pubkeys }),
    });

    assert.strictEqual(
      address,
      'bc1q75f6dv4q8ug7zhujrsp5t0hzf33lllnr3fe7e2pra3v24mzl8rrqtp3qul',
    );
  });

  it('can generate a Litecoin P2WSH (SegWit), pay-to-multisig (3-of-4) Litecoin address', () => {
    const pubkeys = [
      '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
      '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
      '023e4740d0ba639e28963f3476157b7cf2fb7c6fdf4254f97099cf8670b505ea59',
      '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
    ].map(hex => Buffer.from(hex, 'hex'));
    const { address } = bitcoin.payments.p2wsh({
      redeem: bitcoin.payments.p2ms({ m: 3, pubkeys }),
    });

    assert.strictEqual(
      address,
      'bc1q75f6dv4q8ug7zhujrsp5t0hzf33lllnr3fe7e2pra3v24mzl8rrqtp3qul',
    );
  });

  it('can generate a P2SH(P2WSH(...)), pay-to-multisig (2-of-2) address', () => {
    const pubkeys = [
      '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
      '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
    ].map(hex => Buffer.from(hex, 'hex'));
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wsh({
        network: bitcoin.networks.litecoin,
        redeem: bitcoin.payments.p2ms({
          network: bitcoin.networks.litecoin,
          m: 2,
          pubkeys,
        }),
      }),
    });

    assert.strictEqual(address, 'MVGvAqpdiMp6WU7dSfQMzLJuZ8fg6wrMBj');
  });

  // examples using other network information
  it('can generate a Testnet address', () => {
    const keyPair = ECPair.makeRandom({ network: TESTNET });
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: TESTNET,
    });

    // bitcoin testnet P2PKH addresses start with a 'm' or 'n'
    assert.strictEqual(
      address!.startsWith('m') || address!.startsWith('n'),
      true,
    );
  });

  it('can generate a Litecoin address', () => {
    const LITECOIN = {
      messagePrefix: '\x19Litecoin Signed Message:\n',
      bech32: 'ltc',
      bip32: {
        public: 0x019da462,
        private: 0x019d9cfe,
      },
      pubKeyHash: 0x30,
      scriptHash: 0x32,
      wif: 0xb0,
    };

    const keyPair = ECPair.makeRandom({ network: LITECOIN });
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: LITECOIN,
    });

    assert.strictEqual(address!.startsWith('L'), true);
  });
});
