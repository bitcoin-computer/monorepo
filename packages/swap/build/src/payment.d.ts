export declare class Payment extends Contract {
    _id: string;
    _rev: string;
    _root: string;
    _satoshis: bigint;
    _owners: string[];
    constructor(_satoshis: bigint);
    transfer(to: string): void;
    setSatoshis(a: bigint): void;
}
export declare class PaymentMock {
    _id: string;
    _rev: string;
    _root: string;
    _satoshis: bigint;
    _owners: string[];
    constructor(satoshis: bigint);
    transfer(to: string): void;
    setSatoshis(a: bigint): void;
}
export declare class PaymentHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createPaymentTx(satoshis: bigint): Promise<any>;
    getPayment(paymentTxId: string): Promise<Payment>;
}
