/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import assert from 'assert';
import { describe, it } from 'mocha';
import * as bscript from '../src/script.js';
import * as ecc from '@bitcoin-computer/secp256k1';
import { initEccLib } from '../src/ecc_lib.js';
import script from './fixtures/script.js';
import { Buffer } from 'buffer';

const fixtures = script;
// @ts-ignore
import minimalData from 'minimaldata';

describe('script', () => {
  // TODO
  describe('isCanonicalPubKey', () => {
    it('rejects if not provided a Buffer', () => {
      assert.strictEqual(false, bscript.isCanonicalPubKey(0 as any));
    });
    it('rejects smaller than 33', () => {
      for (let i = 0; i < 33; i++) {
        assert.strictEqual(
          false,
          bscript.isCanonicalPubKey(Buffer.allocUnsafe(i)),
        );
      }
    });
  });
  describe.skip('isCanonicalScriptSignature', () => {
    assert.ok(true);
  });

  describe('fromASM/toASM', () => {
    fixtures.valid.forEach(f => {
      it('encodes/decodes ' + f.asm, () => {
        const script = bscript.fromASM(f.asm);
        assert.strictEqual(bscript.toASM(script), f.asm);
      });
    });

    fixtures.invalid.fromASM.forEach(f => {
      it('throws ' + f.description, () => {
        assert.throws(() => {
          bscript.fromASM(f.script);
        }, new RegExp(f.description));
      });
    });
  });

  describe('toASM', () => {
    const OP_RETURN = bscript.OPS.OP_RETURN;
    it('encodes empty buffer as OP_0', () => {
      const chunks = [OP_RETURN, Buffer.from([])];
      assert.strictEqual(bscript.toASM(chunks), 'OP_RETURN OP_0');
    });

    for (let i = 1; i <= 16; i++) {
      it(`encodes one byte buffer [${i}] as OP_${i}`, () => {
        const chunks = [OP_RETURN, Buffer.from([i])];
        assert.strictEqual(bscript.toASM(chunks), 'OP_RETURN OP_' + i);
      });
    }
  });

  describe('fromASM/toASM (templates)', () => {
    fixtures.valid2.forEach(f => {
      if (f.inputHex) {
        const ih = bscript.toASM(Buffer.from(f.inputHex, 'hex'));

        it('encodes/decodes ' + ih, () => {
          const script = bscript.fromASM(f.input);
          assert.strictEqual(script.toString('hex'), f.inputHex);
          assert.strictEqual(bscript.toASM(script), f.input);
        });
      }

      if (f.outputHex) {
        it('encodes/decodes ' + f.output, () => {
          const script = bscript.fromASM(f.output);
          assert.strictEqual(script.toString('hex'), f.outputHex);
          assert.strictEqual(bscript.toASM(script), f.output);
        });
      }
    });
  });

  describe('fromPublicKey', () => {
    before('Before', () => {
      initEccLib(ecc);
    });
    const types = Object.assign({
      pubkey: 'p2pk',
      pubkeyhash: 'p2pkh',
      scripthash: 'p2sh',
      multisig: 'p2ms',
      witnesspubkeyhash: 'p2wpkh',
      witnessscripthash: 'p2wsh',
      taproot: 'p2tr',
      nonstandard: 'nonstandard',
    });
    fixtures.valid2.forEach(f => {
      if (!f.pubKey) return;
      it('decodes ' + f.pubKey.slice(0, 10) + '... to ' + types[f.type], () => {
        const script = bscript.fromPublicKey(
          Buffer.from(f.pubKey, 'hex'),
          types[f.type],
        );

        assert.strictEqual(bscript.toASM(script), f.output);
      });
    });
  });

  describe('isPushOnly', () => {
    fixtures.valid.forEach(f => {
      it('returns ' + !!f.stack + ' for ' + f.asm, () => {
        const script = bscript.fromASM(f.asm);
        const chunks = bscript.decompile(script);

        assert.strictEqual(bscript.isPushOnly(chunks!), !!f.stack);
      });
    });
  });

  describe('toStack', () => {
    fixtures.valid.forEach(f => {
      it('returns ' + !!f.stack + ' for ' + f.asm, () => {
        if (!f.stack || !f.asm) return;

        const script = bscript.fromASM(f.asm);

        const stack = bscript.toStack(script);
        assert.deepStrictEqual(
          stack.map(x => {
            return x.toString('hex');
          }),
          f.stack,
        );

        assert.strictEqual(
          bscript.toASM(bscript.compile(stack)),
          f.asm,
          'should rebuild same script from stack',
        );
      });
    });
  });

  describe('compile (via fromASM)', () => {
    fixtures.valid.forEach(f => {
      it('compiles ' + f.asm, () => {
        const scriptSig = bscript.fromASM(f.asm);

        assert.strictEqual(scriptSig.toString('hex'), f.script);

        if (f.nonstandard) {
          const scriptSigNS = bscript.fromASM(f.nonstandard.scriptSig);

          assert.strictEqual(scriptSigNS.toString('hex'), f.script);
        }
      });
    });
  });

  describe('decompile', () => {
    fixtures.valid.forEach(f => {
      it('decompiles ' + f.asm, () => {
        const chunks = bscript.decompile(Buffer.from(f.script, 'hex'));

        assert.strictEqual(bscript.compile(chunks!).toString('hex'), f.script);
        assert.strictEqual(bscript.toASM(chunks!), f.asm);

        if (f.nonstandard) {
          const chunksNS = bscript.decompile(
            Buffer.from(f.nonstandard.scriptSigHex, 'hex'),
          );

          assert.strictEqual(
            bscript.compile(chunksNS!).toString('hex'),
            f.script,
          );

          // toASM converts verbatim, only `compile` transforms the script to a minimalpush compliant script
          assert.strictEqual(bscript.toASM(chunksNS!), f.nonstandard.scriptSig);
        }
      });
    });

    fixtures.invalid.decompile.forEach(f => {
      it(
        'fails to decompile ' + f.script + ',  because "' + f.description + '"',
        () => {
          const chunks = bscript.decompile(Buffer.from(f.script, 'hex'));

          assert.strictEqual(chunks, null);
        },
      );
    });
  });

  describe('SCRIPT_VERIFY_MINIMALDATA policy', () => {
    fixtures.valid.forEach(f => {
      it('compliant for scriptSig ' + f.asm, () => {
        const script = Buffer.from(f.script, 'hex');

        assert(minimalData(script));
      });
    });

    function testEncodingForSize(num: number): void {
      it('compliant for data PUSH of length ' + num, () => {
        const buffer = Buffer.alloc(num);
        const script = bscript.compile([buffer]);

        assert(
          minimalData(script),
          'Failed for ' + num + ' length script: ' + script.toString('hex'),
        );
      });
    }

    for (let i = 0; i < 520; ++i) {
      testEncodingForSize(i);
    }
  });
});
