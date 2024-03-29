import * as assertModule from 'assert';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const assert: typeof import('assert') = assertModule.default || assertModule;
import { describe, it } from 'mocha';
import { signature as bscriptSig } from '../src/script.js';
import * as fixturesModule from './fixtures/signature.json' assert { type: 'json' };
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const fixtures: any = fixturesModule.default || fixturesModule;

describe('Script Signatures', () => {
  function fromRaw(signature: { r: string; s: string }): Buffer {
    return Buffer.concat(
      [Buffer.from(signature.r, 'hex'), Buffer.from(signature.s, 'hex')],
      64,
    );
  }

  function toRaw(signature: Buffer): {
    r: string;
    s: string;
  } {
    return {
      r: signature.slice(0, 32).toString('hex'),
      s: signature.slice(32, 64).toString('hex'),
    };
  }

  describe('encode', () => {
    fixtures.valid.forEach((f: any) => {
      it('encodes ' + f.hex, () => {
        const buffer = bscriptSig.encode(fromRaw(f.raw), f.hashType);

        assert.strictEqual(buffer.toString('hex'), f.hex);
      });
    });

    fixtures.invalid.forEach((f: any) => {
      if (!f.raw) return;

      it('throws ' + f.exception, () => {
        const signature = fromRaw(f.raw);

        assert.throws(() => {
          bscriptSig.encode(signature, f.hashType);
        }, new RegExp(f.exception));
      });
    });
  });

  describe('decode', () => {
    fixtures.valid.forEach((f: any) => {
      it('decodes ' + f.hex, () => {
        const decode = bscriptSig.decode(Buffer.from(f.hex, 'hex'));

        assert.deepStrictEqual(toRaw(decode.signature), f.raw);
        assert.strictEqual(decode.hashType, f.hashType);
      });
    });

    fixtures.invalid.forEach((f: any) => {
      it('throws on ' + f.hex, () => {
        const buffer = Buffer.from(f.hex, 'hex');

        assert.throws(() => {
          bscriptSig.decode(buffer);
        }, new RegExp(f.exception));
      });
    });
  });
});
