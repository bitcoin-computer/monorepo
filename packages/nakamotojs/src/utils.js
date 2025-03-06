export const rpcJSON2CB = tx => {
  return {
    txId: tx.txid,
    txHex: tx.hex,
    vsize: tx.vsize,
    version: tx.version,
    locktime: tx.locktime,
    ins: tx.vin.map(x => {
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
    outs: tx.vout.map(x => {
      let address;
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
