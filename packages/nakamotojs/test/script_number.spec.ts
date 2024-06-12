/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import assert from 'assert';
import { describe, it } from 'mocha';
import * as scriptNumber from '../src/script_number.js';
import * as fixturesModule from './fixtures/script_number.json' assert { type: 'json' };
const fixtures: typeof import('./fixtures/script_number.json') =
  // @ts-ignore
  fixturesModule.default || fixturesModule;

describe('script-number', () => {
  describe('decode', () => {
    fixtures.forEach(f => {
      it(f.hex + ' returns ' + f.number, () => {
        const actual = scriptNumber.decode(Buffer.from(f.hex, 'hex'), f.bytes);

        assert.strictEqual(actual, f.number);
      });
    });
  });

  describe('encode', () => {
    fixtures.forEach(f => {
      it(f.number + ' returns ' + f.hex, () => {
        const actual = scriptNumber.encode(f.number);

        assert.strictEqual(actual.toString('hex'), f.hex);
      });
    });
  });
});