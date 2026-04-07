import {bufferUtils as $9PVwI$bufferUtils, Transaction as $9PVwI$Transaction, opcodes as $9PVwI$opcodes, script as $9PVwI$script, payments as $9PVwI$payments, networks as $9PVwI$networks, crypto as $9PVwI$crypto, address as $9PVwI$address, Psbt as $9PVwI$Psbt, initEccLib as $9PVwI$initEccLib, bip371 as $9PVwI$bip371} from "@bitcoin-computer/nakamotojs";
import {Buffer as $9PVwI$Buffer} from "buffer";
import {generateMnemonic as $9PVwI$generateMnemonic, mnemonicToSeedSync as $9PVwI$mnemonicToSeedSync, validateMnemonic as $9PVwI$validateMnemonic} from "bip39";
import * as $9PVwI$bitcoincomputersecp256k1 from "@bitcoin-computer/secp256k1";
import {BIP32Factory as $9PVwI$BIP32Factory} from "bip32";
import $9PVwI$elliptic from "elliptic";
import $9PVwI$process from "process";
import {EventSource as $9PVwI$EventSource} from "eventsource";
import $9PVwI$largeset from "large-set";
import {parse as $9PVwI$parse} from "@babel/parser";
import {ECPairFactory as $9PVwI$ECPairFactory} from "ecpair";
import $9PVwI$axios from "axios";
import "ses";
import {backOff as $9PVwI$backOff} from "exponential-backoff";
import {ECIES_CONFIG as $9PVwI$ECIES_CONFIG, encrypt as $9PVwI$encrypt, decrypt as $9PVwI$decrypt} from "eciesjs";
import {webcrypto as $9PVwI$webcrypto} from "crypto";
import {StaticModuleRecord as $9PVwI$StaticModuleRecord} from "@endo/static-module-record";


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $e1e9e2b9d71bc2d8$exports = {};

$parcel$export($e1e9e2b9d71bc2d8$exports, "Computer", () => $5897c693dfcff079$export$2454fd0de010f4bb, (v) => $5897c693dfcff079$export$2454fd0de010f4bb = v);
$parcel$export($e1e9e2b9d71bc2d8$exports, "Mock", () => $70710ac8a001306b$export$2a766bd177c54dd, (v) => $70710ac8a001306b$export$2a766bd177c54dd = v);
$parcel$export($e1e9e2b9d71bc2d8$exports, "Transaction", () => $4b62a469f572a3c6$export$febc5573c75cefb0, (v) => $4b62a469f572a3c6$export$febc5573c75cefb0 = v);
$parcel$export($e1e9e2b9d71bc2d8$exports, "precise", () => $d205febb791b53ee$export$bbf2ffbffa00b288, (v) => $d205febb791b53ee$export$bbf2ffbffa00b288 = v);
$parcel$export($e1e9e2b9d71bc2d8$exports, "lifted", () => $d205febb791b53ee$export$57b7f3bf07321492, (v) => $d205febb791b53ee$export$57b7f3bf07321492 = v);









const $bd5ff9060a235dd4$export$6b7d953c9668b0b6 = parseInt(process.env.BC_SCRIPT_CHUNK_SIZE || '', 10) || 479;
const $bd5ff9060a235dd4$export$965ba7d812c66aa4 = 475 // in bytes
;
const $bd5ff9060a235dd4$export$1035b0570451c823 = '';
const $bd5ff9060a235dd4$export$9c80b82d32647b78 = 'p2pkh';
const $bd5ff9060a235dd4$export$14096f3be8a46637 = 30000 // in Kb, 30 satoshis per byte
;
const $bd5ff9060a235dd4$export$1e7ef728e2683d27 = 3000 // in Kb, 3 satoshis per byte
;
const $bd5ff9060a235dd4$export$e7e3d18e730436b6 = 10000000 // in Kb, 1000 satoshis per byte
;
const $bd5ff9060a235dd4$export$c32d443dbb2eda37 = 10000000 // in Kb, 1000 satoshis per byte
;
const $bd5ff9060a235dd4$export$925a05c4b96b2744 = 3;
const $bd5ff9060a235dd4$export$4266a5deb789e6a0 = 20;
const $bd5ff9060a235dd4$export$b00b425fffc1d558 = 3;
const $bd5ff9060a235dd4$export$bb38fdd194d4373f = 2;
const $bd5ff9060a235dd4$export$13e1a04b9affc983 = 2;
const $bd5ff9060a235dd4$export$e1763572af4d7bad = 3000;
const $bd5ff9060a235dd4$export$50e187a9fd923b2a = 3000;
const $bd5ff9060a235dd4$export$4bc394cb084a3624 = 4;
const $bd5ff9060a235dd4$export$7dc90d32bceb5ea5 = '0x50';
const $bd5ff9060a235dd4$export$43182d2709f4c8de = 'ord';
const $bd5ff9060a235dd4$export$280d845b0ed37876 = 520;
const $bd5ff9060a235dd4$export$a1be5b5a5ff3a4a1 = 1 // 1% of allowed error
;
const $bd5ff9060a235dd4$export$986c012ad4b59cfe = 71 // 37 bytes for the script and 34 bytes for the spendable public key
;
const $bd5ff9060a235dd4$export$b3bf7f8ed07f5d46 = 20;
const $bd5ff9060a235dd4$export$30dc5b6bafe2f74 = [
    'satoshis',
    'asm',
    'exp',
    'mod',
    'publicKey'
];


const $70710ac8a001306b$export$e89b5b69fd27457c = '0'.repeat(64);
const $70710ac8a001306b$export$ecc1d4b757948754 = ()=>`${$70710ac8a001306b$export$e89b5b69fd27457c}:0`;
class $70710ac8a001306b$export$2a766bd177c54dd {
    constructor(opts = {}){
        const rev = $70710ac8a001306b$export$ecc1d4b757948754();
        Object.entries(opts).forEach(([key, value])=>{
            if (![
                '_id',
                '_rev',
                '_root'
            ].includes(key)) this[key] = value;
        });
    }
}


