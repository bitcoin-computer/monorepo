import { Contract } from '@bitcoin-computer/lib';
export type TBC20ConstructorParams = {
    to: string;
    amount: bigint;
    name: string;
    symbol?: string;
    [s: string]: unknown;
};
export declare class TBC20 extends Contract {
    amount: bigint;
    name: string;
    symbol: string;
    _owners: string[];
    get root(): string;
    constructor(params: TBC20ConstructorParams);
    transfer(to: string, amount?: bigint): this;
    protected _createTransferToken(to: string, amount: bigint): this;
    burn(): void;
    merge(tokens: TBC20[]): void;
}
export interface ITBC20 {
    deploy(): Promise<string>;
    mint(publicKey: string, amount: bigint, name: string, symbol: string): Promise<string>;
    totalSupply(root: string): Promise<bigint>;
    balanceOf(publicKey: string, root: string): Promise<bigint>;
    transfer(to: string, amount: bigint, root: string): Promise<void>;
}
export declare class TBC20Helper implements ITBC20 {
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
