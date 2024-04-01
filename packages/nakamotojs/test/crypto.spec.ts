/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import assert from 'assert';
import { describe, it } from 'mocha';
import { crypto as bcrypto, TaggedHashPrefix } from '../src/index.js';
import * as fixturesModule from './fixtures/crypto.json' assert { type: 'json' };
const fixtures: typeof import('./fixtures/crypto.json') =
  // @ts-ignore
  fixturesModule.default || fixturesModule;
import { sha256, TAGS, TAGGED_HASH_PREFIXES } from '../src/crypto.js';

describe('crypto', () => {
  ['hash160', 'hash256', 'ripemd160', 'sha1', 'sha256'].forEach(algorithm => {
    describe(algorithm, () => {
      fixtures.hashes.forEach(f => {
        const fn = (bcrypto as any)[algorithm];
        const expected = (f as any)[algorithm];

        it('returns ' + expected + ' for ' + f.hex, () => {
          const data = Buffer.from(f.hex, 'hex');
          const actual = fn(data).toString('hex');

          assert.strictEqual(actual, expected);
        });
      });
    });
  });

  describe('taggedHash', () => {
    fixtures.taggedHash.forEach(f => {
      const bytes = Buffer.from(f.hex, 'hex');
      const expected = Buffer.from(f.result, 'hex');
      it(`returns ${f.result} for taggedHash "${f.tag}" of ${f.hex}`, () => {
        const actual = bcrypto.taggedHash(f.tag as TaggedHashPrefix, bytes);
        assert.strictEqual(actual.toString('hex'), expected.toString('hex'));
      });
    });
  });

  describe('TAGGED_HASH_PREFIXES', () => {
    const taggedHashPrefixes = Object.fromEntries(
      TAGS.map((tag: TaggedHashPrefix) => {
        const tagHash = sha256(Buffer.from(tag));
        return [tag, Buffer.concat([tagHash, tagHash])];
      }),
    );
    it('stored the result of operation', () => {
      assert.strictEqual(
        JSON.stringify(TAGGED_HASH_PREFIXES),
        JSON.stringify(taggedHashPrefixes),
      );
    });
  });
});
