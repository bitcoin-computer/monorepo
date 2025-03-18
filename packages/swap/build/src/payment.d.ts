export declare class Payment extends Contract {
    _id: string;
    _rev: string;
    _root: string;
    _amount: bigint;
    _owners: string[];
    constructor(_amount: bigint);
    transfer(to: string): void;
    setAmount(a: bigint): void;
}
export declare class PaymentMock {
    _id: string;
    _rev: string;
    _root: string;
    _amount: bigint;
    _owners: string[];
    constructor(amount: bigint);
    transfer(to: string): void;
    setAmount(a: bigint): void;
}
export declare class PaymentHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createPaymentTx(amount: bigint): Promise<any>;
    getPayment(paymentTxId: string): Promise<Payment>;
}
