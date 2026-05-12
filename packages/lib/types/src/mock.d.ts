import { IdString, RevString, RootString, TxId } from './types';
export declare const mockTxId: TxId;
export declare const mockedRev: () => RevString;
export declare class Mock {
    _id: IdString;
    _rev: RevString;
    _root: RootString;
    _satoshis: bigint;
    _owners: string | string[];
    [key: string]: unknown;
    constructor(opts?: any);
}