// @ts-ignore (elliptic has no types; runtime behavior unchanged)
const $303220cf0debbf6c$var$ec = $9PVwI$elliptic.ec('secp256k1');
const $303220cf0debbf6c$var$bip32 = (0, $9PVwI$BIP32Factory)($9PVwI$bitcoincomputersecp256k1);
function $303220cf0debbf6c$export$c194c5a73880e96f(obj) {
    return JSON.stringify(obj, (_key, value)=>typeof value === 'bigint' ? value.toString() + 'n' : value);
}
function $303220cf0debbf6c$export$ea99c62adecc85ae(str) {
    return JSON.parse(str, (_key, value)=>{
        if (typeof value === 'string' && /^\d+n$/.test(value)) return BigInt(value.slice(0, -1));
        return value;
    });
}
function $303220cf0debbf6c$export$f08f4d51349c691f(string) {
    return Buffer.from(string).toString('hex');
}
function $303220cf0debbf6c$export$52324db6daaca2e1(hex) {
    return Buffer.from(hex, 'hex').toString().replace(/\0/g, '');
}
function $303220cf0debbf6c$export$522325fb116d804e(s, fromBase, toBase) {
    if (s.length * Math.log2(fromBase) > 53) throw new Error(`Input too large ${s.length} ${Math.log2(fromBase)}`);
    if (![
        2,
        10,
        16
    ].includes(fromBase) || ![
        2,
        10,
        16
    ].includes(toBase)) throw new Error('ToBase or FromBase invalid in covertNumber.');
    if (fromBase === 2 && s.length % 8 !== 0) throw new Error('Binary strings must be byte aligned.');
    if (fromBase === 16 && s.length % 2 !== 0) throw new Error('Hex strings must be of even length.');
    const unPaddedRes = parseInt(s, fromBase).toString(toBase);
    if (toBase === 2) return unPaddedRes.padStart(8 * Math.ceil(unPaddedRes.length / 8), '0');
    if (toBase === 16) return unPaddedRes.padStart(2 * Math.ceil(unPaddedRes.length / 2), '0');
    return unPaddedRes;
}
function $303220cf0debbf6c$export$416b7890be9acca6(s, n) {
    const regExp = new RegExp(`.{1,${n}}`, 'g');
    return s.match(regExp) || [];
}
function $303220cf0debbf6c$export$f922ebe57f2c36e8(array, n) {
    const res = [];
    for(let i = 0; i < array.length; i += n)res.push(array.slice(i, i + n));
    return res;
}
function $303220cf0debbf6c$export$b3ab84721822b8ab(str, size) {
    const chunks = [];
    let index = 0;
    while(index < str.length){
        chunks.push(str.slice(index, index + size));
        index += size;
    }
    return chunks;
}
function $303220cf0debbf6c$export$8d4c4429581146c2(s) {
    return $303220cf0debbf6c$export$416b7890be9acca6(s, 2).map((n)=>$303220cf0debbf6c$export$522325fb116d804e(n, 16, 2)).join('');
}
function $303220cf0debbf6c$export$48bc0de5bc199606(s) {
    return $303220cf0debbf6c$export$416b7890be9acca6(s, 8).map((n)=>$303220cf0debbf6c$export$522325fb116d804e(n, 2, 16)).join('');
}
function $303220cf0debbf6c$export$c5ff7c6cb12f5f46(bin, n) {
    return bin.slice(n) + bin.slice(0, n);
}
function $303220cf0debbf6c$export$b8ff662d454dbe46(bin, n) {
    return bin.slice(-n) + bin.slice(0, -n);
}
function $303220cf0debbf6c$export$68538d2c6856b285(hex) {
    if (hex.length !== 62) throw new Error('Input to hexToPublicKey must be of length 62');
    let success = false;
    let rotations = 0;
    let point;
    while(!success){
        if (rotations >= 256) throw new Error('Something went wrong storing data');
        const counterHex = rotations.toString(16).padStart(2, '0');
        const bin = $303220cf0debbf6c$export$8d4c4429581146c2(hex);
        const padded = bin.padStart(64, '0');
        const rotated = $303220cf0debbf6c$export$c5ff7c6cb12f5f46(padded, rotations);
        const rotatedHex = $303220cf0debbf6c$export$48bc0de5bc199606(rotated);
        const xHex = counterHex + rotatedHex;
        try {
            point = $303220cf0debbf6c$var$ec.curve.pointFromX(xHex, false);
            success = true;
        } catch (err) {
            rotations += 1;
        }
    }
    if (!point) throw new Error('Something went wrong storing data');
    return Buffer.from(point.encodeCompressed());
}
function $303220cf0debbf6c$export$cfd9a51138473022(buff) {
    const point = $303220cf0debbf6c$var$ec.curve.decodePoint(buff);
    const x = point.getX();
    const xHex = x.toString('hex').padStart(64, '0');
    const counterHex = xHex.slice(0, 2);
    const counter = $303220cf0debbf6c$export$522325fb116d804e(counterHex, 16, 10);
    const rotations = parseInt(counter, 10);
    const rotatedData = xHex.slice(2);
    return $303220cf0debbf6c$export$48bc0de5bc199606($303220cf0debbf6c$export$b8ff662d454dbe46($303220cf0debbf6c$export$8d4c4429581146c2(rotatedData), rotations));
}
function $303220cf0debbf6c$export$de754bb4cdcc210c(chain, network) {
    switch(chain){
        case 'BTC':
            switch(network){
                case 'mainnet':
                    return (0, $9PVwI$networks).bitcoin;
                case 'testnet':
                    return (0, $9PVwI$networks).testnet;
                case 'regtest':
                    return (0, $9PVwI$networks).regtest;
                default:
                    throw new Error(`Invalid network ${network}`);
            }
        case 'LTC':
            switch(network){
                case 'mainnet':
                    return (0, $9PVwI$networks).litecoin;
                case 'testnet':
                    return (0, $9PVwI$networks).litecointestnet;
                case 'regtest':
                    return (0, $9PVwI$networks).litecoinregtest;
                default:
                    throw new Error(`Invalid network ${network}`);
            }
        case 'PEPE':
            switch(network){
                case 'mainnet':
                    return (0, $9PVwI$networks).pepecoin;
                case 'testnet':
                    return (0, $9PVwI$networks).pepecointestnet;
                case 'regtest':
                    return (0, $9PVwI$networks).pepecoinregtest;
                default:
                    throw new Error(`Invalid network ${network}`);
            }
        case 'DOGE':
            switch(network){
                case 'mainnet':
                    return (0, $9PVwI$networks).dogecoin;
                case 'testnet':
                    return (0, $9PVwI$networks).dogecointestnet;
                case 'regtest':
                    return (0, $9PVwI$networks).dogecoinregtest;
                default:
                    throw new Error(`Invalid network ${network}`);
            }
        default:
            throw new Error(`Invalid chain ${network}`);
    }
}
function $303220cf0debbf6c$export$23109f16a8a07245(chain, network) {
    const n = $303220cf0debbf6c$export$de754bb4cdcc210c(chain, network);
    if (n.bech32 === 'bc') return 0;
    if (n.bech32 === 'bcrt') return 1;
    if (n.bech32 === 'tb') return 1;
    if (n.bech32 === 'ltc') return 2;
    if (n.bech32 === 'rltc') return 1;
    if (n.bech32 === 'tltc') return 1;
    if (n.bech32 === 'doge') return 3;
    if (n.bech32 === 'rdoge') return 1;
    if (n.bech32 === 'tdoge') return 1;
    if (n.bech32 === 'bch') return 145;
    if (n.bech32 === 'tbch') return 1;
    if (n.bech32 === 'bsv') return 236;
    if (n.bech32 === 'tbsv') return 1;
    if (n.bech32 === 'pepe') return 3434;
    if (n.bech32 === 'rpepe') return 1;
    if (n.bech32 === 'tpepe') return 1;
    throw new Error(`Unsupported chain ${chain} or network ${network}`);
}
function $303220cf0debbf6c$export$e59691a2f8406773({ purpose: purpose = 44, coinType: coinType = 1, account: account = 0 } = {}) {
    return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`;
}
function $303220cf0debbf6c$export$2aa3fd96c49a84a8({ chain: chain, network: network }) {
    return $303220cf0debbf6c$export$e59691a2f8406773({
        coinType: $303220cf0debbf6c$export$23109f16a8a07245(chain, network)
    });
}
function $303220cf0debbf6c$export$c6922c1d7db6c3a3() {
    return Math.round(Math.random() * 2 ** 31);
}
function $303220cf0debbf6c$export$99014ca06cc45eae({ chain: chain, network: network, account: account = $303220cf0debbf6c$export$c6922c1d7db6c3a3() }) {
    return $303220cf0debbf6c$export$e59691a2f8406773({
        account: account,
        coinType: $303220cf0debbf6c$export$23109f16a8a07245(chain, network)
    });
}
function $303220cf0debbf6c$export$448332262467e042(_array) {
    const array = _array;
    for(let i = array.length - 1; i > 0; i -= 1){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [
            array[j],
            array[i]
        ];
    }
}
function $303220cf0debbf6c$export$accea06471c18a5a({ mnemonic: mnemonic = $9PVwI$generateMnemonic(), path: path, passphrase: passphrase = (0, $bd5ff9060a235dd4$export$1035b0570451c823), networkObj: networkObj = (0, $9PVwI$networks).litecoinregtest }) {
    const seed = $9PVwI$mnemonicToSeedSync(mnemonic, passphrase);
    const rootKey = $303220cf0debbf6c$var$bip32.fromSeed(seed, networkObj);
    return rootKey.derivePath(path);
}
function $303220cf0debbf6c$export$ec70ee4fa0462cba(outId) {
    return /^[0-9A-Fa-f]{64}:\d+$/.test(outId);
}
const $303220cf0debbf6c$export$1ef33362739af9d6 = (rev)=>typeof rev === 'string' && rev.startsWith((0, $70710ac8a001306b$export$e89b5b69fd27457c));
function $303220cf0debbf6c$export$b02a40aff8e4ad18(rev) {
    return /^[0-9a-fA-F]+$/.test(rev);
}
function $303220cf0debbf6c$export$bafbdc92027712dd(rev) {
    const parsed = $303220cf0debbf6c$export$caebc656d3686561(rev);
    return parsed.txId === (0, $70710ac8a001306b$export$e89b5b69fd27457c);
}
function $303220cf0debbf6c$export$61ac08182746c02(outId) {
    return $303220cf0debbf6c$export$caebc656d3686561(outId);
}
function $303220cf0debbf6c$export$caebc656d3686561(outId) {
    const txId = outId.slice(0, 64);
    const index = outId.slice(65);
    const outputIndex = Number(index);
    if (!$303220cf0debbf6c$export$e99f72af86782de5(txId) || !$303220cf0debbf6c$export$5ead30270c363bef(index)) throw new Error(`Invalid Rev: ${outId}`);
    return {
        txId: txId,
        outputIndex: outputIndex
    };
}
function $303220cf0debbf6c$export$4a99dfb24923098f(outId) {
    return $303220cf0debbf6c$export$caebc656d3686561(outId).outputIndex;
}
const $303220cf0debbf6c$export$21c1b1d63f43cbc9 = (spec)=>spec.startsWith('./') || spec.startsWith('../') || spec === '.' || spec === '..';
function $303220cf0debbf6c$export$8c6326f453a62d26(str, base) {
    let length;
    if (str.length % base !== 0) {
        const div = str.length / base;
        length = Math.ceil(div) * base;
    }
    return str.padStart(length, '0');
}
const $303220cf0debbf6c$export$b29f828819edca8d = (arr)=>(p)=>{
        const hits = [];
        const misses = [];
        for(let i = 0; i < arr.length; i += 1)if (p(arr[i])) hits.push(arr[i]);
        else misses.push(arr[i]);
        return {
            hits: hits,
            misses: misses
        };
    };
const $303220cf0debbf6c$export$7efc99439b8625a3 = (a, b, eq)=>a.length === b.length && eq ? a.every((el, i)=>eq(el, b[i])) : a.every((el, i)=>el === b[i]);
const $303220cf0debbf6c$export$dfcec05bb7372a54 = (arr1, arr2)=>{
    if (arr1 === arr2) return true;
    if (arr1 === undefined || arr2 === undefined) return false;
    if (Array.isArray(arr1) && Array.isArray(arr2)) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index)=>$303220cf0debbf6c$export$dfcec05bb7372a54(val, arr2[index]));
    }
    return arr1 === arr2;
};
const $303220cf0debbf6c$export$fb9431c544c373fd = (arr)=>{
    if (!arr.length) return true;
    const base = arr[0];
    return !arr.some((nestedArr)=>!$303220cf0debbf6c$export$dfcec05bb7372a54(nestedArr, base));
};
const $303220cf0debbf6c$export$e1b97b9ec89505f2 = (a, b)=>{
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;
        for(let i = 0; i < aKeys.length; i += 1){
            if (!$303220cf0debbf6c$export$e1b97b9ec89505f2(a[aKeys[i]], b[bKeys[i]])) return false;
        }
        return true;
    }
    return false;
};
function $303220cf0debbf6c$export$d2e5b9bef5e6777f(network = $303220cf0debbf6c$export$de754bb4cdcc210c('LTC', 'regtest')) {
    const { publicKey: pubkey } = $303220cf0debbf6c$export$accea06471c18a5a({
        path: "m/0'/0/0"
    });
    const { address: address } = (0, $9PVwI$payments).p2pkh({
        network: network,
        pubkey: pubkey
    });
    if (address) return address;
    throw new Error('Cannot generate address');
}
function $303220cf0debbf6c$export$c7f1cd04a579dcb2(arr) {
    return new Set(arr).size !== arr.length;
}
function $303220cf0debbf6c$export$577f793df735f4a1(hex) {
    return (0, $9PVwI$bufferUtils).reverseBuffer(Buffer.from(hex, 'hex')).toString('hex');
}
const $303220cf0debbf6c$export$8901015135f2fb22 = (a, b)=>a.map((k, i)=>[
            k,
            b[i]
        ]);
function $303220cf0debbf6c$var$isPaymentFactory(payment) {
    return (script)=>{
        try {
            payment({
                output: script
            });
            return true;
        } catch (err) {
            return false;
        }
    };
}
const $303220cf0debbf6c$export$21625ed8ad4ab25d = $303220cf0debbf6c$var$isPaymentFactory((0, $9PVwI$payments).p2ms);
const $303220cf0debbf6c$export$a96262a09506768c = $303220cf0debbf6c$var$isPaymentFactory((0, $9PVwI$payments).p2pk);
const $303220cf0debbf6c$export$7dcbe7f0626e3014 = $303220cf0debbf6c$var$isPaymentFactory((0, $9PVwI$payments).p2pkh);
const $303220cf0debbf6c$export$bd929334ced3153 = $303220cf0debbf6c$var$isPaymentFactory((0, $9PVwI$payments).p2wpkh);
const $303220cf0debbf6c$export$af499a4a5a71ec3e = $303220cf0debbf6c$var$isPaymentFactory((0, $9PVwI$payments).p2wsh);
const $303220cf0debbf6c$export$a4b0e5333b216d09 = $303220cf0debbf6c$var$isPaymentFactory((0, $9PVwI$payments).p2sh);
const $303220cf0debbf6c$export$66cb47e2971c7e0d = $303220cf0debbf6c$var$isPaymentFactory((0, $9PVwI$payments).p2tr);
const $303220cf0debbf6c$export$971dd5b0dfd021b6 = (s1, s2)=>{
    const result = new Set(s1);
    Array.from(s2).forEach((value)=>result.add(value));
    return result;
};
const $303220cf0debbf6c$export$acaf96a27438246b = (s1, s2)=>{
    const result = new Set();
    Array.from(s1).forEach((value)=>{
        if (!s2.has(value)) result.add(value);
    });
    return result;
};
const $303220cf0debbf6c$export$4e09c449d6c407f7 = typeof window !== 'undefined';
const $303220cf0debbf6c$export$8ee0fc9ee280b4ee = typeof window === 'undefined' && typeof (0, $9PVwI$process) !== 'undefined' && (0, $9PVwI$process).release?.name === 'node';
const $303220cf0debbf6c$export$9e1ab59d9104db40 = typeof window !== 'undefined' && window.crossOriginIsolated && 'measureUserAgentSpecificMemory' in performance;
const $303220cf0debbf6c$export$1dfa7dc02383b1f4 = (rev)=>{
    if (!rev) return rev;
    if (rev.length < 25) return rev.slice(0, 7);
    return `${rev.split(':')[0].slice(0, 5)}:${rev.split(':')[1]}`;
};
function $303220cf0debbf6c$export$b48ee232557adc37(json) {
    try {
        return JSON.parse(json);
    } catch  {
        return null;
    }
}
function $303220cf0debbf6c$export$76f8b5ba27b3a9fe(obj) {
    if (typeof obj === 'string' && /^\d+$/.test(obj)) return BigInt(obj);
    if (obj && typeof obj === 'object') Object.keys(obj).forEach((key)=>{
        obj[key] = $303220cf0debbf6c$export$76f8b5ba27b3a9fe(obj[key]);
    });
    return obj;
}
function $303220cf0debbf6c$export$1d83dc0e0ca25b94(arr, elem) {
    const result = [];
    for(let i = 0; i < arr.length; i += 2)if (i + 1 < arr.length) result.push(arr[i], arr[i + 1], elem);
    else result.push(arr[i], elem);
    return result;
}
function $303220cf0debbf6c$export$9c34db760fe2f782(arr) {
    const result = [];
    let i = 0;
    while(i + 2 < arr.length){
        result.push(arr[i]);
        result.push(arr[i + 1]);
        i += 3;
    }
    if (i < arr.length) result.push(arr[i]);
    return result;
}
const $303220cf0debbf6c$export$9e77c25b2b272d02 = (currentNode)=>Object.keys(currentNode.pointers).map((key)=>currentNode.pointers[key]).filter((successor)=>successor !== null);
const $303220cf0debbf6c$export$2ba85e47198b647a = (obj)=>{
    if (typeof obj !== 'object' || obj === null) return [];
    return Object.values(obj).filter((v)=>typeof v === 'object' && v !== null);
};
function $303220cf0debbf6c$export$f402e1d983f479af(starts, getNeighbors = $303220cf0debbf6c$export$9e77c25b2b272d02, shouldAdd = ()=>true) {
    const visited = new Set();
    const stack = [];
    for(let i = starts.length - 1; i >= 0; i--)stack.push(starts[i]);
    while(stack.length > 0){
        const current = stack.pop();
        if (visited.has(current)) continue;
        visited.add(current);
        const neighbors = getNeighbors(current);
        for(let i = neighbors.length - 1; i >= 0; i--){
            const neighbor = neighbors[i];
            if (!visited.has(neighbor) && shouldAdd(neighbor)) stack.push(neighbor);
        }
    }
    return visited;
}
function $303220cf0debbf6c$export$8f528bb63005ed51(starts, getNeighbors = $303220cf0debbf6c$export$9e77c25b2b272d02) {
    const order = [];
    const visited = new Set();
    const stack = [];
    for(let i = starts.length - 1; i >= 0; i--)stack.push(starts[i]);
    while(stack.length > 0){
        const current = stack.pop();
        if (visited.has(current)) continue;
        visited.add(current);
        order.push(current);
        const neighbors = getNeighbors(current);
        for(let i = neighbors.length - 1; i >= 0; i--){
            const neighbor = neighbors[i];
            if (!visited.has(neighbor)) stack.push(neighbor);
        }
    }
    return order;
}
const $303220cf0debbf6c$export$6850e3f48372183d = (obj)=>{
    const revs = new Set();
    for (const node of $303220cf0debbf6c$export$f402e1d983f479af([
        obj
    ], $303220cf0debbf6c$export$2ba85e47198b647a))if (node && typeof node === 'object' && '_rev' in node && typeof node._rev === 'string') revs.add(node._rev);
    return revs;
};
const $303220cf0debbf6c$export$289be3649a9a0728 = (obj)=>JSON.stringify(obj, (_, v)=>typeof v === 'bigint' ? `${v}n` : v, 2);
const $303220cf0debbf6c$export$30615ddea23ba3c1 = (char)=>char >= '0' && char <= '9' || char >= 'a' && char <= 'f' || char >= 'A' && char <= 'F';
function $303220cf0debbf6c$export$e99f72af86782de5(value) {
    if (value.length !== 64) return false;
    for(let i = 0; i < 64; i++)if (!$303220cf0debbf6c$export$30615ddea23ba3c1(value.charAt(i))) return false;
    return true;
}
function $303220cf0debbf6c$export$5ead30270c363bef(suffix) {
    if (suffix.length === 0) return false;
    const num = parseInt(suffix, 10);
    return num >= 0 && suffix === num.toString();
}
function $303220cf0debbf6c$export$5becd68e26dd69b4(value) {
    if (!$303220cf0debbf6c$export$e99f72af86782de5(value)) throw new Error(`Invalid TxId.`);
    return value;
}
function $303220cf0debbf6c$export$5cfec14803f412e5(value) {
    if (value.length < 66 || value.charAt(64) !== ':') throw new Error(`Invalid Rev.`);
    if (!$303220cf0debbf6c$export$e99f72af86782de5(value.slice(0, 64)) || !$303220cf0debbf6c$export$5ead30270c363bef(value.slice(65))) throw new Error(`Invalid Rev.`);
    return value;
}
function $303220cf0debbf6c$export$5c74a82dce3394d5(rev) {
    return rev.slice(0, 64);
}
function $303220cf0debbf6c$export$6d0757a710f60a30(value) {
    return $303220cf0debbf6c$export$e99f72af86782de5(value);
}
function $303220cf0debbf6c$export$d146d9996ff2e97(value) {
    if (value.length < 66 || value.charAt(64) !== ':') return false;
    return $303220cf0debbf6c$export$e99f72af86782de5(value.slice(0, 64)) && $303220cf0debbf6c$export$5ead30270c363bef(value.slice(65));
}
function $303220cf0debbf6c$export$d601b1a5af9dd5dc(root, key, value) {
    if (typeof root === 'object' && root !== null && key in root && root[key] === value) return root;
    if (typeof root === 'object' && root !== null) for (const val of Object.values(root)){
        const sub = $303220cf0debbf6c$export$d601b1a5af9dd5dc(val, key, value);
        if (sub !== undefined) return sub;
    }
    return undefined;
}
function $303220cf0debbf6c$export$b7d58db314e0ac27(obj, seen = new WeakMap()) {
    if (obj === null || typeof obj !== 'object') return obj // Primitives and BigInt (immutable) are returned as-is
    ;
    if (seen.has(obj)) return seen.get(obj) // Handle cycles
    ;
    if (Array.isArray(obj)) {
        const clone = [];
        seen.set(obj, clone);
        for(let i = 0; i < obj.length; i++)clone[i] = $303220cf0debbf6c$export$b7d58db314e0ac27(obj[i], seen);
        return clone;
    }
    if (typeof obj === 'bigint') return obj; // BigInt is immutable, safe to return directly
    // For plain objects
    const clone = {};
    seen.set(obj, clone);
    for (const key of Object.keys(obj))clone[key] = $303220cf0debbf6c$export$b7d58db314e0ac27(obj[key], seen);
    return clone;
}



function $8636fd77165bd4bc$export$36e2e7bece17a772(bufs) {
    const script = [
        (0, $9PVwI$opcodes).OP_1,
        ...bufs,
        (0, $9PVwI$opcodes)[`OP_${bufs.length}`],
        (0, $9PVwI$opcodes).OP_CHECKMULTISIG
    ];
    return (0, $9PVwI$script).compile(script);
}
function $8636fd77165bd4bc$export$c57aaaec237cdb23(script) {
    const stack = (0, $9PVwI$script).decompile(script);
    return stack?.filter((c)=>(0, $9PVwI$Buffer).isBuffer(c));
}
function $8636fd77165bd4bc$export$f490c5e7d585a370(script) {
    return $8636fd77165bd4bc$export$c57aaaec237cdb23(script).map((p)=>p.toString('hex'));
}
function $8636fd77165bd4bc$export$a295b4f1f291e064(script) {
    if ((0, $303220cf0debbf6c$export$21625ed8ad4ab25d)(script)) return $8636fd77165bd4bc$export$f490c5e7d585a370(script);
    if ((0, $303220cf0debbf6c$export$a4b0e5333b216d09)(script)) return (0, $9PVwI$script).toASM(script);
    throw new Error('Unsupported script');
}
function $8636fd77165bd4bc$export$a5c5ced73e99851c(publicKeys) {
    if (publicKeys.length - 1 > (0, $bd5ff9060a235dd4$export$925a05c4b96b2744)) throw new Error('Too many owners');
    return $8636fd77165bd4bc$export$36e2e7bece17a772(publicKeys);
}
function $8636fd77165bd4bc$export$26c3669e0bc5ae0e(dataString, bcdbPk) {
    const dataHex = (0, $303220cf0debbf6c$export$f08f4d51349c691f)(dataString);
    const hexes = (0, $303220cf0debbf6c$export$416b7890be9acca6)(dataHex, 62);
    const paddedHexes = hexes.map((hex)=>hex.padEnd(62, '0'));
    const publicKeys = paddedHexes.map((0, $303220cf0debbf6c$export$68538d2c6856b285));
    const finalPubKeys = (0, $303220cf0debbf6c$export$1d83dc0e0ca25b94)(publicKeys, (0, $9PVwI$Buffer).from(bcdbPk, 'hex'));
    const chunkedPublicKeys = (0, $303220cf0debbf6c$export$f922ebe57f2c36e8)(finalPubKeys, (0, $bd5ff9060a235dd4$export$925a05c4b96b2744));
    return chunkedPublicKeys.map($8636fd77165bd4bc$export$a5c5ced73e99851c);
}
function $8636fd77165bd4bc$export$6a94e91b2ef1d7f1(scripts) {
    const publicKeys = scripts.flatMap($8636fd77165bd4bc$export$c57aaaec237cdb23);
    const finalPubKeys = (0, $303220cf0debbf6c$export$9c34db760fe2f782)(publicKeys);
    const hexes = finalPubKeys.map((0, $303220cf0debbf6c$export$cfd9a51138473022));
    const dataHex = hexes.map((0, $303220cf0debbf6c$export$52324db6daaca2e1));
    return dataHex.join('').replace(/\0+$/, '');
}
function $8636fd77165bd4bc$export$dbc681a96905b6fa(inputsLength, outputsLength, data, pubKey) {
    const dataScripts = $8636fd77165bd4bc$export$26c3669e0bc5ae0e(JSON.stringify(data), pubKey);
    const maxDataIndex = outputsLength + dataScripts.length;
    const ioDescriptor = [
        inputsLength,
        outputsLength,
        maxDataIndex,
        0
    ];
    const ioDescriptorScripts = $8636fd77165bd4bc$export$26c3669e0bc5ae0e(JSON.stringify(ioDescriptor), pubKey);
    return dataScripts.concat(ioDescriptorScripts);
}
const $8636fd77165bd4bc$export$50e49a79004f0f9 = (owners, restClient)=>{
    const { networkObj: networkObj } = restClient;
    const publicKeys = owners.sort().map((owner)=>(0, $9PVwI$Buffer).from(owner, 'hex'));
    const outputScript = $8636fd77165bd4bc$export$a5c5ced73e99851c(publicKeys);
    const payment = (0, $9PVwI$payments).p2ms({
        output: outputScript,
        network: networkObj
    });
    return payment.output;
};




class $4b62a469f572a3c6$export$febc5573c75cefb0 extends (0, $9PVwI$Transaction) {
    constructor({ ins: ins = [], outs: outs = [], version: version = 1, locktime: locktime = 0 } = {}){
        super();
        this.ins = ins;
        this.outs = outs;
        this.version = version;
        this.locktime = locktime;
    }
    get txId() {
        return this.getId();
    }
    get inputs() {
        return this.ins.map((input)=>`${(0, $303220cf0debbf6c$export$577f793df735f4a1)(input.hash)}:${input.index}`);
    }
    get ioDescriptor() {
        const candidates = this.outs.filter(({ script: script })=>script.length === (0, $bd5ff9060a235dd4$export$986c012ad4b59cfe));
        if (candidates.length === 0) return [];
        const { script: script } = candidates[candidates.length - 1];
        const string = $8636fd77165bd4bc$export$6a94e91b2ef1d7f1([
            script
        ]);
        return JSON.parse(string);
    }
    get ownerInputsLength() {
        return this.ioDescriptor[0] || 0;
    }
    get ownerOutputsLength() {
        return this.ioDescriptor[1] || 0;
    }
    get maxDataIndex() {
        return this.ioDescriptor[2] || 0;
    }
    get dataOutputs() {
        return this.outs.slice(this.ownerOutputsLength, this.maxDataIndex);
    }
    get ownerInputs() {
        return this.ins.slice(0, this.ownerInputsLength);
    }
    get ownerOutputs() {
        return this.outs.slice(0, this.ownerOutputsLength);
    }
    get inRevs() {
        return this.ownerInputs.map(({ hash: hash, index: index })=>`${(0, $303220cf0debbf6c$export$577f793df735f4a1)(hash)}:${index}`);
    }
    get outRevs() {
        return this.ownerOutputs.map((_, i)=>`${this.getId()}:${i}`);
    }
    get onChainMetaData() {
        try {
            return JSON.parse($8636fd77165bd4bc$export$6a94e91b2ef1d7f1(this.dataOutputs.map((o)=>o.script)));
        } catch  {
            return {};
        }
    }
    get ownerData() {
        try {
            return this.ownerOutputs.map(({ script: script, value: value })=>({
                    outScriptBuf: script,
                    _owners: $8636fd77165bd4bc$export$a295b4f1f291e064(script),
                    _satoshis: value
                }));
        } catch  {
            return [];
        }
    }
    get ioMap() {
        return this.onChainMetaData.ioMap;
    }
    get zip() {
        try {
            return this.outRevs.map((rev, i)=>[
                    this.inRevs[this.ioMap.indexOf(i)],
                    rev
                ]);
        } catch  {
            return [];
        }
    }
    spendFromData(inputRevs) {
        inputRevs.map((0, $303220cf0debbf6c$export$61ac08182746c02)).forEach(({ txId: txId, outputIndex: outputIndex })=>{
            const txHash = (0, $9PVwI$bufferUtils).reverseBuffer(Buffer.from(txId, 'hex'));
            this.addInput(txHash, Number(outputIndex));
        });
    }
    createDataOuts(ownerData, metaData, wallet) {
        const { ins: ins, outs: outs } = this;
        // Create owner outputs
        const dust = wallet.getDustThreshold(false);
        ownerData.forEach(({ outScriptBuf: outScriptBuf, _satoshis: _satoshis })=>{
            this.addOutput(outScriptBuf, _satoshis || BigInt(dust));
        });
        // Create data outputs
        const pubKey = wallet.getSpendablePublicKeys(wallet.chain, wallet.network);
        $8636fd77165bd4bc$export$dbc681a96905b6fa(ins.length, outs.length, metaData, pubKey).forEach((script)=>{
            this.addOutput(script, BigInt(wallet.getDustThreshold(false, script)));
        });
    }
    static fromBuffer(buffer) {
        const { ins: ins, outs: outs, version: version = 1, locktime: locktime = 0 } = super.fromBuffer(buffer);
        return new $4b62a469f572a3c6$export$febc5573c75cefb0({
            ins: ins,
            outs: outs,
            version: version,
            locktime: locktime
        });
    }
    static fromHex(hex) {
        const { ins: ins, outs: outs, version: version, locktime: locktime } = super.fromHex(hex);
        return new this({
            ins: ins,
            outs: outs,
            version: version,
            locktime: locktime
        });
    }
    static fromTransaction(tx) {
        return this.fromBuffer(tx.toBuffer()) // Using `this` to refer to the calling class
        ;
    }
    static async fromTxId({ txId: txId, restClient: restClient }) {
        const hex = await restClient.getRawTx(txId);
        return this.fromHex(hex);
    }
    clone() {
        return super.clone();
    }
    static deserialize(s) {
        return super.deserialize(s);
    }
}




/**
 * Per-instance admin mode context using a call stack. Guarantees correct
 * nested/re-entrant behavior and eliminates global mutable state.
 * @internal
 */ class $aec7dd200596fb2a$export$b4fb6f5c344ec334 {
    /** Returns true iff the current call is inside a _sudo block. */ get isAdmin() {
        // Peek at the top of the call stack. `stack.at(-1)` returns the most recent
        // admin state (true = inside _sudo). If the stack is empty (we are outside
        // any _sudo), `at(-1)` returns `undefined`, which we safely coerce to
        // `false` with the nullish coalescing operator.
        return this.stack.at(-1) ?? false;
    }
    /**
   * Executes `fn` with admin privileges.
   * Restores previous state even if `fn` throws.
   */ run(fn) {
        this.stack.push(true);
        try {
            return fn();
        } finally{
            this.stack.pop();
        }
    }
    constructor(){
        this.stack = [];
    }
}
const $aec7dd200596fb2a$var$defaultContext = new $aec7dd200596fb2a$export$b4fb6f5c344ec334();
const $aec7dd200596fb2a$export$62c0dd10c640417e = $aec7dd200596fb2a$var$defaultContext.run.bind($aec7dd200596fb2a$var$defaultContext);
const $aec7dd200596fb2a$export$fdc4f9968fbdadc6 = ()=>$aec7dd200596fb2a$var$defaultContext.isAdmin;


// =============================================================================
// types.ts
// =============================================================================
//
// Central Type System for Bitcoin Computer
//
// This file defines the complete, compile-time safe public API for smart
// contracts used by the Bitcoin Computer library.
//
// The key abstraction is `SmartContract<T>` — a covariant recursive type that
// automatically lifts every method of your contract class. The lifting rule
// (enforced everywhere by the type system) is:
//
//  * Original method: m(this: C, ...Ai) → R
//  * Lifted method: m(this: SmartContract<C>, ...SmartContract<Ai>) →
//    Promise<SmartContract<R>>
//
// Simple example:
//  * Original: transfer(to: string, amount: bigint): Token
//  * Lifted: transfer(to: string, amount: bigint):
//    Promise<SmartContract<Token>>
//
// Guarantees (all verified exhaustively in types.test.ts):
// * Deep structural exactness (`Exact<T>`) — no extra properties allowed at any
//   nesting level
// * Cycle-safe recursion termination via "Root unification" (nested Contract
//   subclasses collapse to the root SmartContract<Root> for safety)
// * Opt-in precise subclass narrowing via `precise<T>()` when you know the
//   concrete type
// * Full method lifting with correct `this` binding and exactly-one-Promise
//   normalization
// * Primitives, branded types, arrays (mutable + readonly), unions, optionals,
//   and higher-order functions are preserved exactly
//
// All objects returned by the runtime (db.get, .sync, etc.) are wrapped with
// dual-layer security proxies that enforce immutability, ownership, and
// persistence rules at runtime.
//
// =====================================================================

class $7677927c011cc208$export$ec44af2ea759766e extends (0, $9PVwI$largeset) {
    add(el) {
        return super.add(new WeakRef(el));
    }
    has(el) {
        for (const o of this){
            if (o == el) return true;
        }
        return false;
    }
    forEach(fn) {
        super.forEach((ref)=>{
            const value = ref.deref();
            if (value) fn(value);
        });
    }
    *[Symbol.iterator]() {
        for (const ref of super.values()){
            const value = ref.deref();
            if (value) yield value;
        }
    }
}


/**
 * A weak set that tracks recorded (wrapped) objects for security checks.
 * Uses IterableWeakSet to allow garbage collection of unreferenced objects
 * while supporting membership testing and iteration.
 * @internal
 */ const $fa96f8418385359b$var$RECORDED = new (0, $7677927c011cc208$export$ec44af2ea759766e)();
function $fa96f8418385359b$export$e16d8520af44a096(obj) {
    $fa96f8418385359b$var$RECORDED.add(obj);
}
function $fa96f8418385359b$export$141f8028a5c9b76(obj) {
    return $fa96f8418385359b$var$RECORDED.has(obj);
}


const $d205febb791b53ee$export$581775e22cfad3dd = Symbol('bitcoin-computer-brand');
const $d205febb791b53ee$export$3bb4a3f4a9646a6a = Symbol('proxy_tag');
const $d205febb791b53ee$export$accd2046ded63e63 = (s)=>s;
const $d205febb791b53ee$export$84eca18e6d832dd1 = (s)=>s;
const $d205febb791b53ee$export$e921403d8a9d6e3a = (s)=>s;
const $d205febb791b53ee$export$1c4cfbb3206db243 = (s)=>s;
const $d205febb791b53ee$export$f386daff7715d420 = (s)=>s;
const $d205febb791b53ee$export$55d63915149d1a5a = (s)=>s;
const $d205febb791b53ee$export$171aa6226884e6dd = (s)=>s;
const $d205febb791b53ee$export$b46cd0ecde2b93f9 = (s)=>s;
const $d205febb791b53ee$export$91df428ae0f97b5c = (s)=>s;
class $d205febb791b53ee$export$8517d80acf00e19a {
    constructor(..._args){
        this[$d205febb791b53ee$export$581775e22cfad3dd] = true;
    }
}
function $d205febb791b53ee$export$57b7f3bf07321492(target) {
    const cls = typeof target === 'function' ? target : target.constructor;
    return cls;
}
function $d205febb791b53ee$export$bbf2ffbffa00b288(value) {
    if (typeof value !== 'object' || value === null || !($d205febb791b53ee$export$581775e22cfad3dd in value)) throw new TypeError('precise(): Expected a Bitcoin Computer smart contract');
}
const $d205febb791b53ee$export$d3ed4458b2e585d7 = (a)=>typeof a === 'undefined';
const $d205febb791b53ee$export$790c68523f92292 = (a)=>a === null;
const $d205febb791b53ee$export$2284ee9d394f4548 = (a)=>typeof a === 'boolean';
const $d205febb791b53ee$export$33fe8de871cc903c = (a)=>typeof a === 'number';
const $d205febb791b53ee$export$abd67cc48e99962b = (a)=>typeof a === 'string';
const $d205febb791b53ee$export$80fa5093ff9816c7 = (a)=>typeof a === 'symbol';
const $d205febb791b53ee$export$46a6632a23ee1db0 = (a)=>typeof a === 'bigint';
const $d205febb791b53ee$export$e9a6cce0d6f25ebf = (a)=>$d205febb791b53ee$export$790c68523f92292(a) || $d205febb791b53ee$export$d3ed4458b2e585d7(a) || $d205febb791b53ee$export$33fe8de871cc903c(a) || $d205febb791b53ee$export$abd67cc48e99962b(a) || $d205febb791b53ee$export$2284ee9d394f4548(a) || $d205febb791b53ee$export$80fa5093ff9816c7(a) || $d205febb791b53ee$export$46a6632a23ee1db0(a);
const $d205febb791b53ee$export$fa675141bcde8cf8 = (a)=>Array.isArray(a);
const $d205febb791b53ee$export$70ac1a29dd7dda57 = (a)=>typeof a === 'object' && a !== null && !$d205febb791b53ee$export$fa675141bcde8cf8(a) && !$d205febb791b53ee$export$e9a6cce0d6f25ebf(a);
const $d205febb791b53ee$export$c6d8e8d5a86e0e9b = (v)=>typeof v === 'object' && v !== null && $d205febb791b53ee$export$581775e22cfad3dd in v && v[$d205febb791b53ee$export$581775e22cfad3dd] === true && '_rev' in v && typeof v._rev === 'string' && (0, $fa96f8418385359b$export$141f8028a5c9b76)(v);
const $d205febb791b53ee$export$d64eeacdafde4875 = (s)=>typeof s === 'string' && /^0[2-3][0-9a-f]{64}$/i.test(s);
function $d205febb791b53ee$export$18d65c6a1aeeaec7(obj) {
    return $d205febb791b53ee$export$70ac1a29dd7dda57(obj) && '_url' in obj;
}
function $d205febb791b53ee$export$691b4523c5340423(obj) {
    return $d205febb791b53ee$export$70ac1a29dd7dda57(obj) && '__cypher' in obj && '__secrets' in obj && 'ioMap' in obj;
}
const $d205febb791b53ee$export$e24fefae1ba28092 = (obj)=>$d205febb791b53ee$export$70ac1a29dd7dda57(obj) && '_rev' in obj && typeof obj._rev === 'string';
function $d205febb791b53ee$export$6d0757a710f60a30(value) {
    return /^[0-9a-fA-F]{64}$/.test(value);
}
function $d205febb791b53ee$export$d146d9996ff2e97(s) {
    return /^[0-9a-fA-F]{64}:[0-9]+$/.test(s);
}


const $74a26ef6d53e712a$export$72de43103e456aaf = (g)=>(obj)=>Object.fromEntries(Object.entries(obj).map(g));
const $74a26ef6d53e712a$export$58aefef1ff9edd34 = (f)=>(obj)=>{
        const props = $74a26ef6d53e712a$export$72de43103e456aaf(([k, v])=>[
                k,
                f(v)
            ]);
        const methods = Object.create(Object.getPrototypeOf(obj));
        return Object.assign(methods, props(obj));
    };
const $74a26ef6d53e712a$export$403a37b722c7ebfd = (g)=>(obj)=>Object.entries(obj).forEach(g);
const $74a26ef6d53e712a$export$ef29917380cf416a = (f)=>(obj)=>$74a26ef6d53e712a$export$403a37b722c7ebfd(([_, v])=>f(v))(obj);
const $74a26ef6d53e712a$export$48b95d5fd8dc5d0b = (g)=>(visited = [])=>(json)=>{
            if ((0, $d205febb791b53ee$export$e9a6cce0d6f25ebf)(json)) return;
            if ((0, $d205febb791b53ee$export$fa675141bcde8cf8)(json)) {
                json.forEach($74a26ef6d53e712a$export$48b95d5fd8dc5d0b(g)(visited));
                return;
            }
            if ((0, $d205febb791b53ee$export$70ac1a29dd7dda57)(json)) {
                if (visited.includes(json)) return;
                visited.push(json);
                g(json);
                $74a26ef6d53e712a$export$ef29917380cf416a($74a26ef6d53e712a$export$48b95d5fd8dc5d0b(g)(visited))(json);
            }
        };
const $74a26ef6d53e712a$export$a03aeae6a15ac053 = (leaf)=>(node)=>(visited = [])=>(x)=>{
                if ((0, $d205febb791b53ee$export$e9a6cce0d6f25ebf)(x)) return leaf(x);
                if ((0, $d205febb791b53ee$export$fa675141bcde8cf8)(x)) return node([
                    leaf(x),
                    ...x.flatMap($74a26ef6d53e712a$export$a03aeae6a15ac053(leaf)(node)(visited))
                ]);
                if ((0, $d205febb791b53ee$export$70ac1a29dd7dda57)(x)) {
                    if (visited.includes(x)) return leaf(x);
                    visited.push(x);
                    return node([
                        leaf(x),
                        ...Object.values(x).flatMap($74a26ef6d53e712a$export$a03aeae6a15ac053(leaf)(node)(visited))
                    ]);
                }
                throw new Error('Unsupported type');
            };
const $74a26ef6d53e712a$export$b63c9fd43d662403 = (predicate)=>(x)=>{
        const leaf = (y)=>predicate(y) ? [
                y
            ] : [];
        const node = (arr)=>arr.flat();
        return $74a26ef6d53e712a$export$a03aeae6a15ac053(leaf)(node)([])(x);
    };
// ==================== LEGACY HELPERS ====================
const $74a26ef6d53e712a$var$selectById = (id)=>(o)=>(0, $d205febb791b53ee$export$70ac1a29dd7dda57)(o) && '_id' in o && o._id === id;
const $74a26ef6d53e712a$export$c4d407c2cae5b6c0 = (env)=>(arg)=>{
        if (!(0, $d205febb791b53ee$export$70ac1a29dd7dda57)(arg) || !arg._id) return;
        const [fromEffect] = $74a26ef6d53e712a$export$b63c9fd43d662403($74a26ef6d53e712a$var$selectById(arg._id))(env);
        if (!fromEffect) return;
        (0, $aec7dd200596fb2a$export$62c0dd10c640417e)(()=>{
            Object.entries(fromEffect).forEach(([k, v])=>{
                arg[k] = v;
            });
        });
    };





const $9ca517853ec47831$var$cycleErrorMessage = 'Creating cyclic structures through the basic interface is not supported, please use "encode" instead.';
/**
 * Parses a basic JSON value into a literal suitable for insertion into generated JS code.
 */ const $9ca517853ec47831$var$parseJBasic = (val)=>{
    if ((0, $d205febb791b53ee$export$abd67cc48e99962b)(val)) return `'${val}'`;
    if ((0, $d205febb791b53ee$export$46a6632a23ee1db0)(val)) return `${val.toString()}n`;
    return `${val?.toString() ?? 'undefined'}`;
};
/**
 * Internal recursive serializer.
 * Uses a shared counter for deterministic temp variable names (__bc0__, __bc1__, ...).
 * Exactly matches original runtime behavior.
 */ const $9ca517853ec47831$var$_stringifyArgs = (arg, counterRef, tempToRev)=>{
    if ((0, $d205febb791b53ee$export$e9a6cce0d6f25ebf)(arg)) return {
        argString: $9ca517853ec47831$var$parseJBasic(arg),
        env: {}
    };
    if ((0, $d205febb791b53ee$export$70ac1a29dd7dda57)(arg)) {
        // Smart-contract reference → deterministic temp var
        if ((0, $d205febb791b53ee$export$e24fefae1ba28092)(arg) && (0, $d205febb791b53ee$export$d146d9996ff2e97)(arg._rev)) {
            const tempVar = `__bc${counterRef.count++}__`;
            tempToRev[tempVar] = arg._rev;
            return {
                argString: tempVar,
                env: {
                    [tempVar]: arg._rev
                }
            };
        }
        // Plain object
        const entries = Object.entries(arg).map(([k, v])=>{
            const res = $9ca517853ec47831$var$_stringifyArgs(v, counterRef, tempToRev);
            return [
                k,
                res
            ];
        });
        const env = entries.reduce((acc, [, res])=>({
                ...acc,
                ...res.env
            }), {});
        const argString = `{${entries.map(([k, { argString: argString }])=>`${k}:${argString}`).join(',')}}`;
        return {
            argString: argString,
            env: env
        };
    }
    if ((0, $d205febb791b53ee$export$fa675141bcde8cf8)(arg)) {
        const pairs = arg.map((item)=>$9ca517853ec47831$var$_stringifyArgs(item, counterRef, tempToRev));
        const env = pairs.reduce((acc, res)=>({
                ...acc,
                ...res.env
            }), {});
        const argString = `[${pairs.map(({ argString: argString })=>argString).join(',')}]`;
        return {
            argString: argString,
            env: env
        };
    }
    throw new Error(`Unsupported arg type: ${typeof arg}`);
};
const $9ca517853ec47831$export$433fe05b12ba833f = (s)=>s.substring(1, s.length - 1);
const $9ca517853ec47831$export$34def19ef2e52a98 = (arg)=>{
    const counterRef = {
        count: 0
    };
    const tempToRev = {};
    const { argString: rawArgString, env: rawEnv } = $9ca517853ec47831$var$_stringifyArgs(arg, counterRef, tempToRev);
    // Replace all temp vars with deterministic __bcN__ in discovery order
    let finalArgString = rawArgString;
    const finalEnv = {};
    Object.keys(tempToRev).forEach((oldTemp, index)=>{
        const newTemp = `__bc${index}__`;
        finalArgString = finalArgString.replaceAll(oldTemp, newTemp);
        finalEnv[newTemp] = tempToRev[oldTemp];
    });
    return {
        argString: $9ca517853ec47831$export$433fe05b12ba833f(finalArgString),
        env: finalEnv
    };
};
class $9ca517853ec47831$export$bf00b4cafcb0e27b {
    constructor(s, sourceType){
        try {
            this.file = (0, $9PVwI$parse)(s, {
                sourceType: sourceType
            });
        } catch (err) {
            throw new Error(`Invalid expression ${err.message}}`);
        }
    }
    getExpression() {
        const { program: program } = this.file;
        const { body: body } = program;
        // @ts-ignore – Babel AST shape
        const { expression: expression } = body[body.length - 1];
        return expression;
    }
    getCalleeName() {
        try {
            return this.getExpression().callee.object.name;
        } catch  {
            return undefined;
        }
    }
    isNew() {
        try {
            return this.getExpression().type === 'NewExpression';
        } catch  {
            return false;
        }
    }
    isCall() {
        try {
            return this.getExpression().type === 'CallExpression';
        } catch  {
            return false;
        }
    }
}
class $9ca517853ec47831$export$be58926105124dd4 {
    constructor({ exp: exp = '', env: env = {}, mod: mod, sourceType: sourceType } = {}){
        /**
   * Determines whether this transition is a method call on an object that
   * has back-links (i.e. is reachable via inverse pointers from other objects).
   * Used by `Db` for stale-side-predecessor detection.
   */ this.isCallWithBackLinks = async (db)=>{
            if (!this.parsed.isCall()) return false;
            const callerName = this.parsed.getCalleeName();
            if (!callerName) return false;
            const callerRev = this.env[callerName];
            if (!callerRev || typeof callerRev !== 'string' || callerRev.startsWith('0'.repeat(64))) return false;
            await db.get(callerRev) // ensure cached
            ;
            return db.cache.hasInversePointers(callerRev);
        };
        this.exp = exp;
        this.env = env;
        this.mod = mod;
        this.parsed = new $9ca517853ec47831$export$bf00b4cafcb0e27b(exp, sourceType);
    }
    /**
   * Returns the public JSON shape (unbranded strings) expected by the outside world.
   */ toJSON() {
        return {
            exp: this.exp,
            env: this.env,
            mod: this.mod
        };
    }
    static fromUpdate(update) {
        const t = update.transition;
        return new $9ca517853ec47831$export$be58926105124dd4({
            exp: t.exp,
            env: t.env,
            mod: t.mod
        });
    }
    static{
        this.newExp = (constructor, argString = '')=>`${constructor} new ${constructor.name}(${argString})`;
    }
    static{
        this.callExp = (property, argString)=>`__bc__.${String(property)}(${argString})`;
    }
    static{
        /**
   * Creates a Transition representing `new Constructor(...)`.
   */ this.fromConstructorCall = (constructor, args = [], mod)=>{
            const { argString: argString, env: env } = $9ca517853ec47831$export$34def19ef2e52a98(args);
            const exp = $9ca517853ec47831$export$be58926105124dd4.newExp(constructor, argString);
            if ((0, $303220cf0debbf6c$export$c7f1cd04a579dcb2)(Object.values(env))) throw new Error($9ca517853ec47831$var$cycleErrorMessage);
            return new $9ca517853ec47831$export$be58926105124dd4({
                exp: exp,
                env: env,
                mod: mod
            });
        };
    }
    static{
        /**
   * Creates a Transition representing `target.method(...)`.
   * Signature kept identical to original for maximum backward compatibility.
   */ this.fromFunctionCall = (target, property, args = [], mod)=>{
            const { argString: argString, env: preEnv } = $9ca517853ec47831$export$34def19ef2e52a98(args);
            const exp = $9ca517853ec47831$export$be58926105124dd4.callExp(property, argString);
            const env = {
                __bc__: target._rev,
                ...preEnv
            };
            if ((0, $303220cf0debbf6c$export$c7f1cd04a579dcb2)(Object.values(env))) throw new Error($9ca517853ec47831$var$cycleErrorMessage);
            return new $9ca517853ec47831$export$be58926105124dd4({
                exp: exp,
                env: env,
                mod: mod
            });
        };
    }
}



const $382856abc4b520b8$export$3bb4a3f4a9646a6a = Symbol('proxy_tag');
function $382856abc4b520b8$export$29c19449f1fdb873(obj, computer, seen = new WeakMap()) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map((item)=>$382856abc4b520b8$export$29c19449f1fdb873(item, computer, seen));
    if ($382856abc4b520b8$export$3bb4a3f4a9646a6a in obj && obj[$382856abc4b520b8$export$3bb4a3f4a9646a6a]) return obj;
    if (seen.has(obj)) return seen.get(obj);
    const proxy = new Proxy(obj, new $382856abc4b520b8$export$a428cd33b25d5283(computer));
    (0, $aec7dd200596fb2a$export$62c0dd10c640417e)(()=>{
        Object.defineProperty(proxy, $382856abc4b520b8$export$3bb4a3f4a9646a6a, {
            value: true,
            writable: false,
            configurable: false,
            enumerable: false
        });
    });
    seen.set(obj, proxy);
    return proxy;
}
class $382856abc4b520b8$export$a428cd33b25d5283 {
    constructor(computer){
        this.computer = computer;
    }
    get(target, property) {
        if (typeof target[property] !== 'function') return $382856abc4b520b8$export$29c19449f1fdb873(Reflect.get(target, property), this.computer);
        if (typeof target[property] === 'function' && typeof property === 'string' && [
            'toString',
            'valueOf'
        ].includes(property)) return Reflect.get(target, property);
        const handleFunctionCall = async (...args)=>{
            const { computer: computer } = this;
            const { db: db } = computer;
            const transition = (0, $9ca517853ec47831$export$be58926105124dd4).fromFunctionCall(target, property, args);
            const { tx: tx, effect: effect } = await db.evalMocked(transition);
            if (tx) await computer.broadcast(tx);
            const { res: res, env: env } = effect;
            (0, $74a26ef6d53e712a$export$48b95d5fd8dc5d0b)((0, $74a26ef6d53e712a$export$c4d407c2cae5b6c0)(env))([])(args);
            (0, $74a26ef6d53e712a$export$48b95d5fd8dc5d0b)((0, $74a26ef6d53e712a$export$c4d407c2cae5b6c0)(env))([])(target);
            return $382856abc4b520b8$export$29c19449f1fdb873(res, computer);
        };
        return handleFunctionCall;
    }
}
















(0, $9PVwI$initEccLib)($9PVwI$bitcoincomputersecp256k1);
const $989cbe3a18f5d1dd$export$8ca3fddf2a08fbf8 = (baseUrl, keyPair)=>{
    const timestamp = Date.now();
    const msgHash = (0, $9PVwI$crypto).sha256((0, $9PVwI$Buffer).from(baseUrl + timestamp));
    const privateKey = keyPair.privateKey ?? (0, $9PVwI$Buffer).alloc(0);
    const signature = (0, $9PVwI$Buffer).from([
        ...$9PVwI$bitcoincomputersecp256k1.sign(msgHash, privateKey)
    ]).toString('hex');
    const { publicKey: publicKey } = keyPair;
    const tokenParts = [
        signature,
        publicKey,
        timestamp
    ];
    const authToken = (0, $9PVwI$Buffer).from(tokenParts.join(':')).toString('base64');
    const authHeader = `Bearer ${authToken}`;
    return authHeader;
};



const $0bf978cc7e5ad20d$var$numOfAttempts = (0, $bd5ff9060a235dd4$export$b00b425fffc1d558);
class $0bf978cc7e5ad20d$export$bc3f23723d5e1cba {
    constructor(baseUrl, keyPair = {}){
        this.retry = (error)=>{
            return error.response?.status === 401 && error.response?.data?.error === 'Please use a fresh authentication token.';
        };
        this.url = baseUrl;
        this.keyPair = keyPair;
    }
    async _get(route) {
        const headers = this.keyPair.privateKey?.toString('hex') ? {
            Authentication: (0, $989cbe3a18f5d1dd$export$8ca3fddf2a08fbf8)(this.url, this.keyPair)
        } : {};
        const response = await (0, $9PVwI$axios).get(`${this.url}${route}`, {
            headers: headers
        });
        return response.data;
    }
    async _post(route, data) {
        const headers = this.privateKey?.toString('hex') ? {
            Authentication: (0, $989cbe3a18f5d1dd$export$8ca3fddf2a08fbf8)(this.url, this.keyPair)
        } : {};
        const response = await (0, $9PVwI$axios).post(`${this.url}${route}`, data, {
            headers: headers
        });
        return response.data;
    }
    async _delete(route) {
        const headers = this.privateKey?.toString('hex') ? {
            Authentication: (0, $989cbe3a18f5d1dd$export$8ca3fddf2a08fbf8)(this.url, this.keyPair)
        } : {};
        const response = await (0, $9PVwI$axios).delete(`${this.url}${route}`, {
            headers: headers
        });
        return response.data;
    }
    async get(route) {
        try {
            return await (0, $9PVwI$backOff)(()=>this._get(route), {
                retry: this.retry,
                numOfAttempts: $0bf978cc7e5ad20d$var$numOfAttempts
            });
        } catch (e) {
            if (e.response && e.response.data) {
                const { data: data } = e.response;
                if (data.error) throw new Error(data.error);
                else throw new Error(JSON.stringify(data));
            }
            throw e;
        }
    }
    async post(route, datum) {
        try {
            return await (0, $9PVwI$backOff)(()=>this._post(route, datum), {
                retry: this.retry,
                numOfAttempts: $0bf978cc7e5ad20d$var$numOfAttempts
            });
        } catch (e) {
            if (e.response && e.response.data) {
                const { data: data } = e.response;
                if (data.error) throw new Error(data.error);
                else throw new Error(JSON.stringify(data));
            }
            throw e;
        }
    }
    async delete(route) {
        try {
            return await (0, $9PVwI$backOff)(()=>this._delete(route), {
                retry: this.retry,
                numOfAttempts: $0bf978cc7e5ad20d$var$numOfAttempts
            });
        } catch (e) {
            if (e.response && e.response.data) {
                const { data: data } = e.response;
                if (data.error) throw new Error(data.error);
                else throw new Error(JSON.stringify(data));
            }
            throw e;
        }
    }
}






const $fdb3572e52dbf02d$var$ECPair = (0, $9PVwI$ECPairFactory)($9PVwI$bitcoincomputersecp256k1);
class $fdb3572e52dbf02d$export$ea8b5b3aea9558ce {
    constructor(params = {}){
        const supported = [
            'chain',
            'mnemonic',
            'network',
            'passphrase',
            'path',
            'url',
            'satPerByte',
            'addressType',
            'moduleStorageType',
            'checkFee',
            'mode'
        ];
        const invalidKeys = Object.keys(params).filter((key)=>!supported.includes(key));
        if (invalidKeys.length > 0) throw new Error(`Invalid properties provided: ${invalidKeys.join(', ')}`);
        const { chain: chain, network: network, mnemonic: mnemonic, path: path, passphrase: passphrase, addressType: addressType, url: url, satPerByte: satPerByte, moduleStorageType: moduleStorageType, checkFee: checkFee, mode: mode } = params;
        this.chain = chain ? chain.toUpperCase() : 'LTC';
        this.network = network ? network.toLowerCase() : 'regtest';
        this.networkObj = (0, $303220cf0debbf6c$export$de754bb4cdcc210c)(this.chain, this.network);
        this.mnemonic = mnemonic ?? (0, $9PVwI$generateMnemonic)();
        this.path = path ?? (0, $303220cf0debbf6c$export$2aa3fd96c49a84a8)({
            chain: this.chain,
            network: this.network
        });
        this.passphrase = passphrase ?? (0, $bd5ff9060a235dd4$export$1035b0570451c823);
        this.addressType = addressType ?? (0, $bd5ff9060a235dd4$export$9c80b82d32647b78);
        this.mode = mode ?? 'dev';
        this.url = url ?? 'https://rltc.node.bitcoincomputer.io' // ← added
        ;
        const chainDefaults = {
            LTC: {
                satPerByte: (0, $bd5ff9060a235dd4$export$bb38fdd194d4373f),
                dustRelayTxFee: (0, $bd5ff9060a235dd4$export$14096f3be8a46637),
                moduleStorageType: 'taproot'
            },
            BTC: {
                satPerByte: (0, $bd5ff9060a235dd4$export$13e1a04b9affc983),
                dustRelayTxFee: (0, $bd5ff9060a235dd4$export$1e7ef728e2683d27),
                moduleStorageType: 'taproot'
            },
            DOGE: {
                satPerByte: (0, $bd5ff9060a235dd4$export$e1763572af4d7bad),
                dustRelayTxFee: (0, $bd5ff9060a235dd4$export$e7e3d18e730436b6),
                moduleStorageType: 'multisig'
            },
            PEPE: {
                satPerByte: (0, $bd5ff9060a235dd4$export$50e187a9fd923b2a),
                dustRelayTxFee: (0, $bd5ff9060a235dd4$export$c32d443dbb2eda37),
                moduleStorageType: 'multisig'
            }
        };
        const defaults = chainDefaults[this.chain];
        this.satPerByte = satPerByte ?? defaults.satPerByte;
        this.dustRelayTxFee = defaults.dustRelayTxFee;
        this.moduleStorageType = moduleStorageType ?? defaults.moduleStorageType;
        const supportedChains = [
            'LTC',
            'BTC',
            'DOGE',
            'PEPE'
        ];
        if (!supportedChains.includes(this.chain)) throw new Error(`Unsupported chain: ${this.chain}. Supported: ${supportedChains.join(', ')}`);
        if (![
            'prod',
            'dev',
            'debug'
        ].includes(this.mode)) throw new Error(`Invalid mode: ${this.mode}. Must be 'dev' or 'prod'`);
        if (!(0, $9PVwI$validateMnemonic)(this.mnemonic)) throw new Error('Invalid mnemonic');
        if (![
            'mainnet',
            'testnet',
            'regtest'
        ].includes(this.network)) throw new Error(`Please set 'network' to 'regtest', 'testnet' or 'mainnet'`);
        if (this.moduleStorageType !== 'multisig' && this.moduleStorageType !== 'taproot') throw new Error(`Please set 'moduleStorageType' to 'multisig' or 'taproot'`);
        if (this.mode === 'dev' && this.network === 'mainnet') throw new Error('Mainnet is only supported in production mode');
        this.keyPair = (0, $303220cf0debbf6c$export$accea06471c18a5a)(this);
        this.bcn = new (0, $0bf978cc7e5ad20d$export$bc3f23723d5e1cba)(this.url, this.keyPair) // ← now passes this.url
        ;
        if (this.mode === 'prod' && !Object.isFrozen(Object.prototype)) lockdown({
            overrideTaming: 'severe'
        });
        this.checkFee = checkFee ?? false;
    }
    /* ==================== PRIVATE HELPERS ==================== */ get authHeader() {
        return this.keyPair.privateKey ? (0, $989cbe3a18f5d1dd$export$8ca3fddf2a08fbf8)(this.url, this.keyPair) : undefined;
    }
    async _get(route) {
        const headers = this.authHeader ? {
            Authentication: this.authHeader
        } : {};
        const response = await (0, $9PVwI$axios).get(`${this.url}${route}`, {
            headers: headers
        });
        return response.data;
    }
    async _post(route, data) {
        const headers = this.authHeader ? {
            Authentication: this.authHeader
        } : {};
        const response = await (0, $9PVwI$axios).post(`${this.url}${route}`, data, {
            headers: headers
        });
        return response.data;
    }
    async _delete(route) {
        const headers = this.authHeader ? {
            Authentication: this.authHeader
        } : {};
        const response = await (0, $9PVwI$axios).delete(`${this.url}${route}`, {
            headers: headers
        });
        return response.data;
    }
    /* ==================== NODE METHODS ==================== */ async rpc(method, params) {
        return this.bcn.post(`/v1/${this.chain}/${this.network}/rpc`, {
            method: method,
            params: params
        });
    }
    async broadcast(txHex) {
        const { chain: chain, network: network } = this;
        return this.bcn.post(`/v1/${chain}/${network}/tx/post`, {
            hex: txHex
        });
    }
    async cleanMempool() {
        const { chain: chain, network: network } = this;
        return this.bcn.post(`/v1/${chain}/${network}/clean-mempool`, undefined);
    }
    async getBalance(address) {
        const { chain: chain, network: network } = this;
        const res = await this.bcn.get(`/v1/${chain}/${network}/address/${address}/balance`);
        return (0, $303220cf0debbf6c$export$76f8b5ba27b3a9fe)(res);
    }
    async listTxs(address) {
        const { chain: chain, network: network } = this;
        const rest = await this.bcn.get(`/v1/${chain}/${network}/wallet/${address}/list-txs`);
        const sentTxs = rest.sentTxs.map(({ txId: txId, inputsSatoshis: inputsSatoshis, outputsSatoshis: outputsSatoshis, satoshis: satoshis })=>({
                txId: txId,
                inputsSatoshis: BigInt(inputsSatoshis),
                outputsSatoshis: BigInt(outputsSatoshis),
                satoshis: BigInt(satoshis)
            }));
        const receivedTxs = rest.receivedTxs.map(({ txId: txId, inputsSatoshis: inputsSatoshis, outputsSatoshis: outputsSatoshis, satoshis: satoshis })=>({
                txId: txId,
                inputsSatoshis: BigInt(inputsSatoshis),
                outputsSatoshis: BigInt(outputsSatoshis),
                satoshis: BigInt(satoshis)
            }));
        return {
            sentTxs: sentTxs,
            receivedTxs: receivedTxs
        };
    }
    /* ==================== GET-TXOS FAMILY (clean union-based private helper) ==================== */ async _getTXOs(query) {
        const { chain: chain, network: network } = this;
        // === EXACT ORIGINAL VALIDATION (unchanged) ===
        if (!query || Object.values(query).filter((v)=>v !== query.verbosity).every((v)=>v === undefined)) throw new Error('At least one query parameter must be provided');
        if (query.verbosity !== undefined && (isNaN(Number(query.verbosity)) || ![
            0,
            1
        ].includes(Number(query.verbosity)))) throw new Error('verbosity must be a number either 0 or 1');
        if (query.isSpent && query.isSpent !== true && query.isSpent !== false) throw new Error('spent must be either true or false');
        if (query.order && query.order !== 'ASC' && query.order !== 'DESC') throw new Error("order must be either 'ASC' or 'DESC'");
        if (query.limit !== undefined && isNaN(Number(query.limit))) throw new Error('limit must be a number');
        if (query.offset !== undefined && isNaN(Number(query.offset))) throw new Error('offset must be a number');
        if (query.isObject && query.isObject !== true && query.isObject !== false) throw new Error('isSmartObject must be either true or false');
        if (query.satoshis !== undefined) try {
            BigInt(query.satoshis);
        } catch (e) {
            throw new Error('satoshis must be a BigInt parsable string');
        }
        if (query.publicKey !== undefined && !(0, $303220cf0debbf6c$export$b02a40aff8e4ad18)(query.publicKey)) throw new Error('publicKey must be a hex string');
        if (query.previous !== undefined && !(0, $303220cf0debbf6c$export$ec70ee4fa0462cba)(query.previous)) throw new Error('previous must be a hex string');
        if (query.blockHash !== undefined && !(0, $303220cf0debbf6c$export$b02a40aff8e4ad18)(query.blockHash)) throw new Error('blockHash must be a hex string');
        if (query.asm !== undefined) {
            if (!(0, $9PVwI$script).fromASM(query.asm)) throw new Error('asm is not a valid script');
        }
        let expHash;
        if (query.exp !== undefined) {
            if (typeof query.exp !== 'string') throw new Error('exp must be a string');
            expHash = (0, $9PVwI$crypto).sha256(Buffer.from(query.exp)).toString('hex');
        }
        const searchParams = new URLSearchParams();
        const { exp: exp, ...restQuery } = query;
        const apiQuery = {
            ...restQuery,
            ...expHash ? {
                expHash: expHash
            } : {}
        };
        Object.entries(apiQuery).forEach(([key, value])=>{
            if (value !== undefined) searchParams.append(key, String(value));
        });
        const route = `/v1/${chain}/${network}/get-txos?${searchParams.toString()}`;
        if (query.verbosity === 1) {
            const res = await this.bcn.get(route);
            return res.map((txo)=>({
                    ...txo,
                    satoshis: BigInt(txo.satoshis)
                }));
        }
        return await this.bcn.get(route);
    }
    async getTXOs(query) {
        return this._getTXOs(query);
    }
    async getUTXOs(query) {
        return this._getTXOs({
            ...query,
            isSpent: false
        });
    }
    async getOTXOs(query) {
        return this._getTXOs({
            ...query,
            isObject: true
        });
    }
    async getOUTXOs(query) {
        return this._getTXOs({
            ...query,
            isObject: true,
            isSpent: false
        });
    }
    async getRawTxs(txIds) {
        const { chain: chain, network: network } = this;
        return this.bcn.post(`/v1/${chain}/${network}/tx/bulk/`, {
            txIds: txIds
        });
    }
    async checkStreamParameters(searchParams) {
        const { chain: chain, network: network } = this;
        return this.bcn.get(`/v1/${chain}/${network}/subscribe-check?${searchParams.toString()}`);
    }
    async getRawTx(txId) {
        const { chain: chain, network: network } = this;
        return this.bcn.get(`/v1/${chain}/${network}/tx/${txId}/hex`);
    }
    async getTx(txId) {
        const { chain: chain, network: network } = this;
        const res = await this.bcn.get(`/v1/${chain}/${network}/tx/${txId}/json`);
        res.outs.forEach((output)=>{
            Object.assign(output, {
                value: BigInt(output.value)
            });
        });
        return res;
    }
    async getAncestors(txId) {
        return this.bcn.get(`/v1/${this.chain}/${this.network}/tx/${txId}/ancestors`);
    }
    /* ==================== BITCOIN COMPUTER METHODS (unchanged) ==================== */ async query({ publicKey: publicKey, limit: limit, offset: offset, order: order, mod: mod }) {
        if (mod && typeof mod !== 'string') throw new Error('Module specifier must be a string');
        if (publicKey && typeof publicKey !== 'string') throw new Error('PublicKey must be string encoded');
        if (limit && typeof limit !== 'number') throw new Error('Limit must be a number');
        if (limit && limit < 0) throw new Error('Limit must not be negative');
        if (offset && typeof offset !== 'number') throw new Error('Offset must be a number');
        if (offset && offset < 0) throw new Error('Offset must not be negative');
        if (order && ![
            'ASC',
            'DESC'
        ].includes(order)) throw new Error('Order must be "ASC" or "DESC"');
        const searchParams = new URLSearchParams();
        if (typeof mod !== 'undefined') searchParams.append('mod', mod);
        if (typeof publicKey !== 'undefined') searchParams.append('publicKey', publicKey);
        if (typeof limit !== 'undefined') searchParams.append('limit', limit.toString());
        if (typeof offset !== 'undefined') searchParams.append('offset', offset.toString());
        if (typeof order !== 'undefined') searchParams.append('order', order);
        if (searchParams.toString() === '') throw new Error('Query must not be empty');
        return this.getTXOs({
            publicKey: publicKey,
            isSpent: false,
            limit: limit,
            offset: offset,
            order: order,
            mod: mod,
            verbosity: 0,
            isObject: false
        });
    }
    async first(rev) {
        const { chain: chain, network: network } = this;
        return this.bcn.post(`/v1/${chain}/${network}/revToId`, {
            rev: rev
        });
    }
    static async getSecretOutput({ _url: _url, keyPair: keyPair }) {
        const urlSplit = _url.split('/');
        const id = urlSplit[urlSplit.length - 1];
        const host = urlSplit.slice(0, -2).join('/');
        const server = new (0, $0bf978cc7e5ad20d$export$bc3f23723d5e1cba)(host, keyPair);
        const data = await server.get(`/v1/store/${id}`);
        return {
            host: host,
            data: data
        };
    }
    static async setSecretOutput({ secretOutput: secretOutput, host: host, keyPair: keyPair }) {
        const server = new (0, $0bf978cc7e5ad20d$export$bc3f23723d5e1cba)(host, keyPair);
        return server.post(`/v1/store/`, secretOutput);
    }
    static async deleteSecretOutput({ _url: _url, keyPair: keyPair }) {
        const urlSplit = _url.split('/');
        const id = urlSplit[urlSplit.length - 1];
        const host = urlSplit.slice(0, -2).join('/');
        const server = new (0, $0bf978cc7e5ad20d$export$bc3f23723d5e1cba)(host, keyPair);
        await server.delete(`/v1/store/${id}`);
    }
    /* ==================== FAUCET & NODE METHODS (exact original) ==================== */ getRandomAddress() {
        const hdPrivateKey = (0, $303220cf0debbf6c$export$accea06471c18a5a)({
            path: (0, $303220cf0debbf6c$export$2aa3fd96c49a84a8)({
                chain: this.chain,
                network: this.network
            }),
            networkObj: this.networkObj
        });
        return (0, $9PVwI$address).fromPublicKey(hdPrivateKey.publicKey, this.addressType, this.networkObj);
    }
    async faucet(address, value) {
        const valueBtc = value / 1e8;
        const { result: res } = await this.rpc('sendtoaddress', `${address} ${valueBtc} '' ''`);
        const txId = res.result;
        await this.rpc('generatetoaddress', `1 ${this.getRandomAddress()}`);
        const { result: res2 } = await this.rpc('getrawtransaction', `${txId} 1`);
        const fetchedTx = res2.result;
        const vout = fetchedTx.vout.findIndex((x)=>x.value * 1e8 === value);
        return {
            txId: txId,
            vout: vout,
            height: -1,
            satoshis: BigInt(value)
        };
    }
    async faucetScript(script, value) {
        const key = $fdb3572e52dbf02d$var$ECPair.makeRandom({
            network: this.networkObj
        });
        const payment = (0, $9PVwI$payments).p2pkh({
            pubkey: key.publicKey,
            network: this.networkObj
        });
        const { address: address } = payment;
        const resTxId = (await this.rpc('sendtoaddress', `${address} ${value * 2 / 1e8} '' ''`)).result;
        const txId = resTxId.result;
        const res = (await this.rpc('getrawtransaction', `${txId} 1`)).result;
        const fetchedTx = res.result;
        let voutIndex = -1;
        for(let i = 0; i < fetchedTx.vout.length; i += 1){
            const output = fetchedTx.vout[i];
            if (output.scriptPubKey && output.scriptPubKey.address && output.scriptPubKey.address.includes(address) || output.scriptPubKey.addresses && output.scriptPubKey.addresses.includes(address)) {
                voutIndex = i;
                break;
            }
        }
        if (voutIndex === -1) throw new Error('Could not find the output index for the given address');
        let counter = 10;
        let unspent;
        do unspent = await this.rpc('gettxout', `${txId} ${voutIndex} true`);
        while (unspent.error && counter--);
        if (unspent.error) throw new Error('Could not find the faucet transaction');
        const txvb = new (0, $9PVwI$Psbt)({
            network: this.networkObj
        });
        txvb.addInput({
            hash: txId,
            index: voutIndex,
            nonWitnessUtxo: Buffer.from(fetchedTx.hex, 'hex')
        });
        txvb.addOutput({
            script: script,
            value: value
        });
        txvb.signInput(0, key);
        txvb.finalizeAllInputs();
        const txv = txvb.extractTransaction(true);
        const { result: res2 } = await this.rpc('sendrawtransaction', `${txv.toHex()}`);
        const txIdScript = res2.result;
        let voutPsbt = 0;
        let foundPsbt = await this.rpc('gettxout', `${txIdScript} ${voutPsbt} true`);
        if (foundPsbt.error) foundPsbt = await this.rpc('gettxout', `${txIdScript} ${++voutPsbt} true`);
        if (foundPsbt.error) foundPsbt = await this.rpc('gettxout', `${txIdScript} ${++voutPsbt} true`);
        if (foundPsbt.error) throw new Error('No UTXO found');
        return {
            txId: txv.getId(),
            vout: voutPsbt,
            height: -1,
            satoshis: BigInt(Math.round(foundPsbt.result.result.value * 100000000))
        };
    }
    async mine(count) {
        return this.rpc('generatetoaddress', `${count} ${this.getRandomAddress()}`);
    }
    async verify(txo) {
        const res = await this.rpc('getrawtransaction', `${txo.txId} 1`);
        const txoActual = res.result.result.vout[txo.vout];
        if (txo.scriptPubKey && txoActual.scriptPubKey !== txo.scriptPubKey) throw new Error('Address mismatch');
        if (txo.satoshis && BigInt(txoActual.value) * 100000000n !== txo.satoshis) throw new Error('Value Mismatch');
    }
    async height() {
        const { result: topBlockHash } = await this.rpc('getbestblockhash', '');
        const { result: result } = await this.rpc('getblockheader', `${topBlockHash.result}`);
        return result.result.height;
    }
    async next(rev) {
        const { chain: chain, network: network } = this;
        const url = `/v1/${chain}/${network}/next/${rev}`;
        const { rev: r } = await this.bcn.get(url);
        return r;
    }
    async prev(rev) {
        const { chain: chain, network: network } = this;
        const url = `/v1/${chain}/${network}/prev/${rev}`;
        const { rev: r } = await this.bcn.get(url);
        return r ?? undefined;
    }
    async latest(rev) {
        const { chain: chain, network: network } = this;
        const url = `/v1/${chain}/${network}/latest/${rev}`;
        const { rev: r } = await this.bcn.get(url);
        return r;
    }
}



function $88b91cd8c4477eb9$export$6f57813fe9f31bf9(obj, url, keyPair) {
    return url ? (0, $fdb3572e52dbf02d$export$ea8b5b3aea9558ce).setSecretOutput({
        host: url,
        secretOutput: {
            data: JSON.stringify(obj)
        },
        keyPair: keyPair
    }) : obj;
}
async function $88b91cd8c4477eb9$export$e7aa7bc5c1b3cfb3(obj, keyPair) {
    if ((0, $d205febb791b53ee$export$18d65c6a1aeeaec7)(obj)) {
        const { _url: _url, ...rest } = obj;
        const { host: host, data: data } = await (0, $fdb3572e52dbf02d$export$ea8b5b3aea9558ce).getSecretOutput({
            _url: _url,
            keyPair: keyPair
        });
        return {
            ...rest,
            ...JSON.parse(data),
            _url: host
        };
    }
    return obj;
}



const $deb927b75e1890ae$export$a4ad2735b021c132 = '0.26.0-beta.0';







$9PVwI$ECIES_CONFIG.symmetricAlgorithm = 'aes-256-gcm';
$9PVwI$ECIES_CONFIG.symmetricNonceLength = 12;
const $2e54c381077e6c48$var$webCryptoPromise = (async ()=>{
    if (0, $303220cf0debbf6c$export$4e09c449d6c407f7) return globalThis.crypto;
    else return $9PVwI$webcrypto;
})();
async function $2e54c381077e6c48$export$c83d4bcc905511a5() {
    const webCrypto = await $2e54c381077e6c48$var$webCryptoPromise;
    const bytes = webCrypto.getRandomValues(new Uint8Array(32));
    return (0, $9PVwI$Buffer).from(bytes).toString('hex');
}
async function $2e54c381077e6c48$export$52b2fbbd12724c12(message, secret) {
    if (!/^[0-9a-f]{64}$/i.test(secret)) throw new Error('Invalid secret');
    const webCrypto = await $2e54c381077e6c48$var$webCryptoPromise;
    const { subtle: subtle } = webCrypto;
    const keyBytes = new Uint8Array((0, $9PVwI$Buffer).from(secret, 'hex'));
    const iv = webCrypto.getRandomValues(new Uint8Array(12));
    const key = await subtle.importKey('raw', keyBytes, 'AES-GCM', true, [
        'encrypt'
    ]);
    const data = new TextEncoder().encode(message);
    const encrypted = await subtle.encrypt({
        name: 'AES-GCM',
        iv: iv
    }, key, data);
    const full = new Uint8Array(iv.byteLength + encrypted.byteLength);
    full.set(iv, 0);
    full.set(new Uint8Array(encrypted), iv.byteLength);
    return (0, $9PVwI$Buffer).from(full).toString('base64');
}
async function $2e54c381077e6c48$export$496fc7864dba515e(encrypted, secret) {
    if (!/^[0-9a-f]{64}$/i.test(secret)) throw new Error('Invalid secret');
    const full = new Uint8Array((0, $9PVwI$Buffer).from(encrypted, 'base64'));
    if (full.length < 28) throw new Error('Decryption failure') // Min: IV + tag
    ;
    const iv = full.slice(0, 12);
    const ciphertext = full.slice(12);
    const webCrypto = await $2e54c381077e6c48$var$webCryptoPromise;
    const { subtle: subtle } = webCrypto;
    const keyBytes = new Uint8Array((0, $9PVwI$Buffer).from(secret, 'hex'));
    const key = await subtle.importKey('raw', keyBytes, 'AES-GCM', true, [
        'decrypt'
    ]);
    let decrypted;
    try {
        decrypted = await subtle.decrypt({
            name: 'AES-GCM',
            iv: iv
        }, key, ciphertext);
    } catch  {
        throw new Error('Decryption failure');
    }
    return new TextDecoder().decode(decrypted);
}
function $2e54c381077e6c48$export$ff4060c8805361f3(message, publicKey) {
    if (!/^0[2-3][0-9a-f]{64}|04[0-9a-f]{128}$/i.test(publicKey)) throw new Error('Invalid publicKey');
    const msgBytes = new TextEncoder().encode(message);
    return $9PVwI$encrypt(publicKey, msgBytes).toString('base64');
}
function $2e54c381077e6c48$export$d702cea5b1df4a97(encrypted, privateKey) {
    if (!/^[0-9a-f]{64}$/i.test(privateKey)) throw new Error('Invalid privateKey');
    const encBytes = new Uint8Array((0, $9PVwI$Buffer).from(encrypted, 'base64'));
    let bytes;
    try {
        bytes = $9PVwI$decrypt(privateKey, encBytes);
    } catch (err) {
        if (err.message === 'Unsupported state or unable to authenticate data') throw new Error('Decryption failure');
        throw err;
    }
    return new TextDecoder().decode(bytes);
}
async function $2e54c381077e6c48$export$60a153e45a5d0ad8(message, publicKeys) {
    const secret = await $2e54c381077e6c48$export$c83d4bcc905511a5();
    return {
        __cypher: await $2e54c381077e6c48$export$52b2fbbd12724c12(message, secret),
        __secrets: [
            ...new Set(publicKeys)
        ].map((publicKey)=>$2e54c381077e6c48$export$ff4060c8805361f3(secret, publicKey))
    };
}
async function $2e54c381077e6c48$export$28eea9a217b16b0a({ __cypher: __cypher, __secrets: __secrets }, privateKey) {
    for (const encryptedSecret of __secrets)try {
        const secret = $2e54c381077e6c48$export$d702cea5b1df4a97(encryptedSecret, privateKey.toString('hex'));
        return await $2e54c381077e6c48$export$496fc7864dba515e(__cypher, secret);
    } catch (err) {
        if (err instanceof Error && err.message !== 'Decryption failure') throw err;
    }
    throw new Error('Decryption failure');
}
const $2e54c381077e6c48$export$e85a0c9a1067c5d3 = async (data, privateKey)=>(0, $d205febb791b53ee$export$691b4523c5340423)(data) ? {
        ...JSON.parse(await $2e54c381077e6c48$export$28eea9a217b16b0a(data, privateKey)),
        ioMap: data.ioMap ?? [],
        _readers: []
    } : data;
const $2e54c381077e6c48$export$5b0f6292f11d1d18 = async (data, readers)=>readers ? await $2e54c381077e6c48$export$60a153e45a5d0ad8(JSON.stringify(data), readers) : data;




class $9723fb8a051ef3ce$export$7dc1820ecc9cc6de extends Error {
    constructor(message){
        super(message);
        this.name = 'InvalidUpdateError';
    }
}
class $9723fb8a051ef3ce$export$489a84f048b0ef8 {
    constructor({ inRevs: inRevs = [], ownerData: ownerData = [], transition: transition = new (0, $9ca517853ec47831$export$be58926105124dd4)({
        exp: '',
        env: {},
        mod: undefined
    }), txId: txId, effect: effect } = {}){
        this.inRevs = inRevs;
        this.ownerData = ownerData;
        this.transition = transition;
        this.txId = txId;
        this.effect = effect;
    }
    /**
   * Serializes the Update to JSON, handling BigInt and Buffer → ASM round-tripping.
   * Exact same runtime behavior as before.
   */ serialize() {
        const { inRevs: inRevs, ownerData: ownerData, transition: transition, txId: txId } = this;
        return JSON.stringify({
            inRevs: inRevs,
            ownerData: ownerData,
            transition: transition,
            txId: txId
        }, $9723fb8a051ef3ce$export$489a84f048b0ef8.replacer, 2);
    }
    /**
   * Deserializes JSON back to an Update instance.
   * Exact same runtime behavior as before.
   */ static deserialize(json) {
        const parsed = JSON.parse(json, $9723fb8a051ef3ce$export$489a84f048b0ef8.reviver);
        return new $9723fb8a051ef3ce$export$489a84f048b0ef8(parsed);
    }
    /**
   * Alias for modern code (recommended over `serialize`).
   * Behavior unchanged.
   */ toJSON() {
        return this.serialize();
    }
    /**
   * Alias for modern code (recommended over `deserialize`).
   * Behavior unchanged.
   */ static fromJSON(json) {
        return $9723fb8a051ef3ce$export$489a84f048b0ef8.deserialize(json);
    }
    static{
        this.replacer = (key, value)=>{
            if (key === '_satoshis' && typeof value === 'bigint') return value.toString();
            if (key === 'outScriptBuf' && Buffer.isBuffer(value)) return (0, $9PVwI$script).toASM(value);
            return value;
        };
    }
    static{
        this.reviver = (key, value)=>{
            if (key === '_satoshis' && typeof value === 'string') return BigInt(value);
            if (key === 'outScriptBuf' && typeof value === 'string') return (0, $9PVwI$script).fromASM(value);
            return value;
        };
    }
    /**
   * Full list of old revisions (including undefined for brand-new objects).
   * This preserves the exact length and semantics of the original implementation.
   */ get oldOutRevs() {
        return this.ownerData.map((o)=>o.oldRev);
    }
    get newOutRevs() {
        if (!this.txId) throw new Error('txId not set');
        return this.ownerData.map((_, i)=>`${this.txId}:${i}`);
    }
    get ioMap() {
        return this.inRevs.map((rev)=>this.oldOutRevs.indexOf(rev));
    }
    /**
   * Exact same logic as the original `Transaction.zip` / pre-typing `Update.zip`.
   * Returns `[oldRev or undefined, newRev]` for each output.
   */ zip() {
        try {
            return this.newOutRevs.map((rev, i)=>[
                    this.inRevs[this.ioMap.indexOf(i)],
                    rev
                ]);
        } catch  {
            return [];
        }
    }
    /**
   * Creates an Update from a transaction ID by fetching and decrypting it.
   * Exact same runtime behavior.
   */ static async fromTxId(txId, wallet) {
        const { restClient: restClient } = wallet;
        const tx = await (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTxId({
            txId: txId,
            restClient: restClient
        });
        return $9723fb8a051ef3ce$export$489a84f048b0ef8.fromTx(tx, restClient);
    }
    /**
   * Creates an Update from a raw Transaction object.
   * Exact same runtime behavior.
   */ static async fromTx(tx, { keyPair: keyPair }) {
        const { inRevs: inRevs, ownerData: ownerData, onChainMetaData: onChainMetaData, txId: txId } = tx;
        const { privateKey: privateKey } = keyPair;
        if (!privateKey) throw new $9723fb8a051ef3ce$export$7dc1820ecc9cc6de('Could not find private key');
        const fetched = await (0, $88b91cd8c4477eb9$export$e7aa7bc5c1b3cfb3)(onChainMetaData, keyPair);
        const decrypted = await (0, $2e54c381077e6c48$export$e85a0c9a1067c5d3)(fetched, privateKey);
        const transition = {
            ...decrypted,
            env: $9723fb8a051ef3ce$export$489a84f048b0ef8.decodeEnv(decrypted.env, tx)
        };
        return new $9723fb8a051ef3ce$export$489a84f048b0ef8({
            inRevs: inRevs,
            ownerData: ownerData,
            transition: transition,
            txId: txId
        });
    }
    static buildOwnerOutput(entry, index, wallet, txFromChain) {
        const { restClient: restClient, publicKey: publicKey } = wallet;
        const { _owners: _owners, _satoshis: _satoshis, _readers: _readers, _url: _url } = entry;
        const n = {
            network: restClient.networkObj
        };
        let outScriptBuf;
        if (typeof _owners === 'undefined') outScriptBuf = txFromChain ? txFromChain.ownerData[index].outScriptBuf : $8636fd77165bd4bc$export$50e49a79004f0f9([
            publicKey.toString('hex')
        ], restClient);
        else if (typeof _owners === 'string') {
            const redeemScript = (0, $9PVwI$script).fromASM(_owners.trim().replace(/\s+/g, ' '));
            outScriptBuf = (0, $9PVwI$payments).p2sh({
                redeem: {
                    output: redeemScript,
                    ...n
                },
                ...n
            }).output;
        } else if (typeof _owners === 'object' && Array.isArray(_owners)) outScriptBuf = $8636fd77165bd4bc$export$50e49a79004f0f9(_owners || txFromChain?.ownerData[index]?._owners, restClient);
        else throw new $9723fb8a051ef3ce$export$7dc1820ecc9cc6de('Invalid owners');
        const dust = BigInt(wallet.getDustThreshold(false, outScriptBuf));
        return {
            _satoshis: _satoshis === undefined || _satoshis < dust ? dust : _satoshis,
            _owners: typeof _owners === 'string' ? _owners : $8636fd77165bd4bc$export$a295b4f1f291e064(outScriptBuf),
            outScriptBuf: outScriptBuf,
            _readers: _readers,
            _url: _url
        };
    }
    /**
   * Converts the Update to a signed Transaction (or validates if from chain).
   * Exact same runtime behavior.
   */ async toTx(wallet) {
        const { inRevs: inRevs, ownerData: ownerData, transition: transition, ioMap: ioMap } = this;
        const { exp: exp, mod: mod, env: env } = transition;
        const { restClient: restClient } = wallet;
        const { keyPair: keyPair } = restClient;
        const nestedReaders = ownerData.map((d)=>d._readers);
        if (!(0, $303220cf0debbf6c$export$fb9431c544c373fd)(nestedReaders)) throw new $9723fb8a051ef3ce$export$7dc1820ecc9cc6de('_readers must be the same for all objects');
        const readers = nestedReaders[0];
        const nestedUrls = ownerData.map((d)=>d._url);
        if (!(0, $303220cf0debbf6c$export$fb9431c544c373fd)(nestedUrls)) throw new $9723fb8a051ef3ce$export$7dc1820ecc9cc6de('_url must be the same for all objects');
        const url = nestedUrls[0];
        const encoded = {
            exp: exp,
            env: $9723fb8a051ef3ce$export$489a84f048b0ef8.encodeEnv(env, inRevs),
            mod: mod,
            v: (0, $deb927b75e1890ae$export$a4ad2735b021c132)
        };
        const encrypted = await (0, $2e54c381077e6c48$export$5b0f6292f11d1d18)(encoded, readers);
        const stored = await (0, $88b91cd8c4477eb9$export$6f57813fe9f31bf9)(encrypted, url, keyPair);
        const onChainMetaData = {
            ...stored,
            ioMap: ioMap
        };
        const tx = new (0, $4b62a469f572a3c6$export$febc5573c75cefb0)();
        tx.spendFromData(inRevs);
        tx.createDataOuts(ownerData, onChainMetaData, wallet);
        return tx;
    }
    static equal(u1, u2) {
        const compare = (computedOut, fromTxOut)=>computedOut._satoshis === fromTxOut._satoshis && computedOut.outScriptBuf.equals(fromTxOut.outScriptBuf);
        return (0, $303220cf0debbf6c$export$7efc99439b8625a3)(u1.ownerData, u2.ownerData, compare) && (0, $303220cf0debbf6c$export$7efc99439b8625a3)(u1.inRevs, u2.inRevs);
    }
    /**
   * Used in debug mode to provide detailed diff when transactions mismatch.
   * Exact same runtime behavior (including the debug message).
   */ static testEqual(u1, u2, mode) {
        if (mode !== 'debug') {
            if (this.equal(u1, u2)) return;
            throw new $9723fb8a051ef3ce$export$7dc1820ecc9cc6de('Invalid transaction.');
        }
        const compare = (computedOut, fromTxOut)=>computedOut._satoshis === fromTxOut._satoshis && (computedOut.outScriptBuf === undefined && fromTxOut.outScriptBuf === undefined || computedOut.outScriptBuf && fromTxOut.outScriptBuf && computedOut.outScriptBuf.equals(fromTxOut.outScriptBuf));
        const summary = [];
        const od1 = u1.ownerData;
        const od2 = u2.ownerData;
        if (od1.length !== od2.length) summary.push(`ownerData lengths differ: ${od1.length} vs ${od2.length}`);
        else for(let i = 0; i < od1.length; i++){
            const c1 = od1[i];
            const c2 = od2[i];
            if (!compare(c1, c2)) {
                const diffParts = [];
                if (c1._satoshis !== c2._satoshis) diffParts.push(`satoshis: ${c1._satoshis} vs ${c2._satoshis}`);
                const buf1 = c1.outScriptBuf;
                const buf2 = c2.outScriptBuf;
                if (buf1 === undefined !== (buf2 === undefined) || buf1 && buf2 && !buf1.equals(buf2)) diffParts.push('outScriptBuf differs');
                summary.push(`ownerData at index ${i}: ${diffParts.join(', ')}`);
            }
        }
        const ir1 = u1.inRevs;
        const ir2 = u2.inRevs;
        if (ir1.length !== ir2.length) summary.push(`inRevs lengths differ: ${ir1.length} vs ${ir2.length}`);
        else {
            for(let i = 0; i < ir1.length; i++)if (ir1[i] !== ir2[i]) summary.push(`inRevs at index ${i}: ${ir1[i]} vs ${ir2[i]}`);
        }
        if (this.equal(u1, u2)) return;
        const msg = `Invalid transaction.\nSummary: ${summary.join(', ')}\nDetails:\n --- computed update ---\n${u1.serialize()}\n --- read update ---\n${u2.serialize()}`;
        throw new $9723fb8a051ef3ce$export$7dc1820ecc9cc6de(msg);
    }
    // todo: remove this function
    async broadcast(wallet) {
        const transaction = await this.toTx(wallet);
        await wallet.fund(transaction);
        await wallet.sign(transaction);
        await wallet.broadcast(transaction);
        return transaction.outRevs;
    }
    static decodeEnv(env, tx) {
        return Object.entries(env).reduce((acc, [key, idx])=>{
            const { hash: hash, index: index } = tx.ins[idx];
            acc[key] = `${(0, $303220cf0debbf6c$export$577f793df735f4a1)(hash)}:${index}`;
            return acc;
        }, {});
    }
    static encodeEnv(env, inRevs) {
        return Object.entries(env).reduce((acc, [key, rev])=>{
            const [txId, index] = rev.split(':').slice(-2);
            acc[key] = inRevs.map((s)=>s.split(':').slice(-2).join(':')).indexOf(`${txId}:${index}`);
            return acc;
        }, {});
    }
}









class $0b77d8afb5886e41$export$f2aa9e51325c9c38 {
    /**
   * Handles property access: Returns data properties transparently. For function properties,
   * binds the function to the target to ensure 'this' refers to the inner object during calls,
   * preventing 'this' hijacking and maintaining encapsulation during method invocation.
   *
   * Enhanced in v2.10.2: method bodies now run under _sudo so internal mutations (this.n += 1)
   * are always allowed when calling methods on live smart objects (even after manual encode+ broadcast).
   */ get(target, property) {
        const value = Reflect.get(target, property);
        if (typeof value === 'function') return value.bind(target);
        return value;
    }
    /**
   * Blocks direct property assignments in user mode to enforce encapsulation.
   * In admin mode, forwards to the target (inner proxy), allowing controlled updates.
   *
   * @param target The target instance.
   * @param property The property key.
   * @param value The value to set.
   * @returns True if set succeeded (in admin mode).
   */ set(target, property, value) {
        if (!(0, $aec7dd200596fb2a$export$fdc4f9968fbdadc6)()) throw new Error(`Cannot set property '${String(property)}' directly`);
        return Reflect.set(target, property, value);
    }
    /**
   * Blocks property definitions/redefinitions in user mode.
   * In admin mode, allows data properties but prevents defining/updating functions, getters, or setters
   * to support method-immutability.
   *
   * @param target The target instance.
   * @param property The property key.
   * @param descriptor The property descriptor.
   * @returns True if definition succeeded (in admin mode, for valid descriptors).
   */ defineProperty(target, property, descriptor) {
        if (!(0, $aec7dd200596fb2a$export$fdc4f9968fbdadc6)()) throw new Error(`Cannot define property '${String(property)}'`);
        if (descriptor.value && typeof descriptor.value === 'function' || descriptor.get || descriptor.set) throw new Error('Cannot define or update a function, getter, or setter property');
        return Reflect.defineProperty(target, property, descriptor);
    }
    /**
   * Blocks property deletions in user mode to prevent unauthorized removals.
   * In admin mode, forwards to the target (inner proxy) for controlled deletions.
   * (Note: Inner handler protects keywords; deletions are rare in persistence but allowed here for flexibility.)
   *
   * @param target The target instance (unused but included for API completeness).
   * @param property The property key.
   * @returns True if deletion succeeded (in admin mode).
   */ deleteProperty(target, property) {
        if (!(0, $aec7dd200596fb2a$export$fdc4f9968fbdadc6)()) throw new Error(`Cannot delete property '${String(property)}' directly`);
        return Reflect.deleteProperty(target, property);
    }
    /**
   * Complete reflection support for BC_BRAND and PROXY_TAG (v2.9.1).
   * Guarantees that `Object.hasOwn(obj, BC_BRAND)` and similar checks succeed on the proxy.
   */ has(target, property) {
        if (property === (0, $d205febb791b53ee$export$581775e22cfad3dd) || property === (0, $d205febb791b53ee$export$3bb4a3f4a9646a6a)) return true;
        return Reflect.has(target, property);
    }
    /**
   * Complete reflection support for BC_BRAND and PROXY_TAG (v2.9.1).
   * Ensures `Object.getOwnPropertyDescriptor` returns the correct hidden descriptor.
   */ getOwnPropertyDescriptor(target, property) {
        if (property === (0, $d205febb791b53ee$export$581775e22cfad3dd) || property === (0, $d205febb791b53ee$export$3bb4a3f4a9646a6a)) return {
            value: true,
            writable: false,
            configurable: false,
            enumerable: false
        };
        return Reflect.getOwnPropertyDescriptor(target, property);
    }
    /**
   * Complete reflection support for BC_BRAND and PROXY_TAG (v2.9.1).
   * Hides the internal symbols from `Object.keys`, `JSON.stringify`, etc.
   */ ownKeys(target) {
        return Reflect.ownKeys(target).filter((k)=>k !== (0, $d205febb791b53ee$export$581775e22cfad3dd) && k !== (0, $d205febb791b53ee$export$3bb4a3f4a9646a6a));
    }
    /**
   * Always blocks prototype changes to prevent prototype pollution attacks.
   * This is unconditional (even in admin mode) as prototypes are set during construction
   * and should remain immutable for security.
   *
   * @param _target The target instance (unused).
   * @param _newPrototype The proposed new prototype (unused).
   * @returns False (always fails).
   */ setPrototypeOf(_target, _newPrototype) {
        throw new Error('Cannot override prototype');
    }
    /**
   * Signals that the proxied object is not extensible, aligning with the handler's
   * mutation-blocking behavior. This trap returns false to indicate non-extensibility,
   * which discourages attempts to add new properties (though additions are already
   * blocked by other traps like `set` and `defineProperty`).
   *
   * @param _target The target instance (unused).
   * @returns {boolean} Always false, indicating the object is non-extensible.
   */ isExtensible(_target) {
        return false // Aligns with mutation-blocking traps
        ;
    }
    /**
   * Allows calls to `Object.preventExtensions` or `Reflect.preventExtensions` to succeed,
   * treating the proxied object as already non-extensible. This is cosmetic for API
   * completeness, as extensibility is already effectively prevented by other traps.
   *
   * @param _target The target instance (unused).
   * @returns {boolean} Always true, indicating the operation succeeded.
   */ preventExtensions(_target) {
        return true // Succeeds, as object is treated as non-extensible
        ;
    }
}




const $952d3bca5034e549$var$keyWords = [
    '_id',
    '_rev',
    '_root'
];
class $952d3bca5034e549$export$b8e7b394f2964d0d {
    /**
   * Reflection trap for `in` / `hasOwn` / `Object.hasOwn` / `Reflect.has`.
   * Guarantees that both the internal brand and the proxy tag are visible
   * on every wrapped contract (required for `isSmartObject`, JSON serialization,
   * and the new compile-time safety).
   */ has(target, property) {
        if (property === (0, $d205febb791b53ee$export$581775e22cfad3dd) || property === (0, $d205febb791b53ee$export$3bb4a3f4a9646a6a)) return true;
        return Reflect.has(target, property);
    }
    /**
   * Updated get trap (v2.9.1).
   * Returns the internal brand and proxy tag transparently.
   * Preserves the original `__proto__` protection and all existing behavior.
   */ get(target, property) {
        if (property === (0, $d205febb791b53ee$export$581775e22cfad3dd)) return true;
        if (property === (0, $d205febb791b53ee$export$3bb4a3f4a9646a6a)) return true;
        if (property === '__proto__') throw new Error('Cannot get __proto__');
        return Reflect.get(target, property);
    }
    /**
   * Throws an error if attempting to set a keyword property unless in admin mode,
   * or if setting '__proto__' to prevent prototype pollution,
   * or if updating a function property to enforce method-immutability.
   * Otherwise, sets the property on the target object.
   *
   * @param target The target object being proxied.
   * @param property The property being set.
   * @param value The value to set.
   * @returns True if the set operation succeeded.
   */ set(target, property, value) {
        if ($952d3bca5034e549$var$keyWords.includes(property.toString()) && !(0, $aec7dd200596fb2a$export$fdc4f9968fbdadc6)()) throw new Error(`Cannot set ${property.toString()}`);
        if (property.toString() === '__proto__') throw new Error('Cannot set __proto__');
        if (typeof target[property] === 'function' || typeof value === 'function') throw new Error('Cannot update a function');
        return Reflect.set(target, property, value);
    }
    /**
   * Enforces both keyword-protection and method-immutability when defining properties.
   *
   * - Always blocks keywords (`_id`, `_rev`, `_root`) — even in admin mode.
   * - Always blocks defining functions, getters, or setters (method-immutability).
   * - Allows defining or updating normal data properties (needed for `_sudo`
   *   mutations of `_satoshis`, `_owners`, etc.).
   */ defineProperty(target, property, descriptor) {
        const propStr = property.toString();
        if ($952d3bca5034e549$var$keyWords.includes(propStr)) throw new Error(`Cannot set ${propStr}`);
        const isFunction = descriptor.value && typeof descriptor.value === 'function';
        const hasAccessor = descriptor.get || descriptor.set;
        if (isFunction || hasAccessor) throw new Error('Cannot define or update a function, getter, or setter property');
        return Reflect.defineProperty(target, property, descriptor);
    }
    /**
   * Throws an error if attempting to set the prototype to prevent prototype pollution.
   *
   * @returns False, as the operation is not allowed.
   */ setPrototypeOf() {
        throw new Error('Cannot set the prototype');
    }
    /**
   * Throws an error if attempting to delete a keyword property unless in admin mode to enforce keyword-protection.
   * Otherwise, deletes the property from the target object.
   *
   * @param target The target object being proxied.
   * @param property The property being deleted.
   * @returns True if the delete operation succeeded.
   */ deleteProperty(target, property) {
        if ($952d3bca5034e549$var$keyWords.includes(property.toString()) && !(0, $aec7dd200596fb2a$export$fdc4f9968fbdadc6)()) throw new Error(`Cannot delete ${property.toString()}`);
        return Reflect.deleteProperty(target, property);
    }
    /**
   * Reflection trap for `Object.getOwnPropertyDescriptor` / `Reflect.getOwnPropertyDescriptor`.
   * Makes `BC_BRAND` and `PROXY_TAG` appear as non-enumerable, non-writable,
   * non-configurable properties (exactly as they are defined on the raw target
   * and on the outer proxy).
   */ getOwnPropertyDescriptor(target, property) {
        if (property === (0, $d205febb791b53ee$export$581775e22cfad3dd) || property === (0, $d205febb791b53ee$export$3bb4a3f4a9646a6a)) return {
            value: true,
            writable: false,
            configurable: false,
            enumerable: false
        };
        return Reflect.getOwnPropertyDescriptor(target, property);
    }
    /**
   * Reflection trap for `Object.keys`, `Object.getOwnPropertyNames`,
   * `Object.getOwnPropertySymbols`, `Reflect.ownKeys`, and JSON.stringify.
   * Hides both the internal brand and the proxy tag so that user-facing
   * enumeration and serialization remain clean.
   */ ownKeys(target) {
        return Reflect.ownKeys(target).filter((k)=>k !== (0, $d205febb791b53ee$export$581775e22cfad3dd) && k !== (0, $d205febb791b53ee$export$3bb4a3f4a9646a6a));
    }
}




const $ed98b948820df6a2$var$keyWords = [
    '_id',
    '_rev',
    '_root'
];
class $ed98b948820df6a2$export$8517d80acf00e19a extends (0, $d205febb791b53ee$export$8517d80acf00e19a) {
    constructor(opts = {}){
        super();
        // Initialize user-provided properties on the raw instance
        Object.entries(opts).forEach(([key, value])=>{
            if ($ed98b948820df6a2$var$keyWords.includes(key)) throw new Error(`Cannot set property ${key}`);
            this[key] = value;
        });
        // Build the two-layer security proxy stack (exactly as in v2)
        const keywordProxy = new Proxy(this, new (0, $952d3bca5034e549$export$b8e7b394f2964d0d)());
        const callProxy = new Proxy(keywordProxy, new (0, $0b77d8afb5886e41$export$f2aa9e51325c9c38)());
        // Register the final (outer) proxy with the security record set
        (0, $fa96f8418385359b$export$e16d8520af44a096)(callProxy);
        // Return the outer proxy to the caller (standard pattern for proxy-based classes)
        return callProxy;
    }
}








function $f94e2696d4b62340$export$bc1ec3784f4ae897(script) {
    const chunks = (0, $9PVwI$script).decompile(script) || [];
    const body = [];
    let contentType = '';
    let i = 0;
    while(chunks[i] !== (0, $9PVwI$opcodes).OP_IF && i < chunks.length)i += 1;
    if (chunks.length <= i) throw new Error('Invalid script');
    if (chunks[i + 1].toString() !== (0, $bd5ff9060a235dd4$export$43182d2709f4c8de)) throw new Error('Invalid ordinal protocol');
    i += 2;
    if (chunks[i] === (0, $9PVwI$opcodes).OP_1) {
        contentType = chunks[i + 1].toString();
        i += 2;
    }
    if (chunks[i] === (0, $9PVwI$opcodes).OP_0) i += 1;
    // now read body chunks
    for(i; i < chunks.length; i += 1)if (chunks[i] !== (0, $9PVwI$opcodes).OP_ENDIF) body.push(chunks[i].toString());
    return {
        contentType: contentType,
        body: body.join('')
    };
}
function $f94e2696d4b62340$export$a0291b2a7af96f4c(witness) {
    if (witness.length < 2) throw new Error('Invalid witness');
    const annex = witness[witness.length - 1].toString('hex') === (0, $bd5ff9060a235dd4$export$7dc90d32bceb5ea5);
    if (witness.length === 2 && annex) throw new Error('Key Path Spend');
    const script = witness[annex ? witness.length - 1 : witness.length - 2];
    return $f94e2696d4b62340$export$bc1ec3784f4ae897(script);
}
function $f94e2696d4b62340$export$36dc4b471c81bcc7(publicKey, contentType, body) {
    const stack = [
        publicKey,
        (0, $9PVwI$opcodes).OP_CHECKSIG,
        (0, $9PVwI$opcodes).OP_0,
        (0, $9PVwI$opcodes).OP_IF,
        (0, $9PVwI$Buffer).from((0, $bd5ff9060a235dd4$export$43182d2709f4c8de)),
        (0, $9PVwI$opcodes).OP_1,
        (0, $9PVwI$Buffer).from(contentType),
        (0, $9PVwI$opcodes).OP_0,
        ...(0, $303220cf0debbf6c$export$b3ab84721822b8ab)(body, (0, $bd5ff9060a235dd4$export$280d845b0ed37876)).map((chunk)=>(0, $9PVwI$Buffer).from(chunk)),
        (0, $9PVwI$opcodes).OP_ENDIF
    ];
    const scrpt = (0, $9PVwI$script).compile(stack);
    return scrpt;
}



class $7e669d424cbb933b$export$7e20c6d567ea8b7a {
    constructor(network = (0, $9PVwI$networks).litecoinregtest){
        this.deployInscription = async (wallet, contentType, body, opts)=>{
            const { restClient: restClient } = wallet;
            const { output: output, witness: witness, redeem: redeem } = this.createPayment(restClient.keyPair, contentType, body);
            this.commitTx = await this.createCommitTx(wallet, output, opts);
            const hex = this.commitTx.extractTransaction().toHex();
            await restClient.rpc('sendrawtransaction', `${hex}`);
            const commitTxId = this.commitTx.extractTransaction().getId();
            this.revealTx = await this.createRevealTx(commitTxId, output, redeem, witness, wallet, opts);
            const revealTx = this.revealTx.extractTransaction();
            await restClient.rpc('sendrawtransaction', `${revealTx.toHex()}`);
        };
        this.createPayment = (keyPair, contentType, body)=>{
            const output = (0, $f94e2696d4b62340$export$36dc4b471c81bcc7)((0, $9PVwI$bip371).toXOnly(keyPair.publicKey), contentType, body);
            const redeem = {
                output: output,
                redeemVersion: 192
            };
            const { output: o, witness: witness } = (0, $9PVwI$payments).p2tr({
                internalPubkey: (0, $9PVwI$bip371).toXOnly(keyPair.publicKey),
                scriptTree: {
                    output: output
                },
                redeem: redeem,
                network: this.network
            });
            return {
                output: o,
                witness: witness,
                redeem: redeem
            };
        };
        this.createCommitTx = async (wallet, output, opts)=>{
            const { commitAmount: commitAmount = wallet.getDustThreshold(false, output), commitFee: commitFee = 0 } = opts || {};
            const commitPsbt = new (0, $9PVwI$Psbt)({
                network: this.network
            });
            const outputString = output?.toString('hex');
            const script = (0, $9PVwI$Buffer).from(outputString, 'hex');
            const value = commitAmount - commitFee;
            commitPsbt.addOutput({
                script: script,
                value: value
            });
            await wallet.fundPsbt(commitPsbt, opts);
            commitPsbt.signAllInputs(wallet.restClient.keyPair);
            commitPsbt.finalizeAllInputs();
            return commitPsbt;
        };
        this.createRevealTx = async (commitTxId, output, redeem, witness, wallet, opts)=>{
            if (witness.length === 0) throw new Error('witness is empty');
            const dust = wallet.getDustThreshold(false, output);
            const { revealAmount: revealAmount = dust, revealFee: revealFee = 0, commitAmount: commitAmount = dust, commitFee: commitFee = 0 } = opts || {};
            const psbt = new (0, $9PVwI$Psbt)({
                network: this.network
            });
            psbt.addInput({
                hash: commitTxId,
                index: 0,
                witnessUtxo: {
                    value: commitAmount - commitFee,
                    script: output
                },
                sequence: 0xffffffff
            });
            psbt.updateInput(0, {
                tapLeafScript: [
                    {
                        leafVersion: redeem.redeemVersion,
                        script: redeem.output,
                        controlBlock: witness[witness.length - 1]
                    }
                ]
            });
            psbt.addOutput({
                value: revealAmount - revealFee,
                address: wallet.address
            });
            await wallet.fundPsbt(psbt);
            psbt.signAllInputs(wallet.restClient.keyPair);
            psbt.finalizeAllInputs();
            return psbt;
        };
        this.network = network;
    }
    get revealTxId() {
        return this.revealTx.extractTransaction().getId();
    }
    get commitTxId() {
        return this.commitTx.extractTransaction().getId();
    }
    static async read(revealTxId, wallet) {
        const revealTx = await (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTxId({
            txId: revealTxId,
            restClient: wallet.restClient
        });
        const scriptBack = (0, $9PVwI$Buffer).from([
            ...revealTx.ins[0].witness[1]
        ]);
        return (0, $f94e2696d4b62340$export$bc1ec3784f4ae897)(scriptBack);
    }
}






/**
 * ================================================================
 * CACHE.TS – HIGH-LEVEL PERSISTENT OBJECT CACHE
 * ================================================================
 *
 * This is the **public-facing persistence layer** of Bitcoin Computer. It sits
 * on top of the pure `Structure` (node-copying engine) and provides a clean,
 * transaction-oriented API for the rest of the library (primarily `Db`).
 *
 * Core responsibilities: • Two-phase apply algorithm (information phase →
 *   pointer phase) → Prevents premature predecessor propagation during nested
 *   object construction. • inRevs ordering invariant: reachable old revs (DFS
 *   from env roots) + unreachable side-predecessors appended. This is
 *   **critical** for correct Bitcoin transaction semantics (see
 *   `refreshStaleSidePredecessors` in db.ts). • Reconstruction with prototype
 *   preservation (so `instanceof` and methods survive). • Explicit Transaction
 *   handles for safe concurrent evaluation and rollback support. • Metadata
 *   attachment (`_rev`, `_id`, `_root`, etc.) via `updateNewNodes`.
 *
 * The implementation follows the node-copying method (Driscoll et al. §2.3 +
 * Karp §2.1) with e=0 and unbounded in-degree via inverse pointer snapshots.
 *
 * @see Structure for the pure node-copying core
 * @see Db for the full evaluation pipeline
 * @internal
 */ /**
 * ================================================================
 * STRUCTURE.TS – PURE NODE-COPYING ENGINE (Driscoll et al. §2.3 + Karp §2.1)
 * ================================================================
 *
 * This is the **minimal, reusable core** of Bitcoin Computer's
 * partially-persistent object graph. It implements the classic node-copying
 * method with e=0 (no extra space per node) and supports unbounded in-degree
 * via inverse-pointer snapshots.
 *
 * Key design decisions: • Only path copying on mutation (no lazy techniques) •
 *   activeVersion + activeNode terminology for maximum clarity • Full rollback
 *   support (used by Cache.refreshStaleSidePredecessors) • Version chain for
 *   O(1) historical access • Inverse snapshots stored only on the target node
 *
 * What this file deliberately does NOT do: • Root tracking (handled by
 *   Cache.txIdToRoots) • VersionState or entryPointers (not needed for e=0) •
 *   Any on-chain or wallet logic (pure in-memory structure)
 *
 * All public APIs use the canonical terms defined in the project:
 *   activeVersion, activeNode, baseNode, queryVersion, etc.
 *
 * @see Cache for the high-level object graph and transaction integration
 * @see Driscoll et al. "Making Data Structures Persistent" §2.3
 * @see Karp "A New Examination of Persistent Data Structures" §2.1
 * @internal
 */ class $d195a3a2ffcd72dd$export$85c928794f8d04d4 {
    constructor(version, information = {}, pointers = {}, inverseSnapshots = [], previous = null, prototype = null){
        /** Predecessor snapshots (ascending by version). Immutable after commit(). */ this.inverseSnapshots = [];
        /** Version chain for cheap traversal (partial persistence). */ this.next = null;
        this.previous = null;
        this.version = version;
        this.information = {
            ...information
        };
        this.pointers = {
            ...pointers
        };
        this.inverseSnapshots = [
            ...inverseSnapshots
        ];
        this.previous = previous;
        this.prototype = prototype;
    }
    /**
   * Creates a shallow activeNode (copy) of this node for a new version and
   * links it into the version chain.
   */ createActiveNode(version) {
        const { information: information, pointers: pointers, prototype: prototype, inverseSnapshots: inverseSnapshots } = this;
        const activeNode = new $d195a3a2ffcd72dd$export$85c928794f8d04d4(version, information, pointers, inverseSnapshots, this, prototype);
        this.next = activeNode;
        return activeNode;
    }
}
const $d195a3a2ffcd72dd$export$264fea50f06efab8 = '_temp';
class $d195a3a2ffcd72dd$export$d981182684770f2a {
    /**
   * Increments version immediately and prepares temporary maps. Must be
   * followed by commit().
   */ beginNewVersion() {
        this.activeVersion++;
        this.activeNodes = new Map();
        this.mutatedNodes.clear();
        return this.activeVersion;
    }
    rollbackActiveVersion(newNodes, mutatedNodes) {
        if (this.activeVersion <= 0) return;
        for (const node of newNodes)if (node.previous) node.previous.next = null;
        for (const succ of mutatedNodes)succ.inverseSnapshots = succ.inverseSnapshots.filter((s)=>s.version !== this.activeVersion);
        this.activeVersion--;
    }
    // ─────────────────────────────────────────────────────────────────────────────────
    // Core node-copying logic
    // ─────────────────────────────────────────────────────────────────────────────────
    getNodeAsOfVersion(node, version) {
        if (version < 0) throw new Error(`Invalid version: ${version}`);
        let current = node;
        while(current.previous !== null && current.version > version)current = current.previous;
        if (current.version > version) return null;
        while(current.next !== null && current.next.version <= version)current = current.next;
        return current;
    }
    /**
   * Finds the most recent activeNode of a node up to (and including) the
   * activeVersion of the structure.
   */ getActiveNode(node) {
        const n = this.getNodeAsOfVersion(node, this.activeVersion);
        if (!n) throw new Error(`No active node exists at or before version ${this.activeVersion}`);
        return n;
    }
    /**
   * Returns inverse pointers (predecessors) for `node` at `queryVersion`.
   * Returns [] if the node did not exist at the queried version.
   *
   * Snapshots are stored in strictly ascending version order (see
   * `assertSnapshotsDescending`). We scan backwards to find the newest snapshot
   * whose version <= queryVersion.
   *
   * History length is typically few entries, so the linear scan is optimal.
   */ getInversePointers(node, queryVersion = this.activeVersion) {
        const queryNode = this.getNodeAsOfVersion(node, queryVersion);
        if (!queryNode) return [];
        const { inverseSnapshots: inverseSnapshots } = queryNode;
        for(let i = inverseSnapshots.length - 1; i >= 0; i--)if (inverseSnapshots[i].version <= queryVersion) return [
            ...inverseSnapshots[i].predecessors
        ];
        return [];
    }
    /**
   * Returns (or creates) the version of `baseNode` that belongs to the
   * **activeVersion** of the structure.
   *
   * - If an activeNode for the activeVersion already exists in `activeNodes`,
   *   it is reused (no extra copying).
   * - If the node is already at the activeVersion, we simply register it.
   * - Otherwise we create a fresh activeNode via `createActiveNode` and
   *   immediately propagate the change to every predecessor that still points
   *   to the baseNode.
   */ getOrCreateActiveNode(baseNode) {
        if (!this.activeNodes) throw new Error('No current maps defined for copying node');
        // Fast path: reuse an existing activeNode created earlier in this version.
        const baseCopy = this.getActiveNode(baseNode);
        let activeNode = this.activeNodes.get(baseCopy);
        if (activeNode) return activeNode;
        // The node is already at the activeVersion → just register it.
        if (baseCopy.version === this.activeVersion) {
            this.activeNodes.set(baseCopy, baseCopy);
            return baseCopy;
        }
        // Create a fresh activeNode for the activeVersion.
        activeNode = baseCopy.createActiveNode(this.activeVersion);
        this.activeNodes.set(baseCopy, activeNode);
        // Every predecessor that still points to the *base* version of this node
        // must now be updated to point to the new activeNode.
        const inversePointers = this.getInversePointers(baseCopy, this.activeVersion);
        for (const { node: predecessorNode, field: field } of inversePointers){
            if (predecessorNode.information[$d195a3a2ffcd72dd$export$264fea50f06efab8] === true) continue;
            const basePred = this.getActiveNode(predecessorNode);
            const activePred = this.activeNodes.get(basePred) || basePred;
            // Only update if the predecessor still points to the *base* version
            if (activePred.pointers[field] === baseCopy) this.applyChanges(activePred, new Map([
                [
                    field,
                    activeNode
                ]
            ]), {});
        }
        return activeNode;
    }
    /**
   * Applies information and/or pointer changes to a node, creating an
   * activeNode if necessary.
   *
   * MUTABILITY CONTRACT (skeleton phase):
   * - information and pointers may ONLY be mutated between beginNewVersion()
   *   and commit() (the "skeleton phase").
   * - After commit(), they become immutable. The only allowed post-commit
   *   mutation is Cache.updateNewNodes (metadata/_rev).
   * - This assertion (dev mode) guarantees the contract and prevents accidental
   *   mutation of historical nodes.
   */ applyChanges(baseNode, pointerChanges = new Map(), informationChanges = {}, deletes = new Set()) {
        const hasChanges = Object.keys(informationChanges).length > 0 || deletes.size > 0 || pointerChanges.size > 0;
        if (!hasChanges) return baseNode;
        if (!this.activeNodes) throw new Error('No current maps defined for version creation');
        if (baseNode.version > this.activeVersion) throw new Error('Cannot modify historical node');
        if (process.env.NODE_ENV !== 'production' && !this.activeNodes) throw new Error('Cannot modify node after commit()');
        const activeNode = this.getOrCreateActiveNode(baseNode);
        // Apply information changes
        for (const [key, value] of Object.entries(informationChanges)){
            delete activeNode.pointers[key];
            activeNode.information[key] = value;
        }
        // Apply deletes
        for (const key of deletes){
            delete activeNode.pointers[key];
            delete activeNode.information[key];
        }
        // Apply pointer changes
        for (const [field, newSuccessor] of pointerChanges){
            if (newSuccessor === null) {
                delete activeNode.pointers[field];
                continue;
            }
            const copiedSuccessor = this.getOrCreateActiveNode(newSuccessor);
            activeNode.pointers[field] = copiedSuccessor;
            delete activeNode.information[field];
        }
        return activeNode;
    }
    /**
   * Finalizes the version, updates all inverse-pointer snapshots, and returns
   * the exact set of mutated successors (for Cache cleanup).
   */ commit() {
        if (!this.activeNodes) throw new Error('No active version');
        this.updateInversePointers();
        this.activeNodes = undefined;
        return Array.from(this.mutatedNodes);
    }
    /**
   * Updates inverse-pointer snapshots for all nodes whose pointers changed in
   * the activeVersion. Snapshots are stored only on the activeNode.
   */ updateInversePointers() {
        const updatedInversesByNode = new Map();
        for (const [baseNode, activeNode] of this.activeNodes){
            this.processDisconnections(baseNode, updatedInversesByNode);
            this.processNewConnections(activeNode, updatedInversesByNode);
        }
        for (const [targetNode, predecessors] of updatedInversesByNode){
            targetNode.inverseSnapshots.push({
                version: this.activeVersion,
                predecessors: predecessors
            });
            this.assertSnapshotsDescending(targetNode);
            this.mutatedNodes.add(targetNode);
        }
    }
    processDisconnections(predecessorNode, updated) {
        for (const [field, oldTarget] of Object.entries(predecessorNode.pointers)){
            if (oldTarget === null) continue;
            const baseTarget = this.getActiveNode(oldTarget);
            const currentInverses = updated.get(baseTarget) ?? [
                ...this.getInversePointers(baseTarget, this.activeVersion - 1)
            ];
            const filtered = currentInverses.filter((inv)=>!(inv.node === predecessorNode && inv.field === field));
            updated.set(baseTarget, filtered);
        }
    }
    processNewConnections(predecessorNode, updated) {
        for (const [field, newTarget] of Object.entries(predecessorNode.pointers)){
            if (newTarget === null) continue;
            const currentInverses = updated.get(newTarget) ?? [
                ...this.getInversePointers(newTarget, this.activeVersion - 1)
            ];
            currentInverses.push({
                node: predecessorNode,
                field: field
            });
            updated.set(newTarget, currentInverses);
        }
    }
    assertSnapshotsDescending(node) {
        if (process.env.NODE_ENV === 'production') return;
        const h = node.inverseSnapshots;
        for(let i = 1; i < h.length; i++){
            if (h[i].version <= h[i - 1].version) throw new Error(`inverseSnapshots not strictly ascending on node v${node.version} ` + `(found ${h[i].version} <= ${h[i - 1].version})`);
        }
    }
    constructor(){
        this.activeVersion = 0;
        this.mutatedNodes = new Set();
    }
}



// ─────────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS (pure utility functions)
// ─────────────────────────────────────────────────────────────────────────────────
/**
 * Safe map getter that throws a descriptive error if the key is missing. Used
 * everywhere we expect a node/rev to exist after a cache lookup.
 */ function $703356805bc7d6e8$var$getOrThrow(map, key, message) {
    const value = map.get(key);
    if (value === undefined) throw new Error(message);
    return value;
}
const $703356805bc7d6e8$var$isPrimitiveInformationValue = (val)=>val == null || [
        'string',
        'number',
        'boolean',
        'bigint'
    ].includes(typeof val);
const $703356805bc7d6e8$var$isInformationValue = (val)=>$703356805bc7d6e8$var$isPrimitiveInformationValue(val) || Array.isArray(val) && val.every($703356805bc7d6e8$var$isInformationValue);
/**
 * Deep equality for information values (used to detect real changes). Handles
 * primitives, arrays, and null/undefined.
 */ const $703356805bc7d6e8$var$isEqualInformation = (a, b)=>a === b || Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i)=>$703356805bc7d6e8$var$isEqualInformation(item, b[i]));
const $703356805bc7d6e8$var$deepCloneInformationValue = (val)=>$703356805bc7d6e8$var$isPrimitiveInformationValue(val) ? val : Array.isArray(val) ? val.map($703356805bc7d6e8$var$deepCloneInformationValue) : val;
/**
 * Metadata keys used throughout the cache. Single source of truth to prevent
 * magic strings.
 */ const $703356805bc7d6e8$var$META = {
    REV: '_rev',
    TEMP: '_temp',
    ARRAY_FLAG: '_array'
};
class $703356805bc7d6e8$export$94affb487e701bf2 {
    constructor(){
        this.txIdToRoots = new Map();
        /** String-keyed map for 100% white-box test compatibility */ this.activeTransactions = new Map();
        this.latestTransactionId = null;
        this.structure = new (0, $d195a3a2ffcd72dd$export$d981182684770f2a)();
        this.revToNode = new Map();
    }
    // ───────────────────────────────────────────────────────────────────────
    // Traversal helpers (used by reconstruction and inRevs computation)
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Returns every node reachable via forward pointers OR via non-TEMP inverse
   * pointers. This is the **single source of truth** for "which objects belong
   * to the new version" after commit().
   */ getBidirectionalNeighbors(node) {
        const forwards = Object.values(node.pointers).filter((p)=>p !== null);
        const backwards = this.structure.getInversePointers(node).map(({ node: pred })=>pred).filter((p)=>p !== null && !p.information[$703356805bc7d6e8$var$META.TEMP]);
        return [
            ...new Set([
                ...forwards,
                ...backwards
            ])
        ];
    }
    /**
   * Forward-only traversal used exclusively when computing reachable old revs
   * from the environment (for the inRevs invariant).
   */ getForwardNeighbors(node) {
        return Object.values(node.pointers).filter((p)=>p !== null);
    }
    /**
   * Collects every reachable object (including nested pointers and arrays) from
   * the input forest. Used as the input to the two-phase apply.
   */ collectReachableObjects(forest) {
        const isObject = ([k, v])=>k !== $703356805bc7d6e8$var$META.REV && typeof v === 'object' && v !== null && !$703356805bc7d6e8$var$isInformationValue(v);
        return (0, $303220cf0debbf6c$export$8f528bb63005ed51)(forest, (current)=>Object.entries(current).filter(isObject).map(([, v])=>v));
    }
    /**
   * Discover all nodes created **exactly** at the current version using
   * bidirectional DFS. This includes both new roots and all propagated
   * predecessor copies.
   */ discoverNewNodes(roots, version) {
        return (0, $303220cf0debbf6c$export$8f528bb63005ed51)([
            ...roots
        ], this.getBidirectionalNeighbors.bind(this)).filter((n)=>n.version === version);
    }
    // ───────────────────────────────────────────────────────────────────────
    // Change computation & two-phase apply
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Computes the minimal set of information changes, deletes, and pointer
   * changes for every reachable object.
   *
   * This is the "diff" step that drives the two-phase algorithm.
   */ computeChanges(reachableObjects) {
        const changes = new Map();
        for (const obj of reachableObjects){
            const rev = obj[$703356805bc7d6e8$var$META.REV];
            const oldNode = rev ? this.revToNode.get(rev) : undefined;
            if (rev && !oldNode) throw new Error(`Node not found for rev ${rev}`);
            const isArray = Array.isArray(obj);
            const oldIsArray = oldNode?.information[$703356805bc7d6e8$var$META.ARRAY_FLAG] === true;
            const currentInfoKeys = [];
            const currentPointerKeys = [];
            for (const [key, value] of Object.entries(obj)){
                if (key === $703356805bc7d6e8$var$META.REV) continue;
                if ($703356805bc7d6e8$var$isInformationValue(value)) currentInfoKeys.push(key);
                else currentPointerKeys.push(key);
            }
            const deletes = new Set();
            if (oldNode) {
                const oldInfoKeys = new Set(Object.keys(oldNode.information));
                oldInfoKeys.delete($703356805bc7d6e8$var$META.ARRAY_FLAG);
                oldInfoKeys.delete($703356805bc7d6e8$var$META.REV);
                for (const oldKey of oldInfoKeys)if (!currentInfoKeys.includes(oldKey)) deletes.add(oldKey);
                if (oldIsArray && !isArray) deletes.add($703356805bc7d6e8$var$META.ARRAY_FLAG);
            }
            const infoChanges = {};
            if (!oldIsArray && isArray) infoChanges[$703356805bc7d6e8$var$META.ARRAY_FLAG] = true;
            for (const key of currentInfoKeys){
                const oldValue = oldNode?.information[key];
                const newValue = obj[key];
                if (oldValue === undefined || !$703356805bc7d6e8$var$isEqualInformation(oldValue, newValue)) infoChanges[key] = newValue;
            }
            changes.set(obj, {
                isArray: isArray,
                pointerFields: currentPointerKeys,
                infoChanges: infoChanges,
                deletes: deletes,
                oldPointerKeys: oldNode ? Object.keys(oldNode.pointers) : [],
                oldNode: oldNode
            });
        }
        return changes;
    }
    /**
   * Phase 1 – Information phase.
   *
   * Creates/updates nodes with **all** information-field changes (including
   * deletes and the _array flag). No pointer work is done yet, so we never
   * trigger premature predecessor propagation.
   */ applyInformationPhase(reachableObjects, changesMap) {
        const inputObjToCurrentNode = new Map();
        for (const inputObj of reachableObjects){
            const { infoChanges: infoChanges, deletes: deletes, oldNode: oldNode, isArray: isArray } = changesMap.get(inputObj);
            const baseNode = oldNode || new (0, $d195a3a2ffcd72dd$export$85c928794f8d04d4)(this.structure.activeVersion);
            const currentNode = this.structure.applyChanges(baseNode, new Map(), infoChanges, deletes);
            if (!isArray && !currentNode.prototype) currentNode.prototype = Object.getPrototypeOf(inputObj);
            inputObjToCurrentNode.set(inputObj, currentNode);
        }
        return inputObjToCurrentNode;
    }
    /**
   * Phase 2 – Pointer phase.
   *
   * Now that every node exists at the current version, we apply pointer
   * changes. This is where `getOrCreateActiveNode` + predecessor propagation
   * happens.
   */ applyPointerPhase(reachableObjects, changesMap, inputObjToCurrentNode) {
        for (const inputObj of reachableObjects){
            const ch = changesMap.get(inputObj);
            const { pointerFields: pointerFields, oldPointerKeys: oldPointerKeys, oldNode: oldNode } = ch;
            const currentNode = inputObjToCurrentNode.get(inputObj);
            const pointerChanges = new Map();
            const oldPointers = oldNode?.pointers ?? {};
            // Collect pointer *updates* – only when the target node actually changed
            for (const key of pointerFields){
                const newTargetNode = inputObjToCurrentNode.get(inputObj[key]);
                const oldTarget = oldPointers[key] ?? null;
                const oldLatestTarget = oldTarget ? this.structure.getActiveNode(oldTarget) : null;
                if (newTargetNode !== oldLatestTarget) pointerChanges.set(key, newTargetNode);
            }
            // Collect *deletions* – any old pointer key that no longer exists
            for (const key of oldPointerKeys)if (!pointerFields.includes(key)) pointerChanges.set(key, null);
            if (pointerChanges.size > 0) this.structure.applyChanges(currentNode, pointerChanges, {});
        }
    }
    // ───────────────────────────────────────────────────────────────────────
    // Core version creation (the heart of the cache)
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Creates a new version from a forest of objects. Returns only the data
   * needed immediately by `Db`, while the full context is kept in
   * `activeTransactions` for later commit/rollback.
   */ createVersion(forest) {
        this.validateForest(forest);
        const reachableObjects = this.collectReachableObjects(forest);
        const changes = this.computeChanges(reachableObjects);
        const version = this.structure.beginNewVersion();
        // These must stay in scope for the rollback in the catch block
        let newNodesOrdered = [];
        let mutatedNodes = [];
        let inputObjToCurrentNode;
        let roots = [];
        let nodeToObj;
        try {
            // Phase 1: information fields (including _array flag) + deletes
            inputObjToCurrentNode = this.applyInformationPhase(reachableObjects, changes);
            // Phase 2: pointer changes + predecessor propagation
            this.applyPointerPhase(reachableObjects, changes, inputObjToCurrentNode);
            // Finalize the structure (updates all inverse-pointer snapshots)
            mutatedNodes = this.structure.commit();
            // After commit(), ensure every reference in the map points to the final
            // active node at the current version (important after any internal
            // copying)
            for (const inputObj of reachableObjects){
                const current = inputObjToCurrentNode.get(inputObj);
                const active = this.structure.getActiveNode(current);
                inputObjToCurrentNode.set(inputObj, active);
            }
            roots = forest.map((r)=>inputObjToCurrentNode.get(r));
            // Discover every node created exactly at this version
            newNodesOrdered = this.discoverNewNodes(roots, version);
            // Reconstruct the full JavaScript object graph from the root nodes
            const { nodeToObj: reconstructedNodeToObj } = this.reconstruct(roots);
            nodeToObj = reconstructedNodeToObj;
            const { array: array, oldRevs: oldRevs } = this.buildNewObjects(newNodesOrdered, nodeToObj);
            const oldEnvRevs = this.extractOldEnvRevs(forest[0]);
            const inRevs = this.computeInRevs(oldRevs, oldEnvRevs);
            return {
                version: version,
                roots: roots,
                newNodesOrdered: newNodesOrdered,
                mutatedNodes: mutatedNodes,
                nodeToObj: nodeToObj,
                inputObjToCurrentNode: inputObjToCurrentNode,
                array: array,
                oldRevs: oldRevs,
                inRevs: inRevs
            };
        } catch (e) {
            this.structure.rollbackActiveVersion(newNodesOrdered, mutatedNodes);
            throw e;
        }
    }
    // ───────────────────────────────────────────────────────────────────────
    // Transaction Handle Factory
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Creates a public Transaction handle that owns a version context. The handle
   * provides explicit `commit` and `rollback` methods and automatic cleanup via
   * `Symbol.dispose`.
   */ createTransactionHandle(ctx) {
        const id = `bc-tx-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        let finalized = false;
        const handle = {
            array: ctx.array,
            oldRevs: ctx.oldRevs,
            inRevs: ctx.inRevs,
            id: id,
            commit: (txId)=>{
                if (finalized) throw new Error(`Transaction ${id} already finalized`);
                if (!this.activeTransactions.has(id)) return;
                this.finalizeCommit(ctx, txId);
                finalized = true;
                this._cleanup(id);
            },
            rollback: ()=>{
                if (finalized) return;
                if (!this.activeTransactions.has(id)) return;
                this.structure.rollbackActiveVersion(ctx.newNodesOrdered, ctx.mutatedNodes);
                finalized = true;
                this._cleanup(id);
            }
        };
        // Safari-safe: only attach when supported
        if (typeof Symbol.dispose !== 'undefined') handle[Symbol.dispose] = ()=>handle.rollback();
        this.activeTransactions.set(id, ctx);
        this.latestTransactionId = id;
        return handle;
    }
    finalizeCommit(ctx, txId) {
        this.remapRevisions(txId, ctx.newNodesOrdered);
        this.txIdToRoots.set(txId, ctx.roots);
        for (const [node, obj] of ctx.nodeToObj)obj._rev = node.information[$703356805bc7d6e8$var$META.REV];
    }
    _cleanup(id) {
        this.activeTransactions.delete(id);
        if (this.latestTransactionId === id) this.latestTransactionId = null;
    }
    // ───────────────────────────────────────────────────────────────────────
    // Public API
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Begins a new version from a forest of objects. Returns a Transaction handle
   * that must be committed or rolled back.
   */ beginVersion(forest) {
        const ctx = this.createVersion(forest);
        return this.createTransactionHandle(ctx);
    }
    /**
   * Returns the latest reconstructed objects for the given revisions. Throws if
   * any revision does not exist.
   */ getByRev(revs) {
        if (!revs.every((r)=>typeof r === 'string')) throw new Error('Invalid revision format');
        const parsed = revs.map((r)=>r.split(':'));
        if (parsed.some((p)=>p.length !== 2)) throw new Error('Invalid revision format');
        if (parsed.some(([, num])=>isNaN(parseInt(num, 10)))) throw new Error('Invalid revision number');
        const nodes = revs.map((rev)=>$703356805bc7d6e8$var$getOrThrow(this.revToNode, rev, `Node does not exist for ${rev}`));
        return this.reconstruct(nodes).reconstructed;
    }
    /**
   * Returns the reconstructed objects for a given transaction ID. Throws if the
   * transaction was never committed.
   */ getByTxId(txId) {
        const roots = $703356805bc7d6e8$var$getOrThrow(this.txIdToRoots, txId, `Version ${txId} does not exist`);
        return this.reconstruct(roots).reconstructed;
    }
    // ───────────────────────────────────────────────────────────────────────
    // Reconstruction & final remapping
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Creates a plain JavaScript object (or array) from a node. Clones
   * information values and respects the original prototype.
   */ createObjFromNode(node) {
        const { [$703356805bc7d6e8$var$META.ARRAY_FLAG]: isArrayFlag, [$703356805bc7d6e8$var$META.TEMP]: temp, ...rest } = node.information;
        const proto = isArrayFlag ? Array.prototype : node.prototype || Object.prototype;
        const obj = isArrayFlag ? [] : Object.create(proto);
        for (const [key, val] of Object.entries(rest))obj[key] = $703356805bc7d6e8$var$deepCloneInformationValue(val);
        return obj;
    }
    /**
   * Reconstructs the full JavaScript object graph from a set of root nodes.
   * Returns both the root objects and a node → object map for pointer wiring.
   */ reconstruct(roots) {
        const ordered = (0, $303220cf0debbf6c$export$8f528bb63005ed51)([
            ...roots
        ], this.getBidirectionalNeighbors.bind(this));
        const nodeToObj = new Map(ordered.map((n)=>[
                n,
                this.createObjFromNode(n)
            ]));
        for (const [node, obj] of nodeToObj)for (const [k, successor] of Object.entries(node.pointers))obj[k] = successor === null ? null : nodeToObj.get(successor);
        return {
            reconstructed: roots.map((r)=>nodeToObj.get(r)),
            nodeToObj: nodeToObj
        };
    }
    /**
   * Assigns final `_rev` values using the real transaction ID. Called exactly
   * once during commit.
   */ remapRevisions(txId, nodes) {
        let nodeNum = -1;
        for (const node of nodes){
            if (node.information[$703356805bc7d6e8$var$META.ARRAY_FLAG] === true) continue;
            const num = nodeNum.toString();
            nodeNum++;
            const newRev = `${txId}:${num}`;
            node.information[$703356805bc7d6e8$var$META.REV] = newRev;
            this.revToNode.set(newRev, node);
        }
    }
    /**
   * Shared helper that builds both the public `array` and `oldRevs`. Filters
   * out internal _array and _temp nodes.
   */ buildNewObjects(newNodesOrdered, nodeToObj) {
        const isPersistentObjectNode = (n)=>!n.information[$703356805bc7d6e8$var$META.ARRAY_FLAG] && !n.information[$703356805bc7d6e8$var$META.TEMP];
        const newObjectNodesInOrder = newNodesOrdered.filter(isPersistentObjectNode);
        return {
            array: newObjectNodesInOrder.map((n)=>nodeToObj.get(n)),
            oldRevs: newObjectNodesInOrder.map(({ previous: previous })=>previous?.information[$703356805bc7d6e8$var$META.REV])
        };
    }
    // ───────────────────────────────────────────────────────────────────────
    // Validation & environment helpers
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Strict validation of the input forest (exactly what `Db` passes). Prevents
   * sparse arrays and primitive roots.
   */ validateForest(forest) {
        if ($703356805bc7d6e8$var$META.REV in forest) throw new Error('Arrays cannot have _rev property');
        const numericKeys = Object.keys(forest).filter((k)=>/^[0-9]+$/.test(k));
        if (numericKeys.length !== forest.length || !numericKeys.every((k, i)=>Number(k) === i)) throw new Error('Sparse arrays not supported');
        const isPrimitiveOrNull = (e)=>typeof e !== 'object' && typeof e !== 'function' || e === null;
        if (forest.some(isPrimitiveOrNull)) throw new Error('Root elements must be objects (including arrays)');
    }
    /**
   * Extracts old revision strings from the special `_temp` effect root that
   * `Db` passes to us.
   */ extractOldEnvRevs(effectObj) {
        if (!effectObj || typeof effectObj !== 'object') return [];
        return Object.keys(effectObj).filter((k)=>k.startsWith('env_') && effectObj[k] !== null).map((k)=>effectObj[k][$703356805bc7d6e8$var$META.REV]).filter(Boolean);
    }
    /**
   * Computes inRevs exactly as required by the Bitcoin Computer transaction
   * model: reachable revs from the environment (in DFS order) followed by any
   * unreachable old root revs (side-predecessors).
   *
   * This ordering is **critical** for correct propagation of stale
   * side-predecessors during `refreshStaleSidePredecessors`.
   */ computeInRevs(oldRevs, oldEnvRevs) {
        const oldRootNodes = oldEnvRevs.map((rev)=>$703356805bc7d6e8$var$getOrThrow(this.revToNode, rev, `rev ${rev} missing`));
        const reachableOrdered = (0, $303220cf0debbf6c$export$8f528bb63005ed51)(oldRootNodes, this.getForwardNeighbors.bind(this)).map((n)=>n.information[$703356805bc7d6e8$var$META.REV]).filter((rev)=>rev !== undefined && oldRevs.includes(rev));
        const unreachableOldRevs = oldRevs.filter((rev)=>rev && !reachableOrdered.includes(rev));
        return [
            ...reachableOrdered,
            ...unreachableOldRevs
        ];
    }
    // ───────────────────────────────────────────────────────────────────────
    // Additional public API
    // ───────────────────────────────────────────────────────────────────────
    /**
   * Allows mutation of information fields of newly-created nodes. Used by
   * `Db.attachMetadata` after transaction construction.
   */ updateNewNodes(f) {
        const nodesToUpdate = this.latestTransactionId && this.activeTransactions.has(this.latestTransactionId) ? this.activeTransactions.get(this.latestTransactionId).newNodesOrdered : (()=>{
            const latestNumeric = this.structure.activeVersion;
            const roots = Array.from(this.txIdToRoots.values()).pop() ?? [];
            return this.discoverNewNodes(roots, latestNumeric);
        })();
        for (const node of nodesToUpdate){
            const obj = this.createObjFromNode(node);
            f(obj);
            for (const key of Object.keys(obj))if (key !== $703356805bc7d6e8$var$META.REV && $703356805bc7d6e8$var$isInformationValue(obj[key])) {
                node.information[key] = obj[key];
                delete node.pointers[key];
            }
        }
    }
    pruneTxId(label) {
        this.txIdToRoots.delete(label);
    }
    /**
   * Returns whether a revision still has any non-_temp predecessors. Used by
   * `Db` to decide whether a pointee needs to be copied.
   */ hasInversePointers(rev) {
        const msg = 'Trying to retrieve inverse pointers of node that does not exist';
        const node = $703356805bc7d6e8$var$getOrThrow(this.revToNode, rev, msg);
        return this.structure.getInversePointers(node).some(({ node: pred })=>!pred.information[$703356805bc7d6e8$var$META.TEMP]);
    }
}



