import * as varuint from 'bip174/src/lib/converter/varint.js';
import { PartialSig, PsbtInput } from 'bip174/src/lib/interfaces.js';
import * as bscript from '../script.js';
import { Transaction } from '../transaction.js';
import { hash160 } from '../crypto.js';
import {
  p2ms,
  p2pk,
  p2pkh,
  p2wpkh,
  p2wsh,
  p2sh,
  p2tr,
} from '../payments/index.js';
import { Buffer } from 'buffer';

function isPaymentFactory(payment: any): (script: Buffer) => boolean {
  return (script: Buffer): boolean => {
    try {
      payment({ output: script });
      return true;
    } catch (err) {
      return false;
    }
  };
}
export const isP2MS = isPaymentFactory(p2ms);
export const isP2PK = isPaymentFactory(p2pk);
export const isP2PKH = isPaymentFactory(p2pkh);
export const isP2WPKH = isPaymentFactory(p2wpkh);
export const isP2WSHScript = isPaymentFactory(p2wsh);
export const isP2SHScript = isPaymentFactory(p2sh);
export const isP2TR = isPaymentFactory(p2tr);

export function witnessStackToScriptWitness(witness: Buffer[]): Buffer {
  let buffer = Buffer.allocUnsafe(0);

  function writeSlice(slice: Buffer): void {
    buffer = Buffer.concat([buffer, Buffer.from(slice)]);
  }

  function writeVarInt(i: number): void {
    const currentLen = buffer.length;
    const varintLen = varuint.encodingLength(i);

    buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
    varuint.encode(i, buffer, currentLen);
  }

  function writeVarSlice(slice: Buffer): void {
    writeVarInt(slice.length);
    writeSlice(slice);
  }

  function writeVector(vector: Buffer[]): void {
    writeVarInt(vector.length);
    vector.forEach(writeVarSlice);
  }

  writeVector(witness);

  return buffer;
}

export function pubkeyPositionInScript(pubkey: Buffer, script: Buffer): number {
  const pubkeyHash = hash160(pubkey);
  const pubkeyXOnly = pubkey.slice(1, 33); // slice before calling?

  const decompiled = bscript.decompile(script);
  if (decompiled === null) throw new Error('Unknown script error');

  return decompiled.findIndex(element => {
    if (typeof element === 'number') return false;
    return (
      element.equals(pubkey) ||
      element.equals(pubkeyHash) ||
      element.equals(pubkeyXOnly)
    );
  });
}

export function pubkeyInScript(pubkey: Buffer, script: Buffer): boolean {
  return pubkeyPositionInScript(pubkey, script) !== -1;
}

export function checkInputForSig(input: PsbtInput, action: string): boolean {
  const pSigs = extractPartialSigs(input);
  return pSigs.some(pSig =>
    signatureBlocksAction(pSig, bscript.signature.decode, action),
  );
}

type SignatureDecodeFunc = (buffer: Buffer) => {
  signature: Buffer;
  hashType: number;
};
export function signatureBlocksAction(
  signature: Buffer,
  signatureDecodeFn: SignatureDecodeFunc,
  action: string,
): boolean {
  const { hashType } = signatureDecodeFn(signature);
  const whitelist: string[] = [];
  const isAnyoneCanPay = hashType & Transaction.SIGHASH_ANYONECANPAY;
  if (isAnyoneCanPay) whitelist.push('addInput');
  const hashMod = hashType & 0x1f;
  switch (hashMod) {
    case Transaction.SIGHASH_ALL:
      break;
    case Transaction.SIGHASH_SINGLE:
    case Transaction.SIGHASH_NONE:
      whitelist.push('addOutput');
      whitelist.push('setInputSequence');
      break;
  }
  if (whitelist.indexOf(action) === -1) {
    return true;
  }
  return false;
}

function extractPartialSigs(input: PsbtInput): Buffer[] {
  let pSigs: PartialSig[] = [];
  if ((input.partialSig || []).length === 0) {
    if (!input.finalScriptSig && !input.finalScriptWitness) return [];
    pSigs = getPsigsFromInputFinalScripts(input);
  } else {
    pSigs = input.partialSig!;
  }
  return pSigs.map(p => p.signature);
}

function getPsigsFromInputFinalScripts(input: PsbtInput): PartialSig[] {
  const scriptItems = !input.finalScriptSig
    ? []
    : bscript.decompile(input.finalScriptSig) || [];
  const witnessItems = !input.finalScriptWitness
    ? []
    : bscript.decompile(input.finalScriptWitness) || [];
  return scriptItems
    .concat(witnessItems)
    .filter(item => {
      return Buffer.isBuffer(item) && bscript.isCanonicalScriptSignature(item);
    })
    .map(sig => ({ signature: sig })) as PartialSig[];
}
