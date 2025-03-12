/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import assert from 'assert';
import { describe, it } from 'mocha';
import * as types from '../src/types.js';
// @ts-ignore
import typeforce from 'typeforce';

describe('types', () => {
  describe('Buffer Hash160/Hash256', () => {
    const buffer20byte = Buffer.alloc(20);
    const buffer32byte = Buffer.alloc(32);

    it('return true for valid size', () => {
      assert(types.Hash160bit(buffer20byte));
      assert(types.Hash256bit(buffer32byte));
    });

    it('return true for oneOf', () => {
      assert.doesNotThrow(() => {
        typeforce(
          types.oneOf(types.Hash160bit, types.Hash256bit),
          buffer32byte,
        );
      });

      assert.doesNotThrow(() => {
        typeforce(
          types.oneOf(types.Hash256bit, types.Hash160bit),
          buffer32byte,
        );
      });
    });

    it('throws for invalid size', () => {
      assert.throws(() => {
        types.Hash160bit(buffer32byte);
      }, /Expected Buffer\(Length: 20\), got Buffer\(Length: 32\)/);

      assert.throws(() => {
        types.Hash256bit(buffer20byte);
      }, /Expected Buffer\(Length: 32\), got Buffer\(Length: 20\)/);
    });
  });

  describe('UInt31', () => {
    const UINT31_MAX = Math.pow(2, 31) - 1;
    it('return true for valid values', () => {
      assert.strictEqual(types.UInt31(0), true);
      assert.strictEqual(types.UInt31(1000), true);
      assert.strictEqual(types.UInt31(UINT31_MAX), true);
    });

    it('return false for negative values', () => {
      assert.strictEqual(types.UInt31(-1), false);
      assert.strictEqual(types.UInt31(-UINT31_MAX), false);
    });

    it(`return false for value > ${UINT31_MAX}`, () => {
      assert.strictEqual(types.UInt31(UINT31_MAX + 1), false);
    });
  });

  describe('BIP32Path', () => {
    it('return true for valid paths', () => {
      assert.strictEqual(types.BIP32Path("m/0'/0'"), true);
      assert.strictEqual(types.BIP32Path("m/0'/0"), true);
      assert.strictEqual(types.BIP32Path("m/0'/1'/2'/3/4'"), true);
    });

    it('return false for invalid paths', () => {
      assert.strictEqual(types.BIP32Path('m'), false);
      assert.strictEqual(types.BIP32Path("n/0'/0'"), false);
      assert.strictEqual(types.BIP32Path("m/0'/x"), false);
    });

    it('return "BIP32 derivation path" for JSON.strigify()', () => {
      const toJsonValue = JSON.stringify(types.BIP32Path);
      assert.equal(toJsonValue, '"BIP32 derivation path"');
    });
  });
});
