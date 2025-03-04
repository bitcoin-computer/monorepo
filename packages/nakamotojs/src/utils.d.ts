export declare function getRandomAddress(network?: import("./networks.js").Network): string;
export interface _Transaction {
    txId: string;
    txHex: string;
    vsize: number;
    version: number;
    locktime: number;
    ins: _Input[];
    outs: _Output[];
}
export interface _Input {
    txId: string;
    vout: number;
    script: string;
    sequence: string;
}
export interface _Output {
    value: number;
    script: string;
    address?: string;
}
export declare const rpcJSON2CB: (tx: any) => _Transaction;
