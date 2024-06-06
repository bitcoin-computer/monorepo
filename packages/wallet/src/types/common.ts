export type Chain = "LTC" | "BTC"
export type Network = "livenet" | "testnet" | "mainnet" | "regtest"

export type TableTx = {
  txId: string
  satoshis: number
}

export type TableTxs = {
  sentTxs: TableTx[]
  receivedTxs: TableTx[]
}
