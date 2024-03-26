declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Payment extends Contract {
    _id: string;
    _rev: string;
    _root: string;
    _amount: number;
    _owners: string[];
    constructor(owner: string, _amount: number);
    transfer(to: string): void;
}
export declare class PaymentMock {
    _id: string;
    _rev: string;
    _root: string;
    _amount: number;
    _owners: string[];
    constructor(owner: string, amount: number);
    transfer(to: string): void;
}
export {};
