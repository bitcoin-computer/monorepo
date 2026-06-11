/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import assert from 'assert';
import * as ecc from '@bitcoin-computer/secp256k1';
import { describe, it } from 'mocha';
import { PaymentCreator } from '../src/payments/index.js';
import * as u from './payments.utils.js';
import { initEccLib } from '../src/index.js';
import embedFixtures from './fixtures/embed.js';
import p2msFixtures from './fixtures/p2ms.js';
import p2pkFixtures from './fixtures/p2pk.js';
import p2pkhFixtures from './fixtures/p2pkh.js';
import p2shFixtures from './fixtures/p2sh.js';
import p2wpkhFixtures from './fixtures/p2wpkh.js';
import p2wshFixtures from './fixtures/p2wsh.js';
import p2trFixtures from './fixtures/p2tr.js';
import { Buffer } from 'buffer';

const fixturesMap: any = {
  embed: embedFixtures,
  p2ms: p2msFixtures,
  p2pk: p2pkFixtures,
  p2pkh: p2pkhFixtures,
  p2sh: p2shFixtures,
  p2wpkh: p2wpkhFixtures,
  p2wsh: p2wshFixtures,
  p2tr: p2trFixtures,
};

['embed', 'p2ms', 'p2pk', 'p2pkh', 'p2sh', 'p2wpkh', 'p2wsh', 'p2tr'].forEach(
  p => {
    describe(p, async () => {
      beforeEach(() => {
        initEccLib(p === 'p2tr' ? ecc : undefined);
      });
      let fn: PaymentCreator;
      const paymentModule = await import(`../src/payments/${p}.js`);
      const payment = paymentModule.default || paymentModule;
      if (p === 'embed') {
        fn = payment.p2data;
      } else {
        fn = payment[p];
      }

      const fixtures = fixturesMap[p];

      fixtures.valid.forEach((f: any) => {
        it(f.description + ' as expected', () => {
          const args = u.preform(f.arguments);
          const actual = fn(args, f.options);

          u.equate(actual, f.expected, f.arguments);
        });

        it(f.description + ' as expected (no validation)', () => {
          const args = u.preform(f.arguments);
          const actual = fn(
            args,
            Object.assign({}, f.options, {
              validate: false,
            }),
          );

          u.equate(actual, f.expected, f.arguments);
        });
      });

      fixtures.invalid.forEach((f: any) => {
        it(
          'throws ' +
            f.exception +
            (f.description ? 'for ' + f.description : ''),
          () => {
            const args = u.preform(f.arguments);

            assert.throws(() => {
              fn(args, f.options);
            }, new RegExp(f.exception));
          },
        );
      });

      if (p === 'p2sh') {
        const p2wsh = (await import(`../src/payments/p2wsh.js`)).p2wsh;
        const p2pk = (await import(`../src/payments/p2pk.js`)).p2pk;
        it('properly assembles nested p2wsh with names', () => {
          const actual = fn({
            redeem: p2wsh({
              redeem: p2pk({
                pubkey: Buffer.from(
                  '03e15819590382a9dd878f01e2f0cbce541564eb415e43b440472d883ecd283058',
                  'hex',
                ),
              }),
            }),
          });
          assert.strictEqual(
            actual.address,
            '3MGbrbye4ttNUXM8WAvBFRKry4fkS9fjuw',
          );
          assert.strictEqual(actual.name, 'p2sh-p2wsh-p2pk');
          assert.strictEqual(actual.redeem!.name, 'p2wsh-p2pk');
          assert.strictEqual(actual.redeem!.redeem!.name, 'p2pk');
        });
      }

      // cross-verify dynamically too
      if (!fixtures.dynamic) return;
      const { depends, details } = fixtures.dynamic;

      details.forEach((f: any) => {
        const detail = u.preform(f);
        const disabled: any = {};
        if (f.disabled)
          f.disabled.forEach((k: string) => {
            disabled[k] = true;
          });

        for (const key in depends) {
          if (key in disabled) continue;
          const dependencies = depends[key];

          dependencies.forEach((dependency: any) => {
            if (!Array.isArray(dependency)) dependency = [dependency];

            const args = {};
            dependency.forEach((d: any) => {
              u.from(d, detail, args);
            });
            const expected = u.from(key, detail);

            it(
              f.description +
                ', ' +
                key +
                ' derives from ' +
                JSON.stringify(dependency),
              () => {
                u.equate(fn(args), expected);
              },
            );
          });
        }
      });
    });
  },
);
