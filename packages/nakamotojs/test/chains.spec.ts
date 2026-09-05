import { strict as assert } from 'assert';
import { describe, it } from 'mocha';
import {
  bitcoin,
  testnet,
  regtest,
  litecoin,
  litecointestnet,
  litecoinregtest,
  dogecoin,
  dogecointestnet,
  dogecoinregtest,
  pepecoin,
  pepecointestnet,
  pepecoinregtest,
  wojakcoin,
  wojakcointestnet,
  wojakcoinregtest,
  getNetwork,
} from '../src/networks.js';
import {
  BUILTIN_CHAINS,
  ChainConfig,
  getBip44Path,
  getChainConfig,
  getCoinType,
  getNetworkConfig,
  getParsingPolicy,
  listSupportedChains,
  registerChain,
  isMwebTxHex,
  skipAdvancedTx,
  shouldIndexTransaction,
  shouldParseTransaction,
} from '../src/index.js';

describe('chain registry', () => {
  it('lists built-in product chains', () => {
    assert.deepStrictEqual(BUILTIN_CHAINS, [
      'LTC',
      'BTC',
      'DOGE',
      'PEPE',
      'WOJAK',
    ]);
    for (const chain of BUILTIN_CHAINS) {
      assert.ok(listSupportedChains().includes(chain));
    }
  });

  it('matches historical Network objects', () => {
    const expected: Array<[string, string, ReturnType<typeof getNetwork>]> = [
      ['BTC', 'mainnet', bitcoin],
      ['BTC', 'testnet', testnet],
      ['BTC', 'regtest', regtest],
      ['LTC', 'mainnet', litecoin],
      ['LTC', 'testnet', litecointestnet],
      ['LTC', 'regtest', litecoinregtest],
      ['DOGE', 'mainnet', dogecoin],
      ['DOGE', 'testnet', dogecointestnet],
      ['DOGE', 'regtest', dogecoinregtest],
      ['PEPE', 'mainnet', pepecoin],
      ['PEPE', 'testnet', pepecointestnet],
      ['PEPE', 'regtest', pepecoinregtest],
      ['WOJAK', 'mainnet', wojakcoin],
      ['WOJAK', 'testnet', wojakcointestnet],
      ['WOJAK', 'regtest', wojakcoinregtest],
    ];
    for (const [chain, network, named] of expected) {
      const resolved = getNetwork(chain, network);
      assert.strictEqual(resolved, named);
      assert.deepStrictEqual(
        { ...resolved },
        {
          messagePrefix: named.messagePrefix,
          bech32: named.bech32,
          bip32: { ...named.bip32 },
          pubKeyHash: named.pubKeyHash,
          scriptHash: named.scriptHash,
          wif: named.wif,
        },
      );
    }
  });

  it('goldens Network field values for BTC/LTC/DOGE/PEPE/WOJAK mainnet', () => {
    assert.deepStrictEqual(
      { ...getNetwork('BTC', 'mainnet') },
      {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: { public: 0x0488b21e, private: 0x0488ade4 },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
      },
    );
    assert.deepStrictEqual(
      { ...getNetwork('LTC', 'mainnet') },
      {
        messagePrefix: '\x18Litecoin Signed Message:\n',
        bech32: 'ltc',
        bip32: { public: 0x0488b21e, private: 0x0488ade4 },
        pubKeyHash: 0x30,
        scriptHash: 0x32,
        wif: 0x80,
      },
    );
    assert.deepStrictEqual(
      { ...getNetwork('DOGE', 'mainnet') },
      {
        messagePrefix: '\x19Dogecoin Signed Message:\n',
        bech32: 'doge',
        bip32: { public: 0x02facafd, private: 0x02fac398 },
        pubKeyHash: 0x1e,
        scriptHash: 0x16,
        wif: 0x9e,
      },
    );
    assert.deepStrictEqual(
      { ...getNetwork('PEPE', 'mainnet') },
      {
        messagePrefix: '\x18Pepecoin Signed Message:\n',
        bech32: 'pepe',
        bip32: { public: 0x02facafd, private: 0x02fac398 },
        pubKeyHash: 0x38,
        scriptHash: 0x16,
        wif: 0x9e,
      },
    );
    assert.deepStrictEqual(
      { ...getNetwork('WOJAK', 'mainnet') },
      {
        messagePrefix: '\x18WojakCoin Signed Message:\n',
        bech32: 'wojak',
        bip32: { public: 0x0488b21e, private: 0x0488ade4 },
        pubKeyHash: 0x49,
        scriptHash: 0x05,
        wif: 0xc9,
      },
    );
  });

  it('returns BIP44 coin types from config, not bech32 identity', () => {
    assert.strictEqual(getCoinType('BTC', 'mainnet'), 0);
    assert.strictEqual(getCoinType('LTC', 'mainnet'), 2);
    assert.strictEqual(getCoinType('DOGE', 'mainnet'), 3);
    assert.strictEqual(getCoinType('PEPE', 'mainnet'), 3434);
    assert.strictEqual(getCoinType('WOJAK', 'mainnet'), 20760);
    assert.strictEqual(getCoinType('LTC', 'regtest'), 1);
    assert.throws(() => getCoinType('BBB', 'mainnet'), /Invalid chain BBB/);
    assert.strictEqual(getBip44Path({ coinType: 2 }), "m/44'/2'/0'");
  });

  it('uses taproot module storage only where features.taproot is true', () => {
    assert.strictEqual(
      getNetworkConfig('WOJAK', 'mainnet').defaults.moduleStorageType,
      'multisig',
    );
    assert.strictEqual(
      getNetworkConfig('WOJAK', 'mainnet').features.taproot,
      false,
    );
    assert.strictEqual(
      getNetworkConfig('WOJAK', 'testnet').defaults.moduleStorageType,
      'multisig',
    );
    assert.strictEqual(
      getNetworkConfig('WOJAK', 'regtest').defaults.moduleStorageType,
      'taproot',
    );
    assert.strictEqual(
      getNetworkConfig('WOJAK', 'regtest').features.taproot,
      true,
    );
    assert.strictEqual(
      getNetworkConfig('PEPE', 'mainnet').defaults.moduleStorageType,
      'multisig',
    );
    assert.strictEqual(
      getNetworkConfig('DOGE', 'regtest').defaults.moduleStorageType,
      'multisig',
    );
    assert.strictEqual(getNetworkConfig('LTC', 'regtest').features.mweb, true);
    assert.strictEqual(
      getNetworkConfig('BTC', 'mainnet').features.taproot,
      true,
    );
  });

  it('freezes built-in configs and refuses override', () => {
    const cfg = getChainConfig('BTC');
    assert.ok(Object.isFrozen(cfg));
    assert.throws(() => {
      (cfg as { chain: string }).chain = 'NOPE';
    });
    assert.throws(
      () =>
        registerChain({
          ...cfg,
          defaults: { ...cfg.defaults, satPerByte: 99 },
        }),
      /Cannot override built-in chain BTC/,
    );
  });

  it('rejects functions and illegal keys on registerChain', () => {
    const base = (): ChainConfig => ({
      chain: 'JKC',
      defaults: {
        satPerByte: 1,
        dustRelayTxFee: 1000,
        moduleStorageType: 'multisig',
      },
      networks: {
        mainnet: {
          messagePrefix: 'x',
          bip32: { public: 1, private: 2 },
          pubKeyHash: 1,
          scriptHash: 2,
          wif: 3,
          coinType: 99,
        },
        testnet: {
          messagePrefix: 'x',
          bip32: { public: 1, private: 2 },
          pubKeyHash: 1,
          scriptHash: 2,
          wif: 3,
          coinType: 1,
        },
        regtest: {
          messagePrefix: 'x',
          bip32: { public: 1, private: 2 },
          pubKeyHash: 1,
          scriptHash: 2,
          wif: 3,
          coinType: 1,
        },
      },
    });
    assert.throws(
      () =>
        registerChain({
          ...base(),
          defaults: {
            ...base().defaults,
            satPerByte: (() => 1) as unknown as number,
          },
        }),
      /pure data/,
    );
    assert.throws(
      () =>
        registerChain({
          ...base(),
          defaults: {
            ...base().defaults,
            constructor: { foo: 1 },
          } as ChainConfig['defaults'],
        }),
      /Illegal key/,
    );
  });

  it('accepts trusted shouldParse / shouldIndex hooks', () => {
    const skipFf = skipAdvancedTx('00', ['ff']);
    registerChain({
      chain: 'HOOKTEST',
      defaults: {
        satPerByte: 1,
        dustRelayTxFee: 1000,
        moduleStorageType: 'multisig',
      },
      networks: {
        mainnet: {
          messagePrefix: 'x',
          bip32: { public: 1, private: 2 },
          pubKeyHash: 1,
          scriptHash: 2,
          wif: 3,
          coinType: 99,
          parsing: { shouldParse: skipFf },
        },
        testnet: {
          messagePrefix: 'x',
          bip32: { public: 1, private: 2 },
          pubKeyHash: 1,
          scriptHash: 2,
          wif: 3,
          coinType: 1,
        },
        regtest: {
          messagePrefix: 'x',
          bip32: { public: 1, private: 2 },
          pubKeyHash: 1,
          scriptHash: 2,
          wif: 3,
          coinType: 1,
        },
      },
    });
    const policy = getParsingPolicy('HOOKTEST', 'mainnet');
    assert.strictEqual(
      policy.shouldParse('0200000000ff' + '00'.repeat(20)),
      false,
    );
    assert.strictEqual(
      policy.shouldParse('020000000001' + '00'.repeat(20)),
      true,
    );
    assert.strictEqual(policy.shouldIndex({ txId: 'ab', height: 1 }), true);
  });
});

