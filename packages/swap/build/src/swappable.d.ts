import { NFT } from '@bitcoin-computer/TBC721';
import type { Contract } from '@bitcoin-computer/lib/contract-env';
declare const Contract: Contract;
export declare class Swappable extends Contract {
    name: string;
    artist: string;
    _id: string;
    _rev: string;
    _root: string;
    _owners: string[];
    constructor(name?: string, symbol?: string);
    transfer(to: string): void;
    swap(that: NFT): void;
}
export {};
