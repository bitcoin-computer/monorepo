import * as assertModule from 'assert';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const assert: typeof import('assert') = assertModule.default || assertModule;
import { describe, it } from 'mocha';
import * as scriptNumber from '../src/script_number.js';
import * as fixturesModule from './fixtures/script_number.json' assert { type: 'json' };
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const fixtures: any = fixturesModule.default || fixturesModule;

describe('script-number', () => {
  describe('decode', () => {
    fixtures.forEach((f: any) => {
      it(f.hex + ' returns ' + f.number, () => {
        const actual = scriptNumber.decode(Buffer.from(f.hex, 'hex'), f.bytes);

        assert.strictEqual(actual, f.number);
      });
    });
  });

  describe('encode', () => {
    fixtures.forEach((f: any) => {
      it(f.number + ' returns ' + f.hex, () => {
        const actual = scriptNumber.encode(f.number);

        assert.strictEqual(actual.toString('hex'), f.hex);
      });
    });
  });
});
