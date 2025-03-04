import { _Transaction } from './utils.js';
export declare function parseParams(method: string, params: string): any[];
export declare class RegtestClient {
    nativeRpcClient: any;
    constructor();
    faucet(address: string, value: number): Promise<{
        txId: string;
        vout: number;
        height: number;
        satoshis: number;
    }>;
    mine(count: number): Promise<any>;
    broadcast(txHex: string): Promise<string>;
    getTx(txId: string): Promise<_Transaction>;
    verify(txo: {
        txId: string;
        vout: number;
        address?: string;
        satoshis?: number;
    }): Promise<void>;
    height(): Promise<number>;
    faucetScript(script: Buffer, value: number): Promise<{
        txId: string;
        vout: number;
        height: number;
        satoshis: number;
    }>;
}
