declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Payment extends Contract {
    _id: string;
    _rev: string;
    _root: string;
    _amount: number;
    _owners: string[];
    constructor(_amount: number);
    transfer(to: string): void;
    setAmount(a: number): void;
}
export declare class PaymentMock {
    _id: string;
    _rev: string;
    _root: string;
    _amount: number;
    _owners: string[];
    constructor(amount: number);
    transfer(to: string): void;
    setAmount(a: number): void;
}
export {};
