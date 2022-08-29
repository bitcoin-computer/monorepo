const {
  CHAIN: chain,
  NETWORK: network,
  BCN_URL: bcnUrl,
  RPC_USER: rpcUser,
  RPC_PASSWORD: rpcPassword,
  TEST_MNEMONICS: testMnemonics,
} = process.env

export const CHAIN = chain || 'LTC'
export const NETWORK = network || 'testnet'
export const BCN_URL = bcnUrl || 'https://node.bitcoincomputer.io'
export const RPC_USER = rpcUser || 'bcn-admin'
export const RPC_PASSWORD = rpcPassword || 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
export const TEST_MNEMONICS =
  testMnemonics ||
  'travel upgrade inside soda birth essence junk merit never twenty system opinion;toddler hockey salute wheel harvest video narrow riot guitar lake sea call;cannon hour begin test replace fury motion squirrel envelope announce neck culture'
export const MIN_NON_DUST_AMOUNT =
  parseInt(process.env.BC_DUST_LIMIT || '', 10) || (CHAIN === 'LTC' ? 15460 : 1546)
