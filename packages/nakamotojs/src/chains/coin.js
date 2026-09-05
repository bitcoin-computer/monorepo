import { getNetworkConfig } from './registry.js';
/** BIP44 coin type. Testnet/regtest are 1. BCH is a stub; */
export function getCoinType(chain, network) {
    return getNetworkConfig(chain, network).coinType;
}
export function getBip44Path({ purpose = 44, coinType = 1, account = 0, } = {}) {
    return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`;
}
export function getPath({ chain, network, }) {
    return getBip44Path({ coinType: getCoinType(chain, network) });
}
