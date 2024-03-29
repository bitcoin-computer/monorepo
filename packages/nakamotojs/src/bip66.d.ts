/// <reference types="node" />
import { Buffer } from 'buffer';
export declare function check(buffer: Buffer): boolean;
export declare function decode(buffer: Buffer): {
    r: Buffer;
    s: Buffer;
};
export declare function encode(r: Buffer, s: Buffer): Buffer;
