import { Signer } from './psbt.js';
import { Buffer } from 'buffer';
export interface Output {
    script: Buffer;
    value: bigint;
}
export interface NumberOutput {
    script: Buffer;
    value: number;
}
export interface Input {
    hash: Buffer;
    index: number;
    script: Buffer;
    sequence: number;
    witness: Buffer[];
}
export declare class Transaction {
    static readonly DEFAULT_SEQUENCE = 4294967295;
    static readonly SIGHASH_DEFAULT = 0;
    static readonly SIGHASH_ALL = 1;
    static readonly SIGHASH_NONE = 2;
    static readonly SIGHASH_SINGLE = 3;
    static readonly SIGHASH_ANYONECANPAY = 128;
    static readonly SIGHASH_OUTPUT_MASK = 3;
    static readonly SIGHASH_INPUT_MASK = 128;
    static readonly ADVANCED_TRANSACTION_MARKER = 0;
    static readonly ADVANCED_TRANSACTION_FLAG = 1;
    ins: Input[];
    outs: Output[];
    version: number;
    locktime: number;
    static fromBuffer(buffer: Buffer, _NO_STRICT?: boolean): Transaction;
    static fromHex(hex: string): Transaction;
    static isCoinbaseHash(buffer: Buffer): boolean;
    isCoinbase(): boolean;
    addInput(hash: Buffer, index: number, sequence?: number, scriptSig?: Buffer): number;
    updateInput(inputIndex: number, opts: {
        hash?: Buffer;
        txId?: string;
        index?: number;
        sequence?: number;
        scriptSig?: Buffer;
        witness?: Buffer;
    }): void;
    addOutput(scriptPubKey: Buffer, value: bigint): number;
    updateOutput(outputIndex: number, opts: {
        scriptPubKey?: Buffer;
        value?: bigint;
    }): void;
    hasWitnesses(): boolean;
    weight(): number;
    virtualSize(): number;
    byteLength(_ALLOW_WITNESS?: boolean): number;
    clone(): Transaction;
    sign(inIndex: number, keyPair: Signer, sighashType: number, prevOutScript: Buffer): this;
    /**
     * Hash transaction for signing a specific input.
     *
     * Bitcoin uses a different hash for each signed transaction input.
     * This method copies the transaction, makes the necessary changes based on the
     * hashType, and then hashes the result.
     * This hash can then be used to sign the provided transaction input.
     */
    hashForSignature(inIndex: number, prevOutScript: Buffer, hashType: number): Buffer;
    hashForWitnessV1(inIndex: number, prevOutScripts: Buffer[], values: number[], hashType: number, leafHash?: Buffer, annex?: Buffer): Buffer;
    hashForWitnessV0(inIndex: number, prevOutScript: Buffer, value: number, hashType: number): Buffer;
    getHash(forWitness?: boolean): Buffer;
    getId(): string;
    toBuffer(buffer?: Buffer, initialOffset?: number): Buffer;
    toHex(): string;
    setInputScript(index: number, scriptSig: Buffer): void;
    setWitness(index: number, witness: Buffer[]): void;
    private __toBuffer;
    serialize(): string;
    static deserialize(s: string): Transaction;
    getInRevs(): string[];
}
