const CHAIN = process.env.CHAIN || 'LTC'
const NETWORK = process.env.NETWORK || 'testnet'
const BCN_URL = process.env.BCN_URL || 'https://node.bitcoincomputer.io'
const RPC_USER = process.env.RPC_USER || 'bcn-admin'
const RPC_PASSWORD = process.env.RPC_PASSWORD || 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
const TEST_MNEMONICS = 'travel upgrade inside soda birth essence junk merit never twenty system opinion;toddler hockey salute wheel harvest video narrow riot guitar lake sea call;cannon hour begin test replace fury motion squirrel envelope announce neck culture'

export {
  CHAIN,
  NETWORK,
  BCN_URL,
  RPC_USER,
  RPC_PASSWORD,
  TEST_MNEMONICS
}
