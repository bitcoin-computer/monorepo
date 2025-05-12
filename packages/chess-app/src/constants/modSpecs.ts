/// <reference types="vite/client" />

import 'dotenv/config'

let API_BASE_URL: string
let VITE_CHESS_GAME_MOD_SPEC: string
let VITE_CHESS_USER_MOD_SPEC: string

if (
  typeof import.meta !== 'undefined' &&
  import.meta.env?.VITE_API_BASE_URL &&
  import.meta.env?.VITE_CHESS_GAME_MOD_SPEC &&
  import.meta.env?.VITE_CHESS_USER_MOD_SPEC
) {
  // Vite environment
  API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  VITE_CHESS_GAME_MOD_SPEC = import.meta.env.VITE_CHESS_GAME_MOD_SPEC
  VITE_CHESS_USER_MOD_SPEC = import.meta.env.VITE_CHESS_USER_MOD_SPEC
} else {
  // Node.js environment
  if (!process.env.VITE_API_BASE_URL)
    throw new Error('VITE_API_BASE_URL is not defined in the .env file.')
  if (!process.env.VITE_CHESS_GAME_MOD_SPEC)
    throw new Error('VITE_CHESS_GAME_MOD_SPEC is not defined in the .env file.')
  if (!process.env.VITE_CHESS_USER_MOD_SPEC)
    throw new Error('VITE_CHESS_USER_MOD_SPEC is not defined in the .env file.')
  API_BASE_URL = process.env.VITE_API_BASE_URL
  VITE_CHESS_GAME_MOD_SPEC = process.env.VITE_CHESS_GAME_MOD_SPEC
  VITE_CHESS_USER_MOD_SPEC = process.env.VITE_CHESS_USER_MOD_SPEC
}

export { API_BASE_URL, VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC }
