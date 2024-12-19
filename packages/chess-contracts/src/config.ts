/// <reference types="vite/client" />

import 'dotenv/config'

let API_BASE_URL: string | undefined
let CHESS_GAME_MOD_SPEC: string | undefined
let CHAIN: string | undefined
let NETWORK: string | undefined
let URL: string | undefined
let MNEMONIC: string | undefined

// Vite environment
if (import.meta.env && import.meta.env.MODE) {
  API_BASE_URL = import.meta.env.API_BASE_URL
  CHESS_GAME_MOD_SPEC = import.meta.env.CHESS_GAME_MOD_SPEC
  CHAIN = import.meta.env.CHAIN
  NETWORK = import.meta.env.NETWORK
  URL = import.meta.env.URL
  MNEMONIC = import.meta.env.MNEMONIC

// Node.js environment
} else if (typeof process === 'object' && process.versions && process.versions.node) {
  API_BASE_URL = process.env.API_BASE_URL
  CHESS_GAME_MOD_SPEC = process.env.CHESS_GAME_MOD_SPEC
  CHAIN = process.env.CHAIN
  NETWORK = process.env.NETWORK
  URL = process.env.URL
  MNEMONIC = process.env.MNEMONIC

} else {
  throw new Error('Unsupported execution environment.')
}

export { API_BASE_URL, CHESS_GAME_MOD_SPEC, CHAIN, NETWORK, URL, MNEMONIC }