describe('shouldParseTransaction', () => {
  const mweb08 = '020000000008' + '00'.repeat(40);
  const mweb09 = '020000000009' + '00'.repeat(40);
  const segwit = '020000000001' + '00'.repeat(40);
  // Legacy: version + vin=1 + prevout first byte 0x08 (not an advanced-tx flag)
  const legacy08 = '010000000108' + '00'.repeat(40);

  it('skips LTC MWEB flags 08 and 09 only when marker is 00', () => {
    assert.strictEqual(isMwebTxHex(mweb08), true);
    assert.strictEqual(isMwebTxHex(mweb09), true);
    assert.strictEqual(isMwebTxHex(segwit), false);
    assert.strictEqual(isMwebTxHex(legacy08), false);
    assert.strictEqual(shouldParseTransaction(mweb08, 'LTC', 'mainnet'), false);
    assert.strictEqual(shouldParseTransaction(mweb09, 'LTC', 'regtest'), false);
    assert.strictEqual(shouldParseTransaction(segwit, 'LTC', 'mainnet'), true);
    assert.strictEqual(
      shouldParseTransaction(legacy08, 'LTC', 'mainnet'),
      true,
    );
  });

  it('does not apply MWEB skip on non-LTC chains', () => {
    assert.strictEqual(shouldParseTransaction(mweb08, 'BTC', 'mainnet'), true);
    assert.strictEqual(shouldParseTransaction(mweb09, 'DOGE', 'regtest'), true);
    assert.strictEqual(
      shouldParseTransaction(mweb08, 'WOJAK', 'regtest'),
      true,
    );
  });
});

