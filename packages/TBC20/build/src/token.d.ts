export declare class Token extends Contract {
    amount: number;
    name: string;
    symbol: string;
    _owners: string[];
    constructor(to: string, amount: number, name: string, symbol?: string);
    transfer(to: string, amount?: number): Token | null;
}
export interface ITBC20 {
    deploy(): Promise<string>;
    mint(publicKey: string, amount: number, name: string, symbol: string): Promise<string>;
    totalSupply(root: string): Promise<number>;
    balanceOf(publicKey: string, root: string): Promise<number>;
    transfer(to: string, amount: number, root: string): Promise<void>;
}
export declare class TBC20 implements ITBC20 {
    name: string;
    symbol: string;
    computer: any;
    mod: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    mint(publicKey: string, amount: number, name: string, symbol: string): Promise<string | undefined>;
    totalSupply(root: string): Promise<number>;
    private getBags;
    balanceOf(publicKey: string, root: string): Promise<number>;
    transfer(to: string, amount: number, root: string): Promise<void>;
}
