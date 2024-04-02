declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Valuable extends Contract {
    _id: string;
    _rev: string;
    _root: string;
    _amount: number;
    _owners: string[];
    setAmount(amount: number): void;
}
export declare class ValuableMock {
    _id: string;
    _rev: string;
    _root: string;
    _amount: number;
    _owners: string[];
    constructor();
    setAmount(amount: number): void;
}
export {};