describe('shouldIndexTransaction', () => {
  // https://github.com/bitcoin/bips/blob/master/bip-0030.mediawiki
  const bip30TxId =
    'e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468';
  const bip30Height = 91722;

  it('skips BIP30 txs only on BTC mainnet at the recorded height', () => {
    assert.strictEqual(
      shouldIndexTransaction({
        txId: bip30TxId,
        chain: 'BTC',
        network: 'mainnet',
        height: bip30Height,
      }),
      false,
    );
    assert.strictEqual(
      shouldIndexTransaction({
        txId: bip30TxId,
        chain: 'BTC',
        network: 'mainnet',
        height: 1,
      }),
      true,
    );
    assert.strictEqual(
      shouldIndexTransaction({
        txId: bip30TxId,
        chain: 'BTC',
        network: 'testnet',
        height: bip30Height,
      }),
      true,
    );
    assert.strictEqual(
      shouldIndexTransaction({
        txId: bip30TxId,
        chain: 'LTC',
        network: 'mainnet',
        height: bip30Height,
      }),
      true,
    );
  });

  it('does not skip when height is omitted (ZMQ / mempool)', () => {
    assert.strictEqual(
      shouldIndexTransaction({
        txId: bip30TxId,
        chain: 'BTC',
        network: 'mainnet',
      }),
      true,
    );
  });
});
