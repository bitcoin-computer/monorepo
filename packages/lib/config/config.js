import { Chain, Network } from "../src/types"

export const CHAIN = process.env.CHAIN as Chain || 'LTC'
export const NETWORK = process.env.NETWORK as Network || 'testnet'
export const BCN_URL = process.env.BCN_URL || 'https://node.bitcoincomputer.io'
export const RPC_USER = process.env.RPC_USER || 'bcn-admin'
export const RPC_PASSWORD = process.env.RPC_PASSWORD || 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
export const TEST_MNEMONICS =
  process.env.TEST_MNEMONICS ||
  'travel upgrade inside soda birth essence junk merit never twenty system opinion;toddler hockey salute wheel harvest video narrow riot guitar lake sea call;cannon hour begin test replace fury motion squirrel envelope announce neck culture'

export const DUST_RELAY_TX_FEE = (CHAIN === 'LTC' ? 30000 : 3000)
export const MIN_NON_DUST_AMOUNT = (CHAIN === 'LTC' ? 5820 : 582)
