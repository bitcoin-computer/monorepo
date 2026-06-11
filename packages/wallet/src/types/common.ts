export type Chain = 'LTC' | 'BTC' | 'DOGE' | 'PEPE'
export type Network = 'livenet' | 'testnet' | 'mainnet' | 'regtest'

export type TableTx = {
  txId: string
  satoshis: bigint
}

export type TableTxs = {
  sentTxs: TableTx[]
  receivedTxs: TableTx[]
}
