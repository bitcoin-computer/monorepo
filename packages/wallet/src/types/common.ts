export type Chain = 'LTC' | 'BTC'
export type Network = 'livenet' | 'testnet' | 'mainnet' | 'regtest'

export type TxJson = {
  txId: string,
  satoshis: number
}