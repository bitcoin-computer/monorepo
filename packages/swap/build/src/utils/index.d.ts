export declare const getMockedRev: () => string;
export declare const RLTC: {
    network: 'regtest';
    chain: 'LTC';
    url: string;
};
export declare const meta: {
    _id: (x: any) => x is string;
    _rev: (x: any) => x is string;
    _root: (x: any) => x is string;
    _owners: (x: any) => x is any[];
    _amount: (x: any) => x is bigint;
};
