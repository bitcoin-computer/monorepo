import * as types from './types.js';
const { typeforce } = types;
import * as varuint from 'varuint-bitcoin';
export { varuint };
import { Buffer } from 'buffer';

function verifuint(value: bigint, max: bigint): void {
  if (value < 0n)
    throw new Error('specified a negative value for writing an unsigned value');
  if (value > max) throw new Error('RangeError: value out of range');
}

export function readUInt64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64LE(offset);
}

export function writeUInt64LE(
  buffer: Buffer,
  value: bigint,
  offset: number,
): number {
  verifuint(value, 0xffffffffffffffffn);
  buffer.writeBigUInt64LE(BigInt(value), offset);
  return offset + 8;
}

export function reverseBuffer(buffer: Buffer): Buffer {
  if (buffer.length < 1) return buffer;
  const reversedBuffer = Buffer.alloc(buffer.length);

  let j = buffer.length - 1;
  for (let i = 0; i < buffer.length; i++) {
    reversedBuffer[i] = buffer[j];
    j--;
  }

  return reversedBuffer;
}

export function cloneBuffer(buffer: Buffer): Buffer {
  const clone = Buffer.allocUnsafe(buffer.length);
  buffer.copy(clone);
  return clone;
}

/**
 * Helper class for serialization of bitcoin data types into a pre-allocated buffer.
 */
export class BufferWriter {
  static withCapacity(size: number): BufferWriter {
    return new BufferWriter(Buffer.alloc(size));
  }

  constructor(
    public buffer: Buffer,
    public offset: number = 0,
  ) {
    typeforce(types.tuple(types.Buffer, types.UInt32), [buffer, offset]);
  }

  writeUInt8(i: number): void {
    this.offset = this.buffer.writeUInt8(i, this.offset);
  }

  writeInt32(i: number): void {
    this.offset = this.buffer.writeInt32LE(i, this.offset);
  }

  writeUInt32(i: number): void {
    this.offset = this.buffer.writeUInt32LE(i, this.offset);
  }

  writeUInt64(i: bigint): void {
    this.offset = writeUInt64LE(this.buffer, i, this.offset);
  }

  writeVarInt(i: number): void {
    varuint.encode(i, this.buffer, this.offset);
    this.offset += varuint.encode.bytes;
  }

  writeSlice(slice: Buffer): void {
    if (this.buffer.length < this.offset + slice.length) {
      throw new Error('Cannot write slice out of bounds');
    }
    this.offset += slice.copy(this.buffer, this.offset);
  }

  writeVarSlice(slice: Buffer): void {
    this.writeVarInt(slice.length);
    this.writeSlice(slice);
  }

  writeVector(vector: Buffer[]): void {
    this.writeVarInt(vector.length);
    vector.forEach((buf: Buffer) => this.writeVarSlice(buf));
  }

  end(): Buffer {
    if (this.buffer.length === this.offset) {
      return this.buffer;
    }
    throw new Error(`buffer size ${this.buffer.length}, offset ${this.offset}`);
  }
}

/**
 * Helper class for reading of bitcoin data types from a buffer.
 */
export class BufferReader {
  constructor(
    public buffer: Buffer,
    public offset: number = 0,
  ) {
    typeforce(types.tuple(types.Buffer, types.UInt32), [buffer, offset]);
  }

  readUInt8(): number {
    const result = this.buffer.readUInt8(this.offset);
    this.offset++;
    return result;
  }

  readInt32(): number {
    const result = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return result;
  }

  readUInt32(): number {
    const result = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return result;
  }

  readUInt64(): bigint {
    const result = readUInt64LE(this.buffer, this.offset);
    this.offset += 8;
    return result;
  }

  readVarInt(): number {
    const vi = varuint.decode(this.buffer, this.offset);
    this.offset += varuint.decode.bytes;
    return vi;
  }

  readSlice(n: number): Buffer {
    if (this.buffer.length < this.offset + n) {
      throw new Error('Cannot read slice out of bounds');
    }
    const result = this.buffer.slice(this.offset, this.offset + n);
    this.offset += n;
    return result;
  }

  readVarSlice(): Buffer {
    return this.readSlice(this.readVarInt());
  }

  readVector(): Buffer[] {
    const count = this.readVarInt();
    const vector: Buffer[] = [];
    for (let i = 0; i < count; i++) vector.push(this.readVarSlice());
    return vector;
  }
}
