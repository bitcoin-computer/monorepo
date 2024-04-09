declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class NFT extends Contract {
    name: string;
    symbol: string;
    _id: string;
    _rev: string;
    _root: string;
    _owners: string[];
    constructor(name?: string, symbol?: string);
    transfer(to: string): void;
}
export interface ITBC721 {
    deploy(): Promise<string>;
    mint(name: string, symbol: string): Promise<NFT>;
    balanceOf(publicKey: string): Promise<number>;
    ownersOf(tokenId: string): Promise<string[]>;
    transfer(to: string, tokenId: string): Promise<void>;
}
export declare class TBC721 implements ITBC721 {
    computer: any;
    mod: string | undefined;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    mint(name: string, symbol: string): Promise<NFT>;
    balanceOf(publicKey: string): Promise<number>;
    ownersOf(tokenId: string): Promise<string[]>;
    transfer(to: string, tokenId: string): Promise<void>;
}
export {};
