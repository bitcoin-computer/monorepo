/// <reference types="node" />
import { Buffer } from 'buffer';
export declare function decode(buffer: Buffer, maxLength?: number, minimal?: boolean): number;
export declare function encode(_number: number): Buffer;
