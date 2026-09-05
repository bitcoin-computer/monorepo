const registry = new Map();
const builtins = new Set();
const resolvedCache = new Map();
const ILLEGAL_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const CHAIN_ID = /^[A-Z][A-Z0-9]*$/;
const NETWORKS = ['mainnet', 'testnet', 'regtest'];
const HOOK_KEYS = new Set(['shouldParse', 'shouldIndex']);
function isHookPath(path, key) {
    return path.endsWith('parsing') && HOOK_KEYS.has(key);
}
function assertPlainData(value, path) {
    if (typeof value === 'function') {
        throw new Error(`Chain config must be pure data (function at ${path})`);
    }
    if (value === null || typeof value !== 'object')
        return;
    if (Array.isArray(value)) {
        value.forEach((item, i) => assertPlainData(item, `${path}[${i}]`));
        return;
    }
    for (const key of Object.keys(value)) {
        if (ILLEGAL_KEYS.has(key)) {
            throw new Error(`Illegal key "${key}" in chain config at ${path}`);
        }
        if (isHookPath(path, key)) {
            if (typeof value[key] !== 'function') {
                throw new Error(`Chain config ${path}.${key} must be a function`);
            }
            continue;
        }
        assertPlainData(value[key], path ? `${path}.${key}` : key);
    }
}
function clonePlain(value, path = '') {
    assertPlainData(value, path);
    if (value === null || typeof value !== 'object')
        return value;
    if (Array.isArray(value)) {
        return value.map((item, i) => clonePlain(item, `${path}[${i}]`));
    }
    const out = {};
    for (const key of Object.keys(value)) {
        const childPath = path ? `${path}.${key}` : key;
        const child = value[key];
        if (isHookPath(path, key)) {
            out[key] = child;
            continue;
        }
        out[key] = clonePlain(child, childPath);
    }
    return out;
}
function deepFreeze(value) {
    if (value === null ||
        typeof value !== 'object' ||
        Object.isFrozen(value) ||
        typeof value === 'function') {
        return value;
    }
    Object.freeze(value);
    if (Array.isArray(value)) {
        value.forEach(item => deepFreeze(item));
        return value;
    }
    for (const key of Object.keys(value)) {
        deepFreeze(value[key]);
    }
    return value;
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function expectNumber(value, path) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Chain config ${path} must be a finite number`);
    }
    return value;
}
function expectString(value, path) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`Chain config ${path} must be a non-empty string`);
    }
    return value;
}
function validateParsing(parsing, path) {
    if (parsing === undefined)
        return;
    if (!isRecord(parsing)) {
        throw new Error(`Chain config ${path} must be an object`);
    }
    if (parsing.shouldParse !== undefined &&
        typeof parsing.shouldParse !== 'function') {
        throw new Error(`Chain config ${path}.shouldParse must be a function`);
    }
    if (parsing.shouldIndex !== undefined &&
        typeof parsing.shouldIndex !== 'function') {
        throw new Error(`Chain config ${path}.shouldIndex must be a function`);
    }
}
function validateNetworkConfig(network, path) {
    if (!isRecord(network)) {
        throw new Error(`Chain config ${path} must be an object`);
    }
    expectString(network.messagePrefix, `${path}.messagePrefix`);
    if (network.bech32 !== undefined) {
        expectString(network.bech32, `${path}.bech32`);
    }
    if (!isRecord(network.bip32)) {
        throw new Error(`Chain config ${path}.bip32 must be an object`);
    }
    expectNumber(network.bip32.public, `${path}.bip32.public`);
    expectNumber(network.bip32.private, `${path}.bip32.private`);
    expectNumber(network.pubKeyHash, `${path}.pubKeyHash`);
    expectNumber(network.scriptHash, `${path}.scriptHash`);
    expectNumber(network.wif, `${path}.wif`);
    expectNumber(network.coinType, `${path}.coinType`);
    if (network.defaults !== undefined) {
        if (!isRecord(network.defaults)) {
            throw new Error(`Chain config ${path}.defaults must be an object`);
        }
        if (network.defaults.moduleStorageType !== undefined &&
            network.defaults.moduleStorageType !== 'taproot' &&
            network.defaults.moduleStorageType !== 'multisig') {
            throw new Error(`Chain config ${path}.defaults.moduleStorageType must be 'taproot' or 'multisig'`);
        }
    }
    validateParsing(network.parsing, `${path}.parsing`);
}
function validateChainConfig(config) {
    if (!isRecord(config)) {
        throw new Error('Chain config must be an object');
    }
    const chain = expectString(config.chain, 'chain');
    if (!CHAIN_ID.test(chain)) {
        throw new Error(`Chain id "${chain}" must be uppercase alphanumeric (e.g. BTC, LTC, WOJAK)`);
    }
    if (!isRecord(config.defaults)) {
        throw new Error('Chain config defaults must be an object');
    }
    expectNumber(config.defaults.satPerByte, 'defaults.satPerByte');
    expectNumber(config.defaults.dustRelayTxFee, 'defaults.dustRelayTxFee');
    if (config.defaults.moduleStorageType !== 'taproot' &&
        config.defaults.moduleStorageType !== 'multisig') {
        throw new Error("Chain config defaults.moduleStorageType must be 'taproot' or 'multisig'");
    }
    if (!isRecord(config.networks)) {
        throw new Error('Chain config networks must be an object');
    }
    for (const name of NETWORKS) {
        validateNetworkConfig(config.networks[name], `networks.${name}`);
    }
}
/**
 * Register a chain. Config data is cloned and frozen. `parsing.shouldParse`
 * / `shouldIndex` are trusted TypeScript functions (never JSON / eval).
 * Built-ins cannot be overridden.
 */
export function registerChain(config, options = {}) {
    const cloned = clonePlain(config);
    validateChainConfig(cloned);
    const chain = cloned.chain;
    if (registry.has(chain)) {
        throw new Error(builtins.has(chain)
            ? `Cannot override built-in chain ${chain}`
            : `Chain ${chain} is already registered`);
    }
    if (options.builtin)
        builtins.add(chain);
    registry.set(chain, deepFreeze(cloned));
}
export function getChainConfig(chain) {
    const config = registry.get(chain);
    if (!config) {
        throw new Error(`Invalid chain ${chain}. Supported: ${listSupportedChains().join(', ')}`);
    }
    return config;
}
export function listSupportedChains() {
    return Array.from(registry.keys());
}
export function isBuiltinChain(chain) {
    return builtins.has(chain);
}
function mergeDefaults(chainDefaults, networkDefaults) {
    return {
        ...chainDefaults,
        ...networkDefaults,
    };
}
export function getNetworkConfig(chain, network) {
    const key = `${chain}:${network}`;
    const cached = resolvedCache.get(key);
    if (cached)
        return cached;
    if (network !== 'mainnet' && network !== 'testnet' && network !== 'regtest') {
        throw new Error(`Invalid network ${network}`);
    }
    const config = getChainConfig(chain);
    const net = config.networks[network];
    const resolved = {
        chain,
        network,
        messagePrefix: net.messagePrefix,
        bech32: net.bech32,
        bip32: net.bip32,
        pubKeyHash: net.pubKeyHash,
        scriptHash: net.scriptHash,
        wif: net.wif,
        coinType: net.coinType,
        defaults: mergeDefaults(config.defaults, net.defaults),
        features: {
            segwit: net.features?.segwit ?? config.features?.segwit ?? false,
            taproot: net.features?.taproot ?? config.features?.taproot ?? false,
            mweb: net.features?.mweb ?? config.features?.mweb ?? false,
        },
        parsing: net.parsing,
    };
    resolvedCache.set(key, Object.freeze(resolved));
    return resolved;
}
