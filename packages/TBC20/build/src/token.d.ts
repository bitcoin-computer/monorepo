import { Contract } from '@bitcoin-computer/lib';
export declare class Token extends Contract {
    amount: bigint;
    name: string;
    symbol: string;
    _owners: string[];
    constructor(to: string, amount: bigint, name: string, symbol?: string);
    transfer(to: string, amount?: bigint): Token | undefined;
    burn(): void;
    merge(tokens: Token[]): void;
}
export interface ITBC20 {
    deploy(): Promise<string>;
    mint(publicKey: string, amount: bigint, name: string, symbol: string): Promise<string>;
    totalSupply(root: string): Promise<bigint>;
    balanceOf(publicKey: string, root: string): Promise<bigint>;
    transfer(to: string, amount: bigint, root: string): Promise<void>;
}
export declare class TokenHelper implements ITBC20 {
    name: string;
    symbol: string;
    computer: any;
    mod: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    mint(publicKey: string, amount: bigint, name: string, symbol: string): Promise<string | undefined>;
    totalSupply(root: string): Promise<bigint>;
    private getBags;
    balanceOf(publicKey: string, root: string): Promise<bigint>;
    transfer(to: string, amount: bigint, root: string): Promise<void>;
}
