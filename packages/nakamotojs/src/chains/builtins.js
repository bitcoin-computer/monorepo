import { isMwebTxHex, skipTxsAtHeight } from './parsing.js';
const MAINNET_BIP32 = { public: 0x0488b21e, private: 0x0488ade4 };
const TESTNET_BIP32 = { public: 0x043587cf, private: 0x04358394 };
const DOGE_MAINNET_BIP32 = { public: 0x02facafd, private: 0x02fac398 };
const DOGE_TESTNET_BIP32 = { public: 0x0432a9a8, private: 0x0432a243 };
const BTC_MESSAGE = '\x18Bitcoin Signed Message:\n';
const LTC_MESSAGE = '\x18Litecoin Signed Message:\n';
const DOGE_MESSAGE = '\x19Dogecoin Signed Message:\n';
const PEPE_MESSAGE = '\x18Pepecoin Signed Message:\n';
const WOJAK_MESSAGE = '\x18WojakCoin Signed Message:\n';
const ltcShouldParse = (hex) => !isMwebTxHex(hex);
// https://github.com/bitcoin/bips/blob/master/bip-0030.mediawiki
// Duplicate coinbases on BTC mainnet; skip the later occurrence at the given height.
const BTC_MAINNET_SKIP_TXS = [
    {
        txId: 'e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468',
        height: 91722,
    },
    {
        txId: 'd5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599',
        height: 91812,
    },
];
const btcMainnetShouldIndex = skipTxsAtHeight(BTC_MAINNET_SKIP_TXS);
export const BTC = {
    chain: 'BTC',
    defaults: {
        satPerByte: 2,
        dustRelayTxFee: 3000,
        moduleStorageType: 'taproot',
    },
    features: { segwit: true, taproot: true, mweb: false },
    networks: {
        mainnet: {
            messagePrefix: BTC_MESSAGE,
            bech32: 'bc',
            bip32: MAINNET_BIP32,
            pubKeyHash: 0x00,
            scriptHash: 0x05,
            wif: 0x80,
            coinType: 0,
            parsing: { shouldIndex: btcMainnetShouldIndex },
        },
        testnet: {
            messagePrefix: BTC_MESSAGE,
            bech32: 'tb',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
            coinType: 1,
        },
        regtest: {
            messagePrefix: BTC_MESSAGE,
            bech32: 'bcrt',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
            coinType: 1,
        },
    },
};
export const LTC = {
    chain: 'LTC',
    defaults: {
        satPerByte: 2,
        dustRelayTxFee: 30000,
        moduleStorageType: 'taproot',
    },
    features: { segwit: true, taproot: true, mweb: true },
    networks: {
        mainnet: {
            messagePrefix: LTC_MESSAGE,
            bech32: 'ltc',
            bip32: MAINNET_BIP32,
            pubKeyHash: 0x30,
            scriptHash: 0x32,
            wif: 0x80,
            coinType: 2,
            parsing: { shouldParse: ltcShouldParse },
        },
        testnet: {
            messagePrefix: LTC_MESSAGE,
            bech32: 'tltc',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0x3a,
            wif: 0xef,
            coinType: 1,
            parsing: { shouldParse: ltcShouldParse },
        },
        regtest: {
            messagePrefix: LTC_MESSAGE,
            bech32: 'rltc',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0x3a,
            wif: 0xef,
            coinType: 1,
            parsing: { shouldParse: ltcShouldParse },
        },
    },
};
export const DOGE = {
    chain: 'DOGE',
    defaults: {
        satPerByte: 3000,
        dustRelayTxFee: 10000000,
        moduleStorageType: 'multisig',
    },
    features: { segwit: true, taproot: false, mweb: false },
    networks: {
        mainnet: {
            messagePrefix: DOGE_MESSAGE,
            // Dummy prefix: Dogecoin does not use bech32. Kept so Network objects match
            // historical getNetwork() output.
            bech32: 'doge',
            bip32: DOGE_MAINNET_BIP32,
            pubKeyHash: 0x1e,
            scriptHash: 0x16,
            wif: 0x9e,
            coinType: 3,
        },
        testnet: {
            messagePrefix: DOGE_MESSAGE,
            bech32: 'tdoge',
            bip32: DOGE_TESTNET_BIP32,
            pubKeyHash: 0x71,
            scriptHash: 0xc4,
            wif: 0xf1,
            coinType: 1,
        },
        regtest: {
            messagePrefix: DOGE_MESSAGE,
            bech32: 'rdoge',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
            coinType: 1,
        },
    },
};
export const PEPE = {
    chain: 'PEPE',
    defaults: {
        satPerByte: 3000,
        dustRelayTxFee: 10000000,
        moduleStorageType: 'multisig',
    },
    features: { segwit: true, taproot: false, mweb: false },
    networks: {
        mainnet: {
            messagePrefix: PEPE_MESSAGE,
            bech32: 'pepe',
            bip32: DOGE_MAINNET_BIP32,
            pubKeyHash: 0x38,
            scriptHash: 0x16,
            wif: 0x9e,
            coinType: 3434,
        },
        testnet: {
            messagePrefix: PEPE_MESSAGE,
            bech32: 'tpepe',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x71,
            scriptHash: 0xc4,
            wif: 0xf1,
            coinType: 1,
        },
        regtest: {
            messagePrefix: PEPE_MESSAGE,
            bech32: 'rpepe',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
            coinType: 1,
        },
    },
};
export const WOJAK = {
    chain: 'WOJAK',
    defaults: {
        satPerByte: 2,
        dustRelayTxFee: 3000,
        moduleStorageType: 'multisig',
    },
    features: { segwit: true, taproot: false, mweb: false },
    networks: {
        mainnet: {
            messagePrefix: WOJAK_MESSAGE,
            // Dummy prefix: WojakCoin mainnet/testnet do not enable taproot/bech32.
            bech32: 'wojak',
            bip32: MAINNET_BIP32,
            pubKeyHash: 0x49,
            scriptHash: 0x05,
            wif: 0xc9,
            coinType: 20760,
        },
        testnet: {
            messagePrefix: WOJAK_MESSAGE,
            bech32: 'twojak',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
            coinType: 1,
        },
        regtest: {
            messagePrefix: WOJAK_MESSAGE,
            bech32: 'rwojak',
            bip32: TESTNET_BIP32,
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
            coinType: 1,
            features: { taproot: true },
            defaults: { moduleStorageType: 'taproot' },
        },
    },
};
export const BUILTIN_CONFIGS = [LTC, BTC, DOGE, PEPE, WOJAK];
