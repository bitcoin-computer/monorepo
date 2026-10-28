/** BIP44 coin type. Testnet/regtest are 1. BCH is a stub; */
export declare function getCoinType(chain: string, network: string): number;
export declare function getBip44Path({ purpose, coinType, account, }?: {
    purpose?: number;
    coinType?: number;
    account?: number;
}): string;
export declare function getPath({ chain, network, }: {
    chain: string;
    network: string;
}): string;
