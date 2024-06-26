/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import assert from 'assert';
import { describe, it } from 'mocha';
import * as ecc from '@bitcoin-computer/secp256k1';
import * as baddress from '../src/address.js';
import * as bscript from '../src/script.js';
import { NETWORKS } from '../src/networks.js';
import * as fixturesModule from './fixtures/address.json' assert { type: 'json' };

const fixtures: typeof import('./fixtures/address.json') =
  // @ts-ignore
  fixturesModule.default || fixturesModule;

import { initEccLib } from '../src/index.js';

describe('address', () => {
  describe('fromBase58Check', () => {
    fixtures.standard.forEach(f => {
      if (!f.base58check) return;

      it('decodes ' + f.base58check, () => {
        const decode = baddress.fromBase58Check(f.base58check);

        assert.strictEqual(decode.version, f.version);
        assert.strictEqual(decode.hash.toString('hex'), f.hash);
      });
    });

    fixtures.invalid.fromBase58Check.forEach(f => {
      it('throws on ' + f.exception, () => {
        assert.throws(
          () => {
            baddress.fromBase58Check(f.address);
          },
          new RegExp(f.address + ' ' + f.exception),
        );
      });
    });
  });

  describe('fromBech32', () => {
    fixtures.standard.forEach(f => {
      if (!f.bech32) return;

      it('decodes ' + f.bech32, () => {
        const actual = baddress.fromBech32(f.bech32);

        assert.strictEqual(actual.version, f.version);
        assert.strictEqual(actual.prefix, NETWORKS[f.network].bech32);
        assert.strictEqual(actual.data.toString('hex'), f.data);
      });
    });

    fixtures.invalid.bech32.forEach(f => {
      it('decode fails for ' + f.address + '(' + f.exception + ')', () => {
        assert.throws(() => {
          baddress.fromBech32(f.address);
        }, new RegExp(f.exception));
      });
    });
  });

  describe('fromOutputScript', () => {
    initEccLib(ecc);
    fixtures.standard.forEach(f => {
      it('encodes ' + f.script.slice(0, 30) + '... (' + f.network + ')', () => {
        const script = bscript.fromASM(f.script);
        const address = baddress.fromOutputScript(script, NETWORKS[f.network]);

        assert.strictEqual(address, f.base58check || f.bech32!.toLowerCase());
      });
    });

    fixtures.invalid.fromOutputScript.forEach(f => {
      it('throws when ' + f.script.slice(0, 30) + '... ' + f.exception, () => {
        const script = bscript.fromASM(f.script);

        assert.throws(() => {
          baddress.fromOutputScript(script, undefined);
        }, new RegExp(f.exception));
      });
    });
  });

  describe('toBase58Check', () => {
    fixtures.standard.forEach(f => {
      if (!f.base58check) return;

      it('encodes ' + f.hash + ' (' + f.network + ')', () => {
        const address = baddress.toBase58Check(
          Buffer.from(f.hash, 'hex'),
          f.version,
        );

        assert.strictEqual(address, f.base58check);
      });
    });
  });

  describe('toBech32', () => {
    fixtures.bech32.forEach(f => {
      if (!f.address) return;
      const data = Buffer.from(f.data, 'hex');

      it('encode ' + f.address, () => {
        assert.deepStrictEqual(
          baddress.toBech32(data, f.version, f.prefix),
          f.address.toLowerCase(),
        );
      });
    });

    // TODO: These fixtures (according to TypeScript) have none of the data used below
    fixtures.invalid.bech32.forEach((f: any) => {
      if (!f.prefix || f.version === undefined || f.data === undefined) return;

      it('encode fails (' + f.exception, () => {
        assert.throws(() => {
          baddress.toBech32(Buffer.from(f.data, 'hex'), f.version, f.prefix);
        }, new RegExp(f.exception));
      });
    });
  });

  describe('toOutputScript', () => {
    fixtures.standard.forEach(f => {
      it('decodes ' + f.script.slice(0, 30) + '... (' + f.network + ')', () => {
        const script = baddress.toOutputScript(
          (f.base58check || f.bech32)!,
          NETWORKS[f.network],
        );

        assert.strictEqual(bscript.toASM(script), f.script);
      });
    });

    fixtures.invalid.toOutputScript.forEach(f => {
      it('throws when ' + (f.exception || f.paymentException), () => {
        const exception = f.paymentException || `${f.address} ${f.exception}`;
        assert.throws(() => {
          baddress.toOutputScript(f.address, f.network as any);
        }, new RegExp(exception));
      });
    });
  });

  describe('fromPublicKey', () => {
    fixtures.valid.forEach(f => {
      f.types.forEach(t => {
        if (!t.address) return;
        it(
          'decodes ' +
            f.publicKey.slice(0, 10) +
            '... (' +
            f.network +
            ') to ' +
            t.scriptType,
          () => {
            const addr = baddress.fromPublicKey(
              Buffer.from(f.publicKey, 'hex'),
              t.scriptType,
              NETWORKS[f.network],
            );

            assert.strictEqual(addr, t.address);
          },
        );
      });
    });
  });
});
