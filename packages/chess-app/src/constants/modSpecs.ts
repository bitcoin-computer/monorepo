/// <reference types="vite/client" />

import 'dotenv/config'

let VITE_CHESS_GAME_MOD_SPEC: string
let VITE_CHESS_USER_MOD_SPEC: string
let VITE_CHESS_CHALLENGE_MOD_SPEC: string

if (
  typeof import.meta !== 'undefined' &&
  import.meta.env?.VITE_CHESS_GAME_MOD_SPEC &&
  import.meta.env?.VITE_CHESS_USER_MOD_SPEC &&
  import.meta.env?.VITE_CHESS_CHALLENGE_MOD_SPEC
) {
  // Vite environment
  VITE_CHESS_GAME_MOD_SPEC = import.meta.env.VITE_CHESS_GAME_MOD_SPEC
  VITE_CHESS_USER_MOD_SPEC = import.meta.env.VITE_CHESS_USER_MOD_SPEC
  VITE_CHESS_CHALLENGE_MOD_SPEC = import.meta.env.VITE_CHESS_CHALLENGE_MOD_SPEC
} else {
  // Node.js environment
  if (!process.env.VITE_CHESS_GAME_MOD_SPEC)
    throw new Error('VITE_CHESS_GAME_MOD_SPEC is not defined in the .env file.')
  if (!process.env.VITE_CHESS_USER_MOD_SPEC)
    throw new Error('VITE_CHESS_USER_MOD_SPEC is not defined in the .env file.')
  if (!process.env.VITE_CHESS_CHALLENGE_MOD_SPEC)
    throw new Error('VITE_CHESS_CHALLENGE_MOD_SPEC is not defined in the .env file.')
  VITE_CHESS_GAME_MOD_SPEC = process.env.VITE_CHESS_GAME_MOD_SPEC
  VITE_CHESS_USER_MOD_SPEC = process.env.VITE_CHESS_USER_MOD_SPEC
  VITE_CHESS_CHALLENGE_MOD_SPEC = process.env.VITE_CHESS_CHALLENGE_MOD_SPEC
}

export { VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC, VITE_CHESS_CHALLENGE_MOD_SPEC }
