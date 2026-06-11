/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import assert from 'assert';
import { describe, it } from 'mocha';
import * as scriptNumber from '../src/script_number.js';
import script_number from './fixtures/script_number.js';
import { Buffer } from 'buffer';

describe('script-number', () => {
  describe('decode', () => {
    script_number.forEach(f => {
      it(f.hex + ' returns ' + f.number, () => {
        const actual = scriptNumber.decode(Buffer.from(f.hex, 'hex'), f.bytes);

        assert.strictEqual(actual, f.number);
      });
    });
  });

  describe('encode', () => {
    script_number.forEach(f => {
      it(f.number + ' returns ' + f.hex, () => {
        const actual = scriptNumber.encode(f.number);

        assert.strictEqual(actual.toString('hex'), f.hex);
      });
    });
  });
});
