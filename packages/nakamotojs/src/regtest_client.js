import RpcClient from 'bitcoind-rpc';
import * as util from 'util';
import { ECPairFactory } from 'ecpair';
import { rpcJSON2CB } from './utils.js';
import * as ecc from '@bitcoin-computer/secp256k1';
import {
  RPC_HOST,
  RPC_PASSWORD,
  RPC_PORT,
  RPC_USER,
  RPC_PROTOCOL,
  CHAIN,
  NETWORK,
} from './config/index.js';
import { payments, Psbt, networks } from './index.js';
const network = networks.getNetwork(CHAIN, NETWORK);
const ECPair = ECPairFactory(ecc);
const rpcConfig = {
  protocol: RPC_PROTOCOL,
  user: RPC_USER,
  pass: RPC_PASSWORD,
  host: RPC_HOST,
  port: parseInt(RPC_PORT, 10),
};
const rpcClientObj = new RpcClient(rpcConfig);
const nativeRpcClient = {};
const callSpec = JSON.parse(JSON.stringify(RpcClient.callspec));
Object.keys(callSpec).forEach(spec => {
  callSpec[spec.toLowerCase()] = callSpec[spec];
});
const types = {
  str(arg) {
    return arg.toString();
  },
  string(arg) {
    return arg.toString();
  },
  int(arg) {
    return parseFloat(arg);
  },
  float(arg) {
    return parseFloat(arg);
  },
  bool(arg) {
    return (
      arg === true ||
      arg === '1' ||
      arg === 1 ||
      arg === 'true' ||
      arg.toString().toLowerCase() === 'true'
    );
  },
  obj(arg) {
    if (typeof arg === 'string') {
      return JSON.parse(arg);
    }
    return arg;
  },
};
export function parseParams(method, params) {
  if (callSpec[method] === undefined || callSpec[method] === null) {
    throw new Error('This RPC method does not exist, or not supported');
  }
  const paramsList = params.trim().split(' ');
  const callSpecParamsList = callSpec[method].trim().split(' ');
  if (params.trim().length === 0 && callSpec[method].trim().length !== 0) {
    throw new Error(
      `Too few params provided. Expected ${callSpecParamsList.length} Provided 0`,
    );
  } else if (
    params.trim().length !== 0 &&
    callSpec[method].trim().length === 0
  ) {
    throw new Error(
      `Too many params provided. Expected 0 Provided ${paramsList.length}`,
    );
  } else if (paramsList.length < callSpecParamsList.length) {
    throw new Error(
      `Too few params provided. Expected ${callSpecParamsList.length} Provided ${paramsList.length}`,
    );
  } else if (paramsList.length > callSpecParamsList.length) {
    throw new Error(
      `Too many params provided. Expected ${callSpecParamsList.length} Provided ${paramsList.length}`,
    );
  }
  if (params.length === 0) {
    return [];
  }
  const typedParams = paramsList.map((param, index) => {
    // @ts-expect-error  ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
    return types[callSpecParamsList[index]](param);
  });
  return typedParams;
}
try {
  // methods like add node
  Object.keys(RpcClient.prototype).forEach(method => {
    if (method && typeof RpcClient.prototype[method] === 'function') {
      const smallCaseMethod = method.toLowerCase();
      nativeRpcClient[method] = util.promisify(
        RpcClient.prototype[method].bind(rpcClientObj),
      );
      nativeRpcClient[smallCaseMethod] = util.promisify(
        RpcClient.prototype[smallCaseMethod].bind(rpcClientObj),
      );
    }
  });
} catch (error) {
  throw new Error(`Error occurred while binding RPC methods: ${error.message}`);
}
export class RegtestClient {
  constructor() {
    this.nativeRpcClient = nativeRpcClient;
  }
  async faucet(address, value) {
    // Fund address
    const valueBtc = value / 1e8;
    const { result: txId } = await nativeRpcClient.sendtoaddress(
      address,
      valueBtc,
    );
    // Mine block on top
    await nativeRpcClient.generateToAddress(
      1,
      'mvFeNF9DAR7WMuCpBPbKuTtheihLyxzj8i',
    );
    const { result: fetchedTx } = await nativeRpcClient.getrawtransaction(
      txId,
      1,
    );
    // Prepare return value
    const vout = fetchedTx.vout.findIndex(x => x.value * 1e8 === value);
    return { txId, vout, height: -1, satoshis: value };
  }
  async mine(count) {
    const { result: address } = await nativeRpcClient.getnewaddress();
    return await nativeRpcClient.generatetoaddress(count, address);
  }
  async broadcast(txHex) {
    const { result, error } = await nativeRpcClient.sendRawTransaction(txHex);
    if (error) {
      throw new Error('Error sending transaction');
    }
    return result;
  }
  async getTx(txId) {
    const res = await nativeRpcClient.getRawTransaction(txId, 1);
    return rpcJSON2CB(res.result);
  }
  async verify(txo) {
    const tx = await this.getTx(txo.txId);
    const txoActual = tx.outs[txo.vout];
    if (txo.address && txoActual.address !== txo.address)
      throw new Error('Address mismatch');
    if (txo.satoshis && txoActual.value !== txo.satoshis)
      throw new Error('Value Mismatch');
  }
  async height() {
    const { result: topBlockHash } = await nativeRpcClient.getbestblockhash();
    const { result } = await nativeRpcClient.getblockheader(topBlockHash, true);
    return result.height;
  }
  async faucetScript(script, value) {
    const key = ECPair.makeRandom({ network });
    const payment = payments.p2pkh({
      pubkey: key.publicKey,
      network,
    });
    const { address } = payment;
    const txId = (
      await nativeRpcClient.sendtoaddress(address, (value * 2) / 1e8, '', '')
    ).result;
    const fetchedTx = (await nativeRpcClient.getrawtransaction(txId, 1)).result;
    // Find the output index (vout) corresponding to the address
    let voutIndex = -1;
    for (let i = 0; i < fetchedTx.vout.length; i++) {
      const output = fetchedTx.vout[i];
      if (
        output.scriptPubKey &&
        output.scriptPubKey.address &&
        output.scriptPubKey.address.includes(address)
      ) {
        voutIndex = i;
        break;
      }
    }
    if (voutIndex === -1) {
      throw new Error('Could not find the output index for the given address');
    }
    // Verify the UTXO exists using getTxOut
    let counter = 10;
    let unspent;
    do {
      unspent = await nativeRpcClient.getTxOut(txId, voutIndex, true);
    } while (unspent.error && counter--);
    if (unspent.error) {
      throw new Error('Could not find the faucet transaction');
    }
    const txvb = new Psbt({ network });
    txvb.addInput({
      hash: txId,
      index: voutIndex,
      nonWitnessUtxo: Buffer.from(fetchedTx.hex, 'hex'),
    });
    txvb.addOutput({
      script,
      value,
    });
    txvb.signInput(0, key);
    txvb.finalizeAllInputs();
    const txv = txvb.extractTransaction(true);
    const { result: txIdScript } = await nativeRpcClient.sendrawtransaction(
      txv.toHex(),
    );
    // let counter = 5;
    // let foundPsbt;
    // while (!foundPsbt) {
    //   const scriptASM = bscript.toASM(Buffer.from(script, 'hex'));
    //   // eslint-disable-next-line no-await-in-loop
    //   const unspents = await UtxoAction.selectByScriptASM(scriptASM);
    //   // eslint-disable-next-line prefer-destructuring
    //   foundPsbt = unspents.filter((x: any) => x.txId === txv.getId())[0];
    //   if (!foundPsbt) {
    //     counter -= 1;
    //     if (counter <= 0) throw new Error('No outputs');
    //     // eslint-disable-next-line no-await-in-loop
    //     await sleep(10);
    //   }
    // }
    // Check the vout
    let voutPsbt = 0;
    let foundPsbt = await nativeRpcClient.getTxOut(txIdScript, voutPsbt, true);
    if (foundPsbt.error)
      foundPsbt = await nativeRpcClient.getTxOut(txIdScript, ++voutPsbt, true);
    if (foundPsbt.error)
      foundPsbt = await nativeRpcClient.getTxOut(txIdScript, ++voutPsbt, true);
    if (foundPsbt.error) throw new Error('No UTXO found');
    return {
      txId: txv.getId(),
      vout: voutPsbt,
      height: -1,
      satoshis: foundPsbt.result.value * 1e8,
    };
  }
}
