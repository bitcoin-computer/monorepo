/// <reference types="node" />
/// <reference types="node" />
import { OPS } from './ops.js';
import { Network } from './networks.js';
import { Stack } from './payments/index.js';
import * as scriptNumber from './script_number.js';
import * as scriptSignature from './script_signature.js';
import { Buffer } from 'buffer';
export { OPS };
export declare function isPushOnly(value: Stack): boolean;
export declare function countNonPushOnlyOPs(value: Stack): number;
export declare function compile(chunks: Buffer | Stack): Buffer;
export declare function decompile(buffer: Buffer | Array<number | Buffer>): Array<number | Buffer> | null;
export declare function toASM(chunks: Buffer | Array<number | Buffer>): string;
export declare function fromASM(asm: string): Buffer;
export declare function fromPublicKey(publicKey: Buffer, type: string, network?: Network): Buffer;
export declare function toStack(chunks: Buffer | Array<number | Buffer>): Buffer[];
export declare function isCanonicalPubKey(buffer: Buffer): boolean;
export declare function isDefinedHashType(hashType: number): boolean;
export declare function isCanonicalScriptSignature(buffer: Buffer): boolean;
export declare const number: typeof scriptNumber;
export declare const signature: typeof scriptSignature;
