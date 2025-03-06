export interface _Transaction {
  txId: string;
  txHex: string;
  vsize: number;
  version: number;
  locktime: number;
  ins: _Input[];
  outs: _Output[];
}

export interface _Input {
  txId: string;
  vout: number;
  script: string;
  sequence: string;
}

export interface _Output {
  value: number;
  script: string;
  address?: string;
}

export const rpcJSON2CB = (tx: any): _Transaction => {
  return {
    txId: tx.txid,
    txHex: tx.hex,
    vsize: tx.vsize,
    version: tx.version,
    locktime: tx.locktime,
    ins: tx.vin.map((x: any) => {
      if (x.coinbase) {
        return {
          coinbase: x.coinbase,
          sequence: x.sequence,
        };
      }
      return {
        txId: x.txid,
        vout: x.vout,
        script: x.scriptSig.hex,
        sequence: x.sequence,
      };
    }),
    outs: tx.vout.map((x: any) => {
      let address: string | undefined;
      if (x.scriptPubKey.addresses) {
        [address] = x.scriptPubKey.addresses;
      } else if (x.scriptPubKey.address) {
        address = x.scriptPubKey.address;
      } else {
        address = undefined;
      }
      return {
        address,
        script: x.scriptPubKey.hex,
        value: Math.round(x.value * 1e8), // satoshis
      };
    }),
  };
};
