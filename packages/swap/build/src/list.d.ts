import type { Contract } from '@bitcoin-computer/lib/contract-env';
declare const Contract: Contract;
export declare class List extends Contract {
    elements: string[];
    constructor();
    add(key: string): void;
    delete(key: string): void;
}
export declare class ListHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
}
export {};
