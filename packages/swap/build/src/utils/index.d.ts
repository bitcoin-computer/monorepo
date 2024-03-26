export declare function getTestTxId(i?: number): string;
export declare function getTestRev(txId?: number, outNum?: number): string;
export declare const RLTC: {
    network: 'regtest';
    chain: 'LTC';
    url: string;
};
export declare const meta: {
    _id: (x: any) => boolean;
    _rev: (x: any) => boolean;
    _root: (x: any) => boolean;
    _owners: (x: any) => boolean;
    _amount: (x: any) => boolean;
};
