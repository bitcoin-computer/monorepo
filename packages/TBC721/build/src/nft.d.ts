import { SmartContract } from '@bitcoin-computer/lib';
import type { Contract } from '@bitcoin-computer/lib/contract-env';
declare const Contract: Contract;
export declare class NFT extends Contract {
    name: string;
    artist: string;
    url: string;
    offerTxRev: string;
    constructor(name?: string, artist?: string, url?: string);
    transfer(to: any): void;
    list(rev: any): void;
    unlist(): void;
}
export interface ITBC721 {
    deploy(): Promise<string>;
    mint(name: string, artist: string, url: string): Promise<NFT>;
    balanceOf(publicKey: string): Promise<number>;
    ownersOf(tokenId: string): Promise<string[]>;
    transfer(to: string, tokenId: string): Promise<void>;
}
export declare class NftHelper implements ITBC721 {
    computer: any;
    mod: string | undefined;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    mint(name: string, artist: string, url: string): Promise<SmartContract<typeof NFT>>;
    balanceOf(publicKey: string): Promise<number>;
    ownersOf(tokenId: string): Promise<string[]>;
    transfer(to: string, tokenId: string): Promise<void>;
}
export {};
