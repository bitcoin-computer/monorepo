import { Network } from '../networks.js';
import { Taptree } from '../types.js';
import { p2data as embed } from './embed.js';
import { p2ms } from './p2ms.js';
import { p2pk } from './p2pk.js';
import { p2pkh } from './p2pkh.js';
import { p2sh } from './p2sh.js';
import { p2wpkh } from './p2wpkh.js';
import { p2wsh } from './p2wsh.js';
import { p2tr } from './p2tr.js';
import { Buffer } from 'buffer';

export interface Payment {
  name?: string;
  network?: Network;
  output?: Buffer;
  data?: Buffer[];
  m?: number;
  n?: number;
  pubkeys?: Buffer[];
  input?: Buffer;
  signatures?: Buffer[];
  internalPubkey?: Buffer;
  pubkey?: Buffer;
  signature?: Buffer;
  address?: string;
  hash?: Buffer;
  redeem?: Payment;
  redeemVersion?: number;
  scriptTree?: Taptree;
  witness?: Buffer[];
}

export type PaymentCreator = (a: Payment, opts?: PaymentOpts) => Payment;

export type PaymentFunction = () => Payment;

export interface PaymentOpts {
  validate?: boolean;
  allowIncomplete?: boolean;
}

export type StackElement = Buffer | number;
export type Stack = StackElement[];
export type StackFunction = () => Stack;

export { embed, p2ms, p2pk, p2pkh, p2sh, p2wpkh, p2wsh, p2tr };

// TODO
// witness commitment