class $bfd727fd88a0b35a$export$6d8228690abc2da8 {
    static{
        this.cache = new (0, $703356805bc7d6e8$export$94affb487e701bf2)();
    }
    static async deploy(ept, wallet, opts) {
        if (wallet.restClient.moduleStorageType === 'multisig') {
            const _owners = [
                wallet.publicKey.toString('hex')
            ];
            const outScriptBuf = (0, $8636fd77165bd4bc$export$50e49a79004f0f9)(_owners, wallet.restClient);
            const update = new (0, $9723fb8a051ef3ce$export$489a84f048b0ef8)({
                ownerData: [
                    {
                        outScriptBuf: outScriptBuf
                    }
                ],
                transition: new (0, $9ca517853ec47831$export$be58926105124dd4)({
                    exp: ept,
                    env: {},
                    mod: undefined,
                    sourceType: 'module'
                })
            });
            const [rev] = await update.broadcast(wallet);
            return (0, $d205febb791b53ee$export$1c4cfbb3206db243)(rev);
        }
        const tx = new (0, $7e669d424cbb933b$export$7e20c6d567ea8b7a)((0, $303220cf0debbf6c$export$de754bb4cdcc210c)(wallet.chain, wallet.network));
        await tx.deployInscription(wallet, 'text/javascript', ept, opts);
        return `${tx.revealTxId}:0`;
    }
    static async load(rev, wallet) {
        const importHook = async (spec)=>{
            const { txId: txId } = (0, $303220cf0debbf6c$export$caebc656d3686561)(spec);
            let sourceCode;
            try {
                const reconstructed = $bfd727fd88a0b35a$export$6d8228690abc2da8.cache.getByRev([
                    `${txId}:-1`
                ]);
                sourceCode = reconstructed[0].source;
            } catch (error) {
                if (!error.message.startsWith('Node does not exist')) throw error;
                // Fetch from blockchain based on storage type
                const { restClient: restClient } = wallet;
                if (restClient.moduleStorageType === 'multisig') {
                    const { ioDescriptor: ioDescriptor, outs: outs } = await (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTxId({
                        txId: txId,
                        restClient: restClient
                    });
                    const [, maxOwnerIndex, maxDataIndex] = ioDescriptor;
                    const dataOutputs = outs.slice(maxOwnerIndex, maxDataIndex);
                    const txData = (0, $8636fd77165bd4bc$export$6a94e91b2ef1d7f1)(dataOutputs.map((out)=>out.script));
                    const json = JSON.parse(txData);
                    sourceCode = json.exp;
                } else {
                    const { body: body } = await (0, $7e669d424cbb933b$export$7e20c6d567ea8b7a).read(txId, wallet);
                    sourceCode = body;
                }
                // Cache the source code
                const moduleObj = {
                    source: sourceCode
                };
                const handle = $bfd727fd88a0b35a$export$6d8228690abc2da8.cache.beginVersion([
                    moduleObj
                ]);
                handle.commit(txId);
            }
            return new (0, $9PVwI$StaticModuleRecord)(sourceCode, spec);
        };
        const resolveHook = (spec)=>spec;
        const compartment = new Compartment({
            Contract: $ed98b948820df6a2$export$8517d80acf00e19a
        }, {}, {
            resolveHook: resolveHook,
            importHook: importHook
        });
        const { namespace: namespace } = await compartment.import(rev);
        return namespace;
    }
}













const { OPS: $287a3b2e2915d9e2$var$OPS } = (0, $9PVwI$script);
const { SIGHASH_ALL: $287a3b2e2915d9e2$var$SIGHASH_ALL } = (0, $9PVwI$Transaction);
(0, $9PVwI$initEccLib)($9PVwI$bitcoincomputersecp256k1);
class $287a3b2e2915d9e2$export$bcca3ea514774656 {
    constructor(params = {}){
        this.fetchUtxo = async ({ rev: rev })=>{
            const { txId: txId, outputIndex: outputIndex } = (0, $303220cf0debbf6c$export$caebc656d3686561)(rev);
            let fetched;
            try {
                fetched = await this.restClient.getTx(txId);
            } catch (e) {
                // TODO verify if this is correct
                throw new Error(`Error ${e.message}. Utxo ${txId} not found`);
            }
            const nonWitnessUtxo = (0, $9PVwI$Buffer).from(fetched.txHex, 'hex');
            return {
                hash: txId,
                index: outputIndex,
                nonWitnessUtxo: nonWitnessUtxo
            };
        };
        this.getOutputSpent = async (input)=>{
            const { hash: hash, index: index } = input;
            const { restClient: restClient } = this;
            const txId = (0, $303220cf0debbf6c$export$577f793df735f4a1)(hash);
            const tx = await (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTxId({
                txId: txId,
                restClient: restClient
            });
            return tx.outs[index];
        };
        this.getInputSatoshis = async (tx)=>{
            const outputsSpent = await Promise.all(tx.ins.map(this.getOutputSpent));
            return outputsSpent.reduce((acc, cur)=>acc + cur.value, 0n);
        };
        this.getOutputSatoshis = (tx)=>{
            return tx.outs.reduce((acc, cur)=>acc + cur.value, 0n);
        };
        this.restClient = new (0, $fdb3572e52dbf02d$export$ea8b5b3aea9558ce)(params);
    }
    faucet(amount, address = this.address) {
        return this.restClient.faucet(address, amount);
    }
    derive(subpath = '0') {
        const path = `${this.path}${this.path.length > 0 ? '/' : ''}${subpath}`;
        const { chain: chain, network: network, bcn: bcn, mnemonic: mnemonic, passphrase: passphrase } = this.restClient;
        const { url: url } = bcn;
        return new $287a3b2e2915d9e2$export$bcca3ea514774656({
            chain: chain,
            network: network,
            url: url,
            mnemonic: mnemonic,
            path: path,
            passphrase: passphrase
        });
    }
    async getBalance(address = this.address) {
        return this.restClient.getBalance(address);
    }
    async getUtxos(address = this.address) {
        console.log('getUtxos is deprecated. Please use this.getUTXOs({ address, isObject: false }) instead.');
        const res = await this.restClient.getUTXOs({
            address: address,
            verbosity: 1,
            isObject: false
        });
        return res.map((utxo)=>({
                txId: (0, $303220cf0debbf6c$export$caebc656d3686561)(utxo.rev).txId,
                vout: (0, $303220cf0debbf6c$export$caebc656d3686561)(utxo.rev).outputIndex,
                satoshis: utxo.satoshis,
                rev: utxo.rev,
                address: utxo.address,
                height: utxo.blockHeight
            }));
    }
    /**
   * Computes the dust threshold like the Bitcoin C++ implementation.
   *
   * A typical spendable bare multisig output is 37 bytes big, and will later need an input of at least
   * 148 bytes to spend. An output is considered dust if its amount is less than 185*DUST_RELAY_TX_FEE/1000
   * satoshis.
   *
   * In BTC the default dust fee relay rate is 3000 sat/kvB, and in LTC 30'000 sat/kvB. Therefore,
   * the min non dust amount per output for bare multisig scripts is 582 satoshis in BTC and 5820
   * in LTC.
   * https://github.com/bitcoin/bitcoin/blob/bf0cb4399061c6827bd5d7428a146010102d7ab1/src/policy/policy.cpp#L26
   */ getDustThreshold(isWitnessProgram, script) {
        if (this.restClient.chain === 'PEPE') return 1940000;
        let size = script ? script.length + 9 : 114 // 114 is the size of a 1-of-3 bare multisig script
        ;
        if (script && isWitnessProgram) size += 37 + 107 / (0, $bd5ff9060a235dd4$export$4bc394cb084a3624) + 4;
        else size += 148 // the 148 mentioned above
        ;
        const dustRelayPerByte = this.restClient.dustRelayTxFee / 1000;
        return Math.ceil(dustRelayPerByte * size);
    }
    getSigOpCount(script) {
        const chunks = (0, $9PVwI$script).decompile(script);
        if (!chunks) return 0;
        let n = 0;
        let lastOpCode = 'OP_INVALIDOPCODE';
        for(let i = 0; i < chunks.length; i += 1){
            const opCode = chunks[i];
            if (opCode === $287a3b2e2915d9e2$var$OPS.OP_CHECKSIG || opCode === $287a3b2e2915d9e2$var$OPS.OP_CHECKSIGVERIFY) n += 1;
            else if (opCode === $287a3b2e2915d9e2$var$OPS.OP_CHECKMULTISIG || opCode === $287a3b2e2915d9e2$var$OPS.OP_CHECKMULTISIGVERIFY) {
                if ($287a3b2e2915d9e2$var$OPS[lastOpCode] >= $287a3b2e2915d9e2$var$OPS.OP_1 && $287a3b2e2915d9e2$var$OPS[lastOpCode] <= $287a3b2e2915d9e2$var$OPS.OP_16) n += lastOpCode.charCodeAt(3) - '0'.charCodeAt(0);
                else n += (0, $bd5ff9060a235dd4$export$4266a5deb789e6a0);
            }
            lastOpCode = opCode.toString();
        }
        return n;
    }
    async getLegacySigOpCount(tx) {
        let nSigOps = 0;
        for(let i = 0; i < tx.ins.length; i += 1){
            const prevOutput = await this.getOutputSpent(tx.ins[i]);
            nSigOps += this.getSigOpCount(prevOutput.script);
        }
        for(let i = 0; i < tx.outs.length; i += 1)nSigOps += this.getSigOpCount(tx.outs[i].script);
        return nSigOps;
    }
    async getTransactionSigOpCost(tx) {
        return await this.getLegacySigOpCount(tx) * (0, $bd5ff9060a235dd4$export$4bc394cb084a3624);
    }
    async getUtxosWithOpts({ include: include = [], exclude: exclude = [] } = {}) {
        let utxos = await this.restClient.getUTXOs({
            address: this.address,
            verbosity: 1,
            isObject: false
        });
        (0, $303220cf0debbf6c$export$448332262467e042)(utxos);
        // Build includeUtxos array from include array
        const includeSet = new Set(include);
        const includeUtxos = utxos.filter((utxo)=>includeSet.has(utxo.rev));
        if (includeUtxos.length !== include.length) throw new Error('Include utxos not found');
        // Remove utxos that must be excluded, and those that will be included at the beginning of the utxos set
        const toFilter = new Set([
            ...include,
            ...exclude
        ]);
        utxos = utxos.filter((utxo)=>!toFilter.has(utxo.rev));
        // Append utxos that will be included at the beginning of the utxos set
        return includeUtxos.concat(utxos);
    }
    checkFee(fee, size) {
        const feePerByte = fee / size;
        const feeErrorPercentage = Math.abs(1 - feePerByte / this.restClient.satPerByte) * 100;
        if (feeErrorPercentage > (0, $bd5ff9060a235dd4$export$a1be5b5a5ff3a4a1)) throw new Error(`Fee error, please try again with a different "satPerByte" parameter.`);
    }
    getTxSize(txSize, nSigOpCost, bytesPerSigOp) {
        return Math.round((Math.max(txSize, nSigOpCost * bytesPerSigOp) + (0, $bd5ff9060a235dd4$export$4bc394cb084a3624) - 1) / (0, $bd5ff9060a235dd4$export$4bc394cb084a3624));
    }
    estimatePsbtSize(tx) {
        // Estimate the size with a mock transaction
        const clone = tx.clone();
        // force add a change output
        clone.addOutput({
            address: this.address,
            value: this.getDustThreshold(false)
        });
        clone.signAllInputs(this.restClient.keyPair);
        clone.finalizeAllInputs();
        return clone.extractTransaction(true).virtualSize();
    }
    async fundPsbt(tx, opts) {
        const { restClient: restClient, address: address } = this;
        const inputAmount = tx.inputsAmount;
        const outputAmount = tx.outputsAmount;
        const minNonDustAmount = this.getDustThreshold(false);
        const utxos = await this.getUtxosWithOpts(opts);
        // fulfill the outputs
        let missingAmount = outputAmount - inputAmount + minNonDustAmount;
        while(missingAmount > 0){
            const utxo = utxos.splice(0, 1)[0];
            if (!utxo) throw new Error(`Insufficient balance in address ${address}. Missing ${missingAmount} satoshis.`);
            const utxoInputs = await this.fetchUtxo(utxo);
            if (!utxoInputs) throw new Error('Utxo not found');
            tx.addInput(utxoInputs);
            const estimatedFee = this.estimatePsbtSize(tx) * restClient.satPerByte;
            missingAmount = tx.outputsAmount + estimatedFee - tx.inputsAmount + minNonDustAmount;
        }
        const estimateSize = this.estimatePsbtSize(tx);
        const requiredFee = estimateSize * restClient.satPerByte;
        const inputAmountAfter = tx.inputsAmount;
        // This are the fees we would pay if the change output has minNonDustAmount
        const feesAssumingMinNonDustChangeAmount = inputAmountAfter - outputAmount;
        // if the fee is too high, add a change output
        const missingFee = feesAssumingMinNonDustChangeAmount - requiredFee;
        if (missingFee > 0) tx.addOutput({
            address: address,
            value: Math.round(missingFee)
        });
        // checkFees (todo: check if the below is necessary)
        const finalPsbt = tx.clone();
        finalPsbt.signAllInputs(restClient.keyPair);
        finalPsbt.finalizeAllInputs();
        const finalSize = finalPsbt.extractTransaction().virtualSize();
        const finalFee = finalPsbt.inputsAmount - finalPsbt.outputsAmount;
        this.checkFee(finalFee, finalSize);
    }
    async estimateSize(tx) {
        const clone = tx.clone();
        const changeScript = (0, $9PVwI$address).toOutputScript(this.address, this.restClient.networkObj);
        const minNonDustSatoshis = this.getDustThreshold(false, changeScript);
        clone.addOutput(changeScript, BigInt(minNonDustSatoshis));
        await this.sign(clone);
        const sigOpCost = this.getTxSize(clone.virtualSize(), await this.getTransactionSigOpCost(clone), (0, $bd5ff9060a235dd4$export$b3bf7f8ed07f5d46));
        return Math.max(clone.virtualSize(), sigOpCost);
    }
    async estimateFee(tx) {
        const size = await this.estimateSize(tx);
        return size * this.restClient.satPerByte;
    }
    /**
   * Given a transaction with inputs and outputs containing data, this function
   * adds extra inputs to fund the transaction and possibly an change output.
   * The options are:
   * * include: an array of revisions to be included in order as inputs
   * * exclude: an array of revisions to be excluded in order as inputs
   */ async fund(tx, opts) {
        const { restClient: restClient, address: address } = this;
        const { chain: chain, network: network } = restClient;
        const networkObj = (0, $303220cf0debbf6c$export$de754bb4cdcc210c)(chain, network);
        const inputSatoshis = await this.getInputSatoshis(tx);
        const utxos = await this.getUtxosWithOpts(opts);
        // Always add a change output
        const changeScript = (0, $9PVwI$address).toOutputScript(address.toString(), networkObj);
        const minNonDustSatoshis = this.getDustThreshold(false, changeScript);
        tx.addOutput(changeScript, 0n);
        const changeOutputIndex = tx.outs.length - 1;
        // Add the inputs
        let inputSatoshisAfter = inputSatoshis;
        let requiredFee = await this.estimateFee(tx);
        let missingSatoshis = this.getOutputSatoshis(tx) + BigInt(requiredFee) - inputSatoshis;
        while(missingSatoshis > 0){
            const utxo = utxos.splice(0, 1)[0];
            if (!utxo) throw new Error(`Insufficient balance in address ${address}. Missing ${missingSatoshis} satoshis.`);
            const utxoInput = await this.fetchUtxo(utxo);
            const inputHash = (0, $9PVwI$bufferUtils).reverseBuffer((0, $9PVwI$Buffer).from(utxoInput.hash, 'hex'));
            tx.addInput(inputHash, utxoInput.index);
            const prevTx = (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromBuffer(utxoInput.nonWitnessUtxo);
            inputSatoshisAfter += prevTx.outs[utxoInput.index].value;
            requiredFee = await this.estimateFee(tx);
            missingSatoshis = this.getOutputSatoshis(tx) + BigInt(requiredFee) - inputSatoshisAfter;
        }
        // Now, if the fee to pay too high, add a change output
        const currentFee = inputSatoshisAfter - this.getOutputSatoshis(tx);
        const change = currentFee - BigInt(requiredFee);
        if (change >= minNonDustSatoshis) // Update change output with the required fee
        tx.updateOutput(changeOutputIndex, {
            value: change
        });
        else // If the change is too low, drop the change output (we pay a little more fee, but no dust output)
        tx.outs.splice(changeOutputIndex, 1);
        if (this.restClient.checkFee) this.checkFee(requiredFee, await this.estimateSize(tx));
    }
    async sign(transaction, sigOptions = {}) {
        const { restClient: restClient } = this;
        const { ins: ins } = transaction;
        const { inputIndex: inputIndex, sighashType: sighashType = $287a3b2e2915d9e2$var$SIGHASH_ALL, inputScript: inputScript } = sigOptions;
        const positions = typeof inputIndex === 'number' ? [
            inputIndex
        ] : [
            ...Array(ins.length).keys()
        ];
        for(let i = 0; i < positions.length; i += 1)try {
            const pos = positions[i];
            const { hash: hash, index: index } = ins[pos];
            if (hash.every((byte)=>byte === 0)) continue;
            const prevHash = (0, $9PVwI$bufferUtils).reverseBuffer((0, $9PVwI$Buffer).from([
                ...hash
            ]));
            const prevTx = await restClient.getTx(prevHash.toString('hex'));
            const { script: script } = prevTx.outs[index];
            const prevOutScript = inputScript || (0, $9PVwI$Buffer).from(script, 'hex');
            transaction.sign(pos, restClient.keyPair, sighashType, prevOutScript);
        } catch (error) {
            const expectedErrors = [
                'Not enough signatures provided',
                'Hash mismatch'
            ];
            if (error instanceof Error && !expectedErrors.includes(error.message)) throw error;
        }
    }
    async broadcast(tx) {
        if (this.restClient.mode === 'debug') {
            const { inRevs: inRevs, outRevs: outRevs } = tx;
            console.log('wallet.broadcast', {
                inRevs: inRevs,
                outRevs: outRevs
            });
        }
        await this.restClient.broadcast(tx.toHex());
        return tx.getId();
    }
    async send(satoshis, address) {
        const transaction = new (0, $9PVwI$Transaction)();
        const { chain: chain, network: network } = this.restClient;
        const networkObj = (0, $303220cf0debbf6c$export$de754bb4cdcc210c)(chain, network);
        const script = (0, $9PVwI$address).toOutputScript(address, networkObj);
        transaction.addOutput(script, satoshis);
        await this.fund(transaction);
        await this.sign(transaction);
        return this.broadcast(transaction);
    }
    getSpendablePublicKeys(chain, network) {
        const publicKeys = {
            'any-testnet': '020a6ece486f4e8ccbba59b689bbfb99a8dd6b49db498c6991d6845e002b5ddf8f',
            'LTC-mainnet': '029f5f3d2a46bf9bd17437cd447a09b2e98df1740afa8397cf06a8b25a6c5dffac',
            'BTC-mainnet': '03c6265f8e6997149a13bdf02b3be65e8929206a1d36e68a75928793f30f59eb52',
            'PEPE-mainnet': '035c2e6d55d5c03a709247af9a7a2dfc0bf40fdcbdcfe66f376cdcf7fab4113113',
            'DOGE-mainnet': '03a558c1ca6263ccd070005dc24f4555031998a6fb793f816624fd12e8dc5a5755'
        };
        if (network === 'regtest' || network === 'testnet') return publicKeys['any-testnet'];
        const key = `${chain}-${network}`;
        return publicKeys[key];
    }
    get hdPrivateKey() {
        return (0, $303220cf0debbf6c$export$accea06471c18a5a)(this.restClient);
    }
    get privateKey() {
        return this.hdPrivateKey.privateKey ?? (0, $9PVwI$Buffer).alloc(0);
    }
    get publicKey() {
        return this.hdPrivateKey.publicKey;
    }
    get passphrase() {
        return this.restClient.passphrase;
    }
    get path() {
        return this.restClient.path;
    }
    get chain() {
        return this.restClient.chain;
    }
    get network() {
        return this.restClient.network;
    }
    get url() {
        return this.restClient.bcn.url;
    }
    get mnemonic() {
        return this.restClient.mnemonic;
    }
    get address() {
        let address;
        try {
            address = (0, $9PVwI$address).fromPublicKey(this.publicKey, this.restClient.addressType, this.restClient.networkObj);
        } catch (error) {
            throw new Error('Could not generate address');
        }
        return address;
    }
}











class $888aa77d15cfc3b3$export$76f9d441834df9ba {
    constructor({ chain: chain, network: network, url: url }){
        this.computer = new (0, $5897c693dfcff079$export$2454fd0de010f4bb)({
            chain: chain,
            network: network,
            url: url
        });
    }
    async getTXOs(q) {
        if (q.verbosity === 1) return this.computer.getTXOs({
            ...q,
            verbosity: 1
        });
        return this.computer.getTXOs({
            ...q,
            verbosity: 0
        });
    }
    async sync(location) {
        const synced = await this.computer.sync(location);
        return (0, $303220cf0debbf6c$export$ea99c62adecc85ae)((0, $303220cf0debbf6c$export$c194c5a73880e96f)(synced));
    }
    async decode(txId) {
        return this.computer.decode(txId);
    }
    async load(location) {
        return this.computer.load(location);
    }
    async getAncestors(location) {
        return this.computer.getAncestors(location);
    }
    async getBalance(address) {
        return this.computer.getBalance(address);
    }
    async first(rev) {
        return this.computer.first(rev);
    }
    async prev(rev) {
        return this.computer.prev(rev);
    }
    async next(rev) {
        return this.computer.next(rev);
    }
    async latest(rev) {
        return this.computer.latest(rev);
    }
}




/**
 * Internal flattened representation of an `Effect2` used during cache
 * operations.
 */ const $5f4b05da045beabf$var$FLATTEN = {
    TEMP: '_temp',
    RES: 'res',
    ENV_PREFIX: 'env_'
};
class $5f4b05da045beabf$export$14be6456f8698719 {
    /**
   * Creates a new Bitcoin Computer database instance.
   *
   * @param params - Configuration for the underlying wallet and REST client
   */ constructor(params = {}){
        this.wallet = new (0, $287a3b2e2915d9e2$export$bcca3ea514774656)(params);
        this.cache = new (0, $703356805bc7d6e8$export$94affb487e701bf2)();
    }
    get restClient() {
        return this.wallet.restClient;
    }
    /**
   * Flattens a high-level `EvaluatedEffect` into the internal cache format.
   * Fully type-safe – no assertions required.
   */ flattenEffect(effect) {
        const envEntries = Object.entries(effect.env).map(([key, value])=>[
                `${$5f4b05da045beabf$var$FLATTEN.ENV_PREFIX}${key}`,
                value
            ]);
        return {
            [$5f4b05da045beabf$var$FLATTEN.TEMP]: true,
            [$5f4b05da045beabf$var$FLATTEN.RES]: effect.res,
            ...Object.fromEntries(envEntries)
        };
    }
    /**
   * Reverses `flattenEffect` to restore a normal `EvaluatedEffect`. Fully
   * type-safe – no assertions required.
   */ unFlattenEffect(flattened) {
        const envEntries = Object.entries(flattened).filter(([key])=>key.startsWith($5f4b05da045beabf$var$FLATTEN.ENV_PREFIX)).map(([key, value])=>[
                key.slice($5f4b05da045beabf$var$FLATTEN.ENV_PREFIX.length),
                value
            ]);
        return {
            res: flattened[$5f4b05da045beabf$var$FLATTEN.RES],
            env: Object.fromEntries(envEntries)
        };
    }
    /**
   * Recursively traverses an object, adds it to the recording system
   * (`record.ts`), and wraps every nested object with security proxies.
   *
   * This ensures that every reachable smart object participates in the
   * persistence layer and cannot bypass security boundaries.
   */ record(obj, visited = new WeakMap()) {
        if (typeof obj !== 'object' || obj === null) return obj;
        const objKey = obj;
        if (visited.has(objKey)) return visited.get(objKey);
        const insideCallProxy = new Proxy(obj, new (0, $952d3bca5034e549$export$b8e7b394f2964d0d)());
        const proxy = new Proxy(insideCallProxy, new (0, $0b77d8afb5886e41$export$f2aa9e51325c9c38)());
        visited.set(objKey, proxy);
        (0, $fa96f8418385359b$export$e16d8520af44a096)(proxy);
        for (const key of Object.keys(proxy))(0, $aec7dd200596fb2a$export$62c0dd10c640417e)(()=>{
            proxy[key] = this.record(proxy[key], visited);
        });
        return proxy;
    }
    /**
   * Fetches a transition from the blockchain and decodes it. Accepts an
   * optional pre-fetched `txFromChain` to avoid duplicate RPC calls.
   */ async getTransitionFromChain(txId, txFromChain) {
        const { restClient: restClient } = this;
        const tx = txFromChain ?? await (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTxId({
            txId: txId,
            restClient: restClient
        });
        const update = await (0, $9723fb8a051ef3ce$export$489a84f048b0ef8).fromTx(tx, restClient);
        return (0, $9ca517853ec47831$export$be58926105124dd4).fromUpdate(update);
    }
    /**
   * Retrieves an already-cached effect for a transaction.
   */ getEffectFromCache(txId) {
        const [fromCache] = this.cache.getByTxId(txId);
        const flattened = this.unFlattenEffect(fromCache);
        return this.record(flattened);
    }
    /**
   * Re-evaluates a transaction from the chain (used when cache miss occurs).
   * Now performs the transaction fetch **only once**.
   */ async getEffectFromChain(txId) {
        const { restClient: restClient } = this;
        const txFromChain = await (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTxId({
            txId: txId,
            restClient: restClient
        });
        const transition = await this.getTransitionFromChain(txId, txFromChain);
        const { effect: effect } = await this.eval(transition, {
            txFromChain: txFromChain
        });
        return effect;
    }
    /**
   * Returns the effect of a transaction (result + environment). First tries the
   * cache; falls back to on-chain re-evaluation if needed.
   */ async getEffect(txId) {
        try {
            return await this.getEffectFromCache(txId);
        } catch (err) {
            if (err instanceof Error && err.message !== `Version ${txId} does not exist`) throw err;
            return this.getEffectFromChain(txId);
        }
    }
    /**
   * Returns an orphan object (reachable only via inverse pointers) from cache.
   */ getOrphanFromCache(rev) {
        const [orphan] = this.cache.getByRev([
            rev
        ]);
        return this.record(orphan);
    }
    /**
   * Retrieves a smart object by its revision. Works for both on-chain and
   * in-memory objects (including orphans).
   */ async getRev(rev) {
        if (!rev || typeof rev !== 'string') throw new $5f4b05da045beabf$export$8ef43b75008b17aa(`Invalid revision: ${rev}`);
        if (rev.startsWith((0, $70710ac8a001306b$export$e89b5b69fd27457c))) return this.getMock(rev);
        const txId = (0, $303220cf0debbf6c$export$5c74a82dce3394d5)(rev);
        const effect = await this.getEffect(txId);
        const fromEffect = (0, $303220cf0debbf6c$export$d601b1a5af9dd5dc)(effect, '_rev', rev);
        return fromEffect || this.getOrphanFromCache(rev);
    }
    async get(id) {
        return (0, $303220cf0debbf6c$export$d146d9996ff2e97)(id) ? this.getRev(id) : this.getEffect(id);
    }
    /**
   * Evaluates a smart-contract transition and returns the resulting effect + transaction.
   *
   * Core pipeline of Bitcoin Computer. Maps directly to the node-copying architecture
   * (Driscoll et al. §2.3 + Karp §2.1):
   *
   *   1. Environment & namespace resolution
   *   2. Secure sandbox evaluation
   *   3. Cache version creation (two-phase apply + propagation)
   *   4. Transaction construction + metadata attachment
   *
   * Only the stale-side-predecessor refresh (inside Phase 3) ever rolls back.
   * Guarantees partial persistence (e=0, path copying), correct inRevs ordering,
   * prototype preservation, and security boundaries.
   */ async eval(transition, opts = {}) {
        const txFromChain = opts.txFromChain;
        // Phase 0: Replay / cache-hit shortcut
        if (txFromChain) {
            const txId = txFromChain.getId();
            if (this.cache.txIdToRoots.has(txId)) return {
                effect: this.getEffectFromCache(txId),
                tx: txFromChain
            };
        }
        const { cache: cache, restClient: restClient, wallet: wallet } = this;
        const { chain: chain, network: network, bcn: bcn } = restClient;
        const { exp: exp, env: env, mod: mod } = transition;
        // Phase 1: Resolve environment & namespace
        const environment = await Object.fromEntries(await Promise.all(Object.entries(env).map(async ([k, rev])=>[
                k,
                await this.getRev(rev)
            ])));
        const namespace = mod ? await (0, $bfd727fd88a0b35a$export$6d8228690abc2da8).load(mod, wallet) : {};
        const computer = new (0, $888aa77d15cfc3b3$export$76f9d441834df9ba)({
            chain: chain,
            network: network,
            url: bcn.url
        });
        // Phase 2: Secure Compartment evaluation + security checks
        const globals = {
            Contract: $ed98b948820df6a2$export$8517d80acf00e19a,
            computer: computer,
            console: console,
            ...environment,
            ...namespace
        };
        const compartment = new Compartment(globals);
        const result = await compartment.evaluate(exp);
        // this.validateSecurity(exp, result, environment)
        if (typeof exp !== 'string') throw new $5f4b05da045beabf$export$7f71b5adef806671('Not a smart object location');
        if (/ super(\[|\.)/.test(exp)) throw new $5f4b05da045beabf$export$7f71b5adef806671('Super is not allowed in smart contracts');
        if ($5f4b05da045beabf$export$d23a8e6958a8bc2d(result) || Object.values(environment).some($5f4b05da045beabf$export$d23a8e6958a8bc2d)) throw new $5f4b05da045beabf$export$7f71b5adef806671('Detected object that does not extend from Contract');
        const evaluatedEffect = {
            res: result,
            env: environment
        };
        const freshFlattened = this.flattenEffect(evaluatedEffect);
        let handle;
        try {
            // Phase 3: Node-copying version creation (two-phase apply)
            handle = cache.beginVersion([
                freshFlattened
            ]);
            if (handle.array.length === 0) {
                handle.rollback();
                return {
                    effect: evaluatedEffect,
                    tx: null
                };
            }
            const isReplay = !!txFromChain;
            // Stale-side-predecessor refresh – the *only* rollback path in the pipeline
            if (!isReplay) {
                const revsInFlattened = (0, $303220cf0debbf6c$export$6850e3f48372183d)(freshFlattened);
                const unreachable = handle.oldRevs.filter((rev)=>rev !== undefined && !revsInFlattened.has(rev));
                if (unreachable.length > 0) {
                    const latestRevs = await Promise.all(unreachable.map((r)=>this.restClient.latest(r)));
                    const staleSideRevs = latestRevs.filter((l, i)=>l !== unreachable[i]);
                    if (staleSideRevs.length > 0) {
                        const staleTxIds = new Set(staleSideRevs.map((0, $303220cf0debbf6c$export$5c74a82dce3394d5)));
                        handle.rollback() // discard temporary version
                        ;
                        await Promise.all([
                            ...staleTxIds
                        ].map((id)=>this.getEffectFromChain(id))) // refresh cache
                        ;
                        handle = this.cache.beginVersion([
                            freshFlattened
                        ]) // retry with latest state
                        ;
                    }
                }
            }
            const { array: array, inRevs: inRevs, oldRevs: oldRevs } = handle;
            // Phase 4: Transaction construction & final commit
            let update;
            let tx;
            if (isReplay) {
                update = await (0, $9723fb8a051ef3ce$export$489a84f048b0ef8).fromTx(txFromChain, restClient);
                tx = txFromChain;
            } else {
                const ownerData = await Promise.all(array.map((obj, i)=>{
                    const out = (0, $9723fb8a051ef3ce$export$489a84f048b0ef8).buildOwnerOutput(obj, i, wallet, txFromChain);
                    return {
                        ...out,
                        oldRev: oldRevs[i]
                    };
                }));
                update = new (0, $9723fb8a051ef3ce$export$489a84f048b0ef8)({
                    inRevs: inRevs,
                    ownerData: ownerData,
                    transition: transition
                });
                tx = await update.toTx(wallet);
                const { fund: fund = true, sign: sign = true } = opts;
                if (fund) await wallet.fund(tx, opts);
                if (sign) await wallet.sign(tx, opts);
            }
            const txId = tx.getId();
            handle.commit(txId);
            // Attach _id / _root / _satoshis / _owners metadata (runs only on new nodes)
            this.cache.updateNewNodes((obj)=>{
                if (!(0, $d205febb791b53ee$export$70ac1a29dd7dda57)(obj) || typeof obj._rev !== 'string') return;
                const outputIndex = parseInt(obj._rev.split(':')[1], 10);
                if (outputIndex < 0 || outputIndex >= update.ownerData.length) return;
                const calleeName = transition.parsed.getCalleeName();
                const isNewOrCall = transition.parsed.isNew() || transition.parsed.isCall();
                const meta = {};
                if (typeof obj._id !== 'string') meta._id = (0, $d205febb791b53ee$export$84eca18e6d832dd1)(`${txId}:${outputIndex}`);
                if (isNewOrCall && typeof obj._root !== 'string') meta._root = calleeName && evaluatedEffect.env[calleeName] ? (0, $d205febb791b53ee$export$accd2046ded63e63)(evaluatedEffect.env[calleeName]._root) : (0, $d205febb791b53ee$export$accd2046ded63e63)(obj._id ?? `${txId}:${outputIndex}`);
                const ownerDataEntry = update.ownerData[outputIndex] ?? {};
                if (typeof obj._satoshis === 'undefined') meta._satoshis = ownerDataEntry._satoshis;
                if (typeof obj._owners === 'undefined') meta._owners = ownerDataEntry._owners;
                if (ownerDataEntry._readers !== undefined) meta._readers = ownerDataEntry._readers;
                if (ownerDataEntry._url !== undefined) meta._url = ownerDataEntry._url;
                (0, $aec7dd200596fb2a$export$62c0dd10c640417e)(()=>{
                    Object.assign(obj, meta);
                });
            });
            const effect = this.record(this.unFlattenEffect(cache.getByTxId(txId)[0]));
            return {
                effect: effect,
                tx: tx
            };
        } finally{
            // rollback() is idempotent after commit(), so this is always safe
            if (handle) handle.rollback();
        }
    }
    getMock(rev) {
        const mockIndex = parseInt(rev.split(':')[1], 10);
        if (this.mocks) return Object.values(this.mocks)[mockIndex];
        throw new $5f4b05da045beabf$export$8ef43b75008b17aa('Mock not found');
    }
    /**
   * Same as `eval` but with a set of mocked objects injected into the
   * environment. Useful for unit-testing contracts that depend on external
   * state.
   */ async evalMocked(transition, opts = {}) {
        const { mocks: mocks } = opts;
        if (!mocks || Object.keys(mocks).length === 0) return this.eval(transition, opts);
        // 1. Register mocks in the cache under a fake transaction so they receive
        //    proper _id / _rev / _root metadata via the normal commit path.
        const mockForest = [
            {
                [$5f4b05da045beabf$var$FLATTEN.TEMP]: true,
                ...mocks
            }
        ];
        const mockHandle = this.cache.beginVersion(mockForest);
        mockHandle.commit((0, $70710ac8a001306b$export$e89b5b69fd27457c));
        const committedArray = this.cache.getByTxId((0, $70710ac8a001306b$export$e89b5b69fd27457c));
        const committedRoot = committedArray[0];
        // 2. Attach metadata to the original mock objects (mutates them)
        this.mocks = {};
        const mockEntries = Object.entries(mocks);
        for (const [i, [name, mock]] of mockEntries.entries()){
            mock._id = `${0, $70710ac8a001306b$export$e89b5b69fd27457c}:${i}`;
            mock._rev = `${0, $70710ac8a001306b$export$e89b5b69fd27457c}:${i}`;
            mock._root = `${0, $70710ac8a001306b$export$e89b5b69fd27457c}:${i}`;
            this.mocks[name] = mock;
        }
        // 3. Build env mapping from mock name → assigned revision string
        const mockedEnv = {};
        for (const [name] of mockEntries){
            const key = `${$5f4b05da045beabf$var$FLATTEN.ENV_PREFIX}${name}`;
            const obj = committedRoot[key] || committedRoot[name];
            if (obj?._rev && typeof obj._rev === 'string') mockedEnv[name] = obj._rev;
        }
        // 4. Inject mock revisions into transition environment
        transition.env = {
            ...transition.env,
            ...mockedEnv
        };
        // 5. Run real evaluation (mocks are now resolved as revs)
        const result = await this.eval(transition, {
            ...opts,
            mocks: undefined
        });
        // 6. Cleanup
        this.cache.pruneTxId((0, $70710ac8a001306b$export$e89b5b69fd27457c));
        this.mocks = undefined;
        return result;
    }
    /**
   * Requests testnet BTC from the faucet.
   */ faucet(amount, address) {
        return this.wallet.faucet(amount, address);
    }
}
function $5f4b05da045beabf$export$d23a8e6958a8bc2d(value) {
    return [
        ...(0, $303220cf0debbf6c$export$f402e1d983f479af)([
            value
        ], (0, $303220cf0debbf6c$export$2ba85e47198b647a))
    ].some((v)=>(0, $d205febb791b53ee$export$70ac1a29dd7dda57)(v) && !(0, $fa96f8418385359b$export$141f8028a5c9b76)(v) && !(0, $303220cf0debbf6c$export$1ef33362739af9d6)(v._rev));
}
class $5f4b05da045beabf$export$70e773e797606c01 extends Error {
    constructor(message){
        super(message);
        this.name = 'BitcoinComputerError';
    }
}
class $5f4b05da045beabf$export$7f71b5adef806671 extends $5f4b05da045beabf$export$70e773e797606c01 {
}
class $5f4b05da045beabf$export$3fbb8a111b629068 extends $5f4b05da045beabf$export$70e773e797606c01 {
}
class $5f4b05da045beabf$export$8ef43b75008b17aa extends $5f4b05da045beabf$export$70e773e797606c01 {
}









const $0b7f72abf1819dc7$var$EventSource = typeof window !== 'undefined' && window.EventSource ? window.EventSource : (0, $9PVwI$EventSource);
class $0b7f72abf1819dc7$export$f55210826850c514 {
    constructor(baseUrl, chain, network, restClient){
        this.eventSource = null;
        this.idCallbacks = new Map();
        this.idOnErrors = new Map();
        this.streamCallbacks = new Map();
        this.streamOnErrors = new Map();
        this.mempoolCallback = null;
        this.mempoolOnError = undefined;
        this.baseUrl = baseUrl;
        this.chain = chain;
        this.network = network;
        this.restClient = restClient;
    }
    buildFilterKey(filter) {
        const sorted = Object.keys(filter).sort().reduce((acc, k)=>{
            const val = filter[k];
            acc[k] = typeof val === 'bigint' ? val.toString() : val;
            return acc;
        }, {});
        return JSON.stringify(sorted);
    }
    hasSubscriptions() {
        return this.idCallbacks.size > 0 || this.streamCallbacks.size > 0 || !!this.mempoolCallback;
    }
    async rebuildEventSource() {
        this.eventSource?.close();
        this.eventSource = null;
        if (!this.hasSubscriptions()) return;
        const params = new URLSearchParams();
        if (this.mempoolCallback) params.append('mempool', 'true');
        this.idCallbacks.forEach((_, id)=>params.append('id', id));
        let index = 0;
        for (const { filter: filter } of this.streamCallbacks.values()){
            const processed = {
                ...filter
            };
            if (processed.exp !== undefined) {
                if (typeof processed.exp !== 'string') throw new Error('exp must be a string');
                processed.expHash = (0, $9PVwI$crypto).sha256(Buffer.from(processed.exp)).toString('hex');
                delete processed.exp;
            }
            for (const [key, value] of Object.entries(processed))if (value !== undefined && value !== null) params.append(`stream[${index}][${key}]`, String(value));
            index++;
        }
        const url = `${this.baseUrl}/v1/${this.chain}/${this.network}/subscribe?${params.toString()}`;
        this.eventSource = new $0b7f72abf1819dc7$var$EventSource(url);
        this.eventSource.onmessage = this.handleMessage.bind(this);
        this.eventSource.onerror = this.handleError.bind(this);
    }
    handleMessage(event) {
        const data = (0, $303220cf0debbf6c$export$b48ee232557adc37)(event.data);
        if (!data) return;
        if ('revs' in data) {
            this.mempoolCallback?.(data);
            return;
        }
        // Dispatch to ID if present
        if (data.id) {
            const cb = this.idCallbacks.get(data.id);
            cb?.({
                rev: data.rev,
                hex: data.hex
            });
        }
        // Dispatch to matching streams (check exact match on filter keys)
        this.streamCallbacks.forEach(({ filter: filter, callback: callback })=>{
            let matches = true;
            for (const [k, v] of Object.entries(filter)){
                if (k === 'publicKey') // Server sends publicKeys array
                {
                    if (!Array.isArray(data.publicKeys) || !data.publicKeys.includes(String(v))) {
                        matches = false;
                        break;
                    }
                } else if (data[k] !== String(v)) {
                    matches = false;
                    break;
                }
            }
            if (matches) callback({
                rev: data.rev,
                hex: data.hex
            });
        });
    }
    handleError(error) {
        this.idOnErrors.forEach((onError)=>onError?.(error));
        this.streamOnErrors.forEach((onError)=>onError?.(error));
        this.mempoolOnError?.(error);
        this.eventSource?.close();
    }
    async addIdSubscription(id, onMessage, onError) {
        this.idCallbacks.set(id, onMessage);
        this.idOnErrors.set(id, onError);
        await this.rebuildEventSource();
        return ()=>{
            this.idCallbacks.delete(id);
            this.idOnErrors.delete(id);
            this.rebuildEventSource();
        };
    }
    async addStreamSubscription(filter, onMessage, onError) {
        for (const key of Object.keys(filter)){
            if (!(0, $bd5ff9060a235dd4$export$30dc5b6bafe2f74).includes(key)) throw new Error(`Invalid subscription field: ${key}`);
        }
        if (filter.asm !== undefined) {
            if (!(0, $9PVwI$script).fromASM(filter.asm)) throw new Error('asm is not a valid script');
        }
        const queryParams = new URLSearchParams();
        let expHash;
        const processed = {
            ...filter
        };
        if (processed.exp !== undefined) {
            expHash = (0, $9PVwI$crypto).sha256(Buffer.from(processed.exp)).toString('hex');
            delete processed.exp;
            processed['expHash'] = expHash;
        }
        for (const [key, value] of Object.entries(processed))if (value !== undefined && value !== null) queryParams.append(key, String(value));
        await this.restClient.checkStreamParameters(queryParams);
        const storedFilter = {};
        for (const [key, value] of Object.entries(processed))if (value !== undefined && value !== null) storedFilter[key] = typeof value === 'bigint' ? value.toString() : String(value);
        const key = this.buildFilterKey(filter);
        this.streamCallbacks.set(key, {
            filter: storedFilter,
            callback: onMessage
        });
        this.streamOnErrors.set(key, onError);
        await this.rebuildEventSource();
        return ()=>{
            this.streamCallbacks.delete(key);
            this.streamOnErrors.delete(key);
            this.rebuildEventSource();
        };
    }
    async addMempoolSubscription(onMessage, onError) {
        this.mempoolCallback = onMessage;
        this.mempoolOnError = onError;
        await this.rebuildEventSource();
        return ()=>{
            this.mempoolCallback = null;
            this.mempoolOnError = undefined;
            this.rebuildEventSource();
        };
    }
}




const $5897c693dfcff079$var$EventSource = typeof window !== 'undefined' && window.EventSource ? window.EventSource : (0, $9PVwI$EventSource);
/**
 * # Bitcoin Computer – Main Public API
 *
 * This is the primary entry point for developers using the Bitcoin Computer library.
 *
 * Key design principles:
 * - **Type-safe smart contracts**: Every contract instance is wrapped in `SmartContract<T>`, which
 *   uses a covariant recursive endofunctor (see `types.ts`) to lift methods, preserve `this`,
 *   brand metadata, and guarantee async returns.
 * - **Branded primitives**: `Rev`, `TxId`, `Address`, etc. are branded strings for compile-time safety.
 * - **Backward compatibility**: Public APIs accept plain `string` where `Rev`/`TxId` are expected
 *   (e.g. for `inner-computer.ts` and legacy code), but return branded types when possible.
 * - **Security**: All returned objects are wrapped with dual-layer proxies (`InsideCallHandler` +
 *   `OutsideCallHandler`) to enforce encapsulation and call-boundary rules.
 * - **Partial persistence**: The underlying graph uses the node-copying method (Driscoll et al. §2.3).
 *
 * All mutation happens inside evaluated smart-contract transitions. User code outside contracts
 * cannot mutate objects.
 */ class $5897c693dfcff079$export$2454fd0de010f4bb {
    constructor(params = {}){
        this.db = new (0, $5f4b05da045beabf$export$14be6456f8698719)(params);
        this.subscription = new (0, $0b7f72abf1819dc7$export$f55210826850c514)(this.db.wallet.url, this.db.wallet.chain, this.db.wallet.network, this.db.wallet.restClient);
    }
    /* ==================== BRANDING & METADATA ==================== */ /**
   * Returns `true` if `key` is one of the special Bitcoin Computer metadata fields.
   * Used by `brandMetadata` and `containsMetadata`.
   */ isMetadataKey(key) {
        return [
            '_id',
            '_rev',
            '_root',
            '_url',
            '_owners',
            '_readers',
            '_satoshis'
        ].includes(key);
    }
    /**
   * Fast cycle-safe check whether a value (or any nested value) contains Bitcoin Computer metadata.
   * Early exit improves performance on plain objects.
   */ containsMetadata(v, seen = new WeakSet()) {
        if (v == null || typeof v !== 'object') return false;
        if (seen.has(v)) return false;
        seen.add(v);
        if (Array.isArray(v)) return v.some((item)=>this.containsMetadata(item, seen));
        for (const key of Object.keys(v)){
            if (this.isMetadataKey(key)) return true;
            if (this.containsMetadata(v[key], seen)) return true;
        }
        return false;
    }
    /**
   * Recursively brands all Bitcoin Computer metadata fields **at runtime**.
   *
   * This is the canonical way to turn a plain JavaScript object (e.g. deserialized JSON,
   * result from a raw RPC call, or legacy data) into a fully typed `SmartContract<T>`.
   *
   * Called automatically by `new`, `sync`, `encode*`, `decode`, etc.
   * Uses `_sudo` to bypass proxy restrictions during branding.
   */ brandMetadata(value, seen = new WeakMap()) {
        if (value == null || typeof value !== 'object') return value;
        const obj = value;
        if (seen.has(obj)) return seen.get(obj);
        if (!this.containsMetadata(value)) {
            seen.set(obj, value);
            return value;
        }
        if (Array.isArray(value)) {
            const arr = value.map((v)=>this.brandMetadata(v, seen));
            seen.set(obj, arr);
            return arr;
        }
        seen.set(obj, value);
        (0, $aec7dd200596fb2a$export$62c0dd10c640417e)(()=>{
            if (typeof obj._id === 'string') obj._id = (0, $d205febb791b53ee$export$84eca18e6d832dd1)(obj._id);
            if (typeof obj._rev === 'string') obj._rev = (0, $d205febb791b53ee$export$f386daff7715d420)(obj._rev);
            if (typeof obj._root === 'string') obj._root = (0, $d205febb791b53ee$export$accd2046ded63e63)(obj._root);
            if (typeof obj._url === 'string') obj._url = (0, $d205febb791b53ee$export$91df428ae0f97b5c)(obj._url);
            const owners = obj._owners;
            if (owners !== undefined) obj._owners = Array.isArray(owners) ? owners.map((v)=>typeof v === 'string' ? (0, $d205febb791b53ee$export$171aa6226884e6dd)(v) : v) : typeof owners === 'string' ? (0, $d205febb791b53ee$export$171aa6226884e6dd)(owners) : owners;
            const readers = obj._readers;
            if (readers !== undefined) obj._readers = Array.isArray(readers) ? readers.map((v)=>typeof v === 'string' ? (0, $d205febb791b53ee$export$171aa6226884e6dd)(v) : v) : typeof readers === 'string' ? (0, $d205febb791b53ee$export$171aa6226884e6dd)(readers) : readers;
            for (const key of Object.keys(obj))if (!this.isMetadataKey(key)) obj[key] = this.brandMetadata(obj[key], seen);
        });
        return value;
    }
    /* ==================== CORE PUBLIC API ==================== */ /**
   * Creates a new instance of a smart contract on the blockchain.
   *
   * The returned object is a fully typed `SmartContract<T>` proxy with all methods lifted
   * to return `Promise<...>`, metadata branded, and security proxies applied.
   */ async new(constructor, args = [], mod) {
        const internalMod = mod ? (0, $d205febb791b53ee$export$1c4cfbb3206db243)(mod) : undefined;
        const { tx: tx, effect: effect } = await this.encodeNew({
            constructor: constructor,
            args: args,
            mod: internalMod
        });
        if (tx) await this.broadcast(tx);
        const { res: res, env: env } = effect;
        (0, $74a26ef6d53e712a$export$48b95d5fd8dc5d0b)((0, $74a26ef6d53e712a$export$c4d407c2cae5b6c0)(env))([])(args);
        const branded = this.brandMetadata(res);
        return (0, $382856abc4b520b8$export$29c19449f1fdb873)(branded, this);
    }
    /* ==================== GET-TXOS FAMILY (DRY) ==================== */ /**
   * Internal helper that forwards to the REST client.
   * The `as any` cast is required because the public overloads in `RestClient` are not
   * visible to the implementation signature from outside the class (TS limitation).
   */ async _getTXOsFamily(query) {
        return this.db.wallet.restClient.getTXOs(query);
    }
    async getTXOs(q) {
        return this._getTXOsFamily(q);
    }
    async getUTXOs(q) {
        return this._getTXOsFamily({
            ...q,
            isSpent: false
        });
    }
    async getOTXOs(q) {
        return this._getTXOsFamily({
            ...q,
            isObject: true
        });
    }
    async getOUTXOs(q) {
        return this._getTXOsFamily({
            ...q,
            isObject: true,
            isSpent: false
        });
    }
    // Implementation
    async sync(location) {
        const isRevLocation = (0, $303220cf0debbf6c$export$d146d9996ff2e97)(location);
        const result = isRevLocation ? (0, $382856abc4b520b8$export$29c19449f1fdb873)(await this.db.get((0, $d205febb791b53ee$export$f386daff7715d420)(location)), this) : await this.db.get((0, $d205febb791b53ee$export$55d63915149d1a5a)(location));
        if (isRevLocation) return this.brandMetadata(result);
        return result;
    }
    async getAncestors(location, verbosity) {
        const { wallet: wallet } = this.db;
        const { restClient: restClient } = wallet;
        const txId = (0, $d205febb791b53ee$export$6d0757a710f60a30)(location) ? (0, $d205febb791b53ee$export$55d63915149d1a5a)(location) : (0, $303220cf0debbf6c$export$caebc656d3686561)(location).txId;
        const ancestorTxIds = await restClient.getAncestors(txId);
        if (verbosity === 1) {
            const ancestorHexes = ancestorTxIds.length ? await restClient.getRawTxs(ancestorTxIds) : [];
            return new Map(ancestorTxIds.map((id, index)=>[
                    id,
                    ancestorHexes[index]
                ]));
        }
        return ancestorTxIds;
    }
    /* ==================== ENCODE / DECODE / MODULES ==================== */ /**
   * Shared internal wrapper used by all `encode*` methods.
   * Performs evaluation, proxy wrapping, and returns the raw effect + tx.
   */ async wrappedEncode(transition, opts = {}) {
        const { db: db } = this;
        const { effect: e, tx: tx } = await db.evalMocked(transition, opts);
        const res = (0, $382856abc4b520b8$export$29c19449f1fdb873)(e.res, this);
        const env = (0, $74a26ef6d53e712a$export$72de43103e456aaf)((el)=>(0, $382856abc4b520b8$export$29c19449f1fdb873)(el, this))(e.env);
        return {
            tx: tx,
            effect: {
                res: res,
                env: env
            },
            db: db
        };
    }
    /**
   * Low-level encode of any transition (new, call, or raw expression).
   * Returns the transaction (if any) and the resulting effect.
   */ async encode(json) {
        const transition = new (0, $9ca517853ec47831$export$be58926105124dd4)({
            exp: (0, $d205febb791b53ee$export$e921403d8a9d6e3a)(json.exp || ''),
            env: Object.fromEntries(Object.entries(json.env || {}).map(([k, v])=>[
                    k,
                    (0, $d205febb791b53ee$export$f386daff7715d420)(v)
                ])),
            mod: json.mod ? (0, $d205febb791b53ee$export$1c4cfbb3206db243)(json.mod) : undefined
        });
        const { tx: tx, effect: effect } = await this.wrappedEncode(transition, json);
        return {
            tx: tx,
            effect: this.brandMetadata(effect)
        };
    }
    async encodeNew({ constructor: constructor, args: args, mod: mod }) {
        const transition = (0, $9ca517853ec47831$export$be58926105124dd4).fromConstructorCall(constructor, args, mod ? (0, $d205febb791b53ee$export$1c4cfbb3206db243)(mod) : undefined);
        return this.wrappedEncode(transition);
    }
    async encodeCall({ target: target, property: property, args: args, mod: mod }) {
        const transition = (0, $9ca517853ec47831$export$be58926105124dd4).fromFunctionCall(target, property, args, mod ? (0, $d205febb791b53ee$export$1c4cfbb3206db243)(mod) : undefined);
        return this.wrappedEncode(transition);
    }
    /**
   * Decodes an on-chain transaction back into its original transition JSON.
   */ async decode(tx) {
        let bitcoinTx;
        if (typeof tx === 'string') {
            if (!(0, $d205febb791b53ee$export$6d0757a710f60a30)(tx)) throw new Error('Invalid transaction id format');
            bitcoinTx = await (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTxId({
                txId: (0, $d205febb791b53ee$export$55d63915149d1a5a)(tx),
                restClient: this.db.wallet.restClient
            });
        } else bitcoinTx = tx;
        const tbcTx = (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromTransaction(bitcoinTx);
        const update = await (0, $9723fb8a051ef3ce$export$489a84f048b0ef8).fromTx(tbcTx, this.db.wallet.restClient);
        const transition = (0, $9ca517853ec47831$export$be58926105124dd4).fromUpdate(update);
        return transition.toJSON();
    }
    /* ==================== MODULE SYSTEM ==================== */ async deploy(module, opts) {
        return (0, $bfd727fd88a0b35a$export$6d8228690abc2da8).deploy(module, this.db.wallet, opts);
    }
    async load(rev) {
        return (0, $bfd727fd88a0b35a$export$6d8228690abc2da8).load((0, $d205febb791b53ee$export$1c4cfbb3206db243)(rev), this.db.wallet);
    }
    /* ==================== WALLET & NODE OPERATIONS ==================== */ async listTxs(address = this.getAddress()) {
        return this.db.wallet.restClient.listTxs(address);
    }
    async getBalance(address) {
        const addr = address ? typeof address === 'string' ? (0, $d205febb791b53ee$export$b46cd0ecde2b93f9)(address) : address : undefined;
        return this.db.wallet.getBalance(addr);
    }
    async sign(transaction, opts = {}) {
        return this.db.wallet.sign(transaction, opts);
    }
    async fund(tx, opts) {
        const { include: include, exclude: exclude } = opts || {};
        return this.db.wallet.fund(tx, {
            include: include,
            exclude: exclude
        });
    }
    async send(satoshis, address) {
        const addr = typeof address === 'string' ? (0, $d205febb791b53ee$export$b46cd0ecde2b93f9)(address) : address;
        return this.db.wallet.send(satoshis, addr);
    }
    /**
   * Broadcasts a transaction. In debug mode also logs the decoded transition.
   */ async broadcast(tx) {
        if (this.db.wallet.restClient.mode === 'debug') {
            const { exp: exp, env: env, mod: mod } = await this.decode(tx);
            console.log('computer.broadcast', {
                exp: exp,
                env: env,
                mod: mod
            });
        }
        return this.db.wallet.broadcast(tx);
    }
    async rpc(method, params) {
        const data = await this.db.wallet.restClient.rpc(method, params);
        return data.result ? data.result : {};
    }
    /* ==================== GETTERS / SETTERS ==================== */ getChain() {
        return this.db.wallet.restClient.chain;
    }
    getNetwork() {
        return this.db.wallet.restClient.network;
    }
    getMnemonic() {
        return this.db.wallet.restClient.mnemonic.toString();
    }
    getPrivateKey() {
        return this.db.wallet.privateKey.toString();
    }
    getPassphrase() {
        return this.db.wallet.restClient.passphrase;
    }
    getPath() {
        return this.db.wallet.restClient.path;
    }
    getUrl() {
        return this.db.wallet.restClient.bcn.url;
    }
    getPublicKey() {
        return this.db.wallet.publicKey.toString('hex');
    }
    getAddress() {
        return this.db.wallet.address;
    }
    getFee() {
        return this.db.wallet.restClient.satPerByte;
    }
    setFee(fee) {
        this.db.wallet.restClient.satPerByte = fee;
    }
    /* ==================== UTILITIES ==================== */ faucet(amount, address = this.getAddress()) {
        return this.db.wallet.faucet(amount, address);
    }
    static getVersion() {
        return 0, $deb927b75e1890ae$export$a4ad2735b021c132;
    }
    async delete(inRevs) {
        const update = new (0, $9723fb8a051ef3ce$export$489a84f048b0ef8)({
            inRevs: inRevs.map((0, $d205febb791b53ee$export$f386daff7715d420))
        });
        const tx = await update.toTx(this.db.wallet);
        await this.fund(tx);
        await this.db.wallet.sign(tx);
        return this.broadcast(tx);
    }
    async first(rev) {
        return this.db.wallet.restClient.first((0, $d205febb791b53ee$export$f386daff7715d420)(rev));
    }
    async prev(rev) {
        return this.db.wallet.restClient.prev((0, $d205febb791b53ee$export$f386daff7715d420)(rev));
    }
    async next(rev) {
        return this.db.wallet.restClient.next((0, $d205febb791b53ee$export$f386daff7715d420)(rev));
    }
    async latest(rev) {
        return this.db.wallet.restClient.latest((0, $d205febb791b53ee$export$f386daff7715d420)(rev));
    }
    /* ==================== SUBSCRIPTION / STREAMING ==================== */ async subscribe(id, onMessage, onError) {
        return this.subscription.addIdSubscription(id, onMessage, onError);
    }
    async streamTXOs(filter, onMessage, onError) {
        return this.subscription.addStreamSubscription(filter, onMessage, onError);
    }
    async streamMempoolCleanup(onMessage, onError) {
        return this.subscription.addMempoolSubscription(onMessage, onError);
    }
    /* ==================== DEPRECATED API (kept for backward compatibility) ==================== */ /** @deprecated Use `getOUTXOs` instead */ async query(q) {
        console.log('"query" is deprecated, use "getOUTXOs" instead');
        return this.getOUTXOs(q);
    }
    /** @deprecated Use `Transaction.fromHex(hex)` instead */ static txFromHex({ hex: hex }) {
        console.log('"txFromHex({ hex })" is deprecated, use "Transaction.fromHex(hex)" instead');
        return (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromHex(hex);
    }
    /** @deprecated Use `computer.db.wallet.restClient.addressType` instead */ getAddressType() {
        console.log('"getAddressType" is deprecated, use "computer.db.wallet.restClient.addressType" instead');
        return this.db.wallet.restClient.addressType;
    }
    /** @deprecated We call lockdown internally – no need to call it yourself */ static lockdown(_opts) {
        console.log('"lockdown" is deprecated, we call it internally so you don\'t have to');
    }
    /** @deprecated Use `deploy` instead */ async export(module, opts) {
        console.log('"export" is deprecated, use "deploy" instead');
        return this.deploy(module, opts);
    }
    /** @deprecated Use `load` instead */ async import(rev) {
        console.log('"import" is deprecated, use "load" instead');
        return this.load(rev);
    }
    /** @deprecated Use `getOUTXOs` instead */ async queryRevs(q) {
        console.log('"queryRevs" is deprecated, use "getOUTXOs" instead');
        return this.getOUTXOs(q);
    }
    /** @deprecated Use `getOUTXOs` instead */ async getOwnedRevs(publicKey = this.db.wallet.publicKey) {
        console.log('"getOwnedRevs" is deprecated, use "getOUTXOs" instead');
        return this.getOUTXOs({
            publicKey: publicKey.toString('hex')
        });
    }
    /** @deprecated Use `getOUTXOs` instead */ async getRevs(publicKey = this.db.wallet.publicKey) {
        console.log('"getRevs" is deprecated, use "getOUTXOs" instead');
        return this.getOUTXOs({
            publicKey: publicKey.toString('hex')
        });
    }
    /** @deprecated Use `Promise.all(ids.map(latest))` instead */ async getLatestRevs(ids) {
        console.log('"getLatestRevs(ids)" is deprecated, use "await Promise.all(ids.map((id) => latest(id)))" instead');
        return Promise.all(ids.map((id)=>this.latest(id)));
    }
    /** @deprecated Use `latest` instead */ async getLatestRev(id) {
        console.log('"getLatestRev" is deprecated, use "latest" instead');
        return this.latest(id);
    }
    /** @deprecated Use `Promise.all(ids.map(latest))` instead */ async idsToRevs(ids) {
        console.log('"idsToRevs(ids)" is deprecated, use "await Promise.all(ids.map((id) => latest(id)))" instead');
        return Promise.all(ids.map((id)=>this.latest(id)));
    }
    /** @deprecated No longer needed */ getMinimumFees() {
        console.log('"getMinimumFees" is deprecated');
        return this.db.wallet.getDustThreshold(false);
    }
    /* ==================== STATIC UTILITIES ==================== */ /**
   * Extracts inscription data (content-type + body) from a raw transaction witness.
   */ static getInscription(rawTx, index) {
        const tx = (0, $4b62a469f572a3c6$export$febc5573c75cefb0).fromHex(rawTx);
        if (tx.ins[index].witness.length > 0) return (0, $f94e2696d4b62340$export$a0291b2a7af96f4c)(tx.ins[index].witness);
        return {
            contentType: '',
            body: ''
        };
    }
    toScriptPubKey(publicKeys = [
        this.getPublicKey()
    ]) {
        const output = (0, $8636fd77165bd4bc$export$a5c5ced73e99851c)(publicKeys.map((pk)=>(0, $9PVwI$Buffer).from(pk, 'hex')));
        const network = this.db.wallet.restClient.networkObj;
        return (0, $9PVwI$payments).p2ms({
            output: output,
            network: network
        }).output;
    }
    async isUnspent(rev) {
        const [txId, outNum] = rev.split(':');
        const { result: result } = await this.rpc('gettxout', `${txId} ${outNum} true`);
        return !!result;
    }
}





globalThis.Contract = (0, $ed98b948820df6a2$export$8517d80acf00e19a);
const $e1e9e2b9d71bc2d8$var$moduleExports = {
    Computer: $5897c693dfcff079$export$2454fd0de010f4bb,
    Mock: $70710ac8a001306b$export$2a766bd177c54dd,
    Transaction: $4b62a469f572a3c6$export$febc5573c75cefb0
};
if (typeof $e1e9e2b9d71bc2d8$exports !== 'undefined') $e1e9e2b9d71bc2d8$exports = $e1e9e2b9d71bc2d8$var$moduleExports;


export {$e1e9e2b9d71bc2d8$exports as default, $5897c693dfcff079$export$2454fd0de010f4bb as Computer, $70710ac8a001306b$export$2a766bd177c54dd as Mock, $4b62a469f572a3c6$export$febc5573c75cefb0 as Transaction, $d205febb791b53ee$export$bbf2ffbffa00b288 as precise, $d205febb791b53ee$export$57b7f3bf07321492 as lifted};
