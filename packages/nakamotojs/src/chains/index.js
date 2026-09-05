import { BUILTIN_CONFIGS } from './builtins.js';
import { registerChain } from './registry.js';
for (const config of BUILTIN_CONFIGS) {
    registerChain(config, { builtin: true });
}
export { BUILTIN_CHAINS } from './registry.js';
export { registerChain, getChainConfig, getNetworkConfig, listSupportedChains, isBuiltinChain, } from './registry.js';
export { ADVANCED_TX_FLAG_OFFSET, ADVANCED_TX_MARKER_OFFSET, ADVANCED_TX_MARKER, MWEB_ADVANCED_TX_FLAG, MWEB_WITNESS_PROGRAM_FLAG, isMwebTxHex, skipAdvancedTx, skipTxsAtHeight, getParsingPolicy, shouldParseTransaction, shouldIndexTransaction, } from './parsing.js';
export { getCoinType, getBip44Path, getPath } from './coin.js';
