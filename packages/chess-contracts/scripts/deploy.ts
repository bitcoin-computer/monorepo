import { Computer } from '@bitcoin-computer/lib'
import { config } from 'dotenv'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { readFile, writeFile } from 'fs/promises'
import { deploy } from './lib.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { User } from '../src/user.js'
import { TBC777M, TBC20 } from '@bitcoin-computer/TBC777'
import { ChessChallengeTxWrapper } from '../src/chess-challenge.js'

config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const chessContractDirectory = `${__dirname}/..`

const {
  VITE_CHAIN: chain,
  VITE_NETWORK: network,
  VITE_URL: url,
  MNEMONIC: mnemonic,
  VITE_PATH: path,
} = process.env

const rl = createInterface({ input, output })

if (!network || !chain || !url) throw new Error('Please set the .env file')
if (network !== 'regtest' && !mnemonic) throw new Error('Please set MNEMONIC in the .env file')

const computer = new Computer({ chain, network, mnemonic, url, path })
if (network === 'regtest') await computer.faucet(2e8)
const { balance } = await computer.getBalance()
const minterMnemonic =
  mnemonic ?? (computer as unknown as { getMnemonic?: () => string }).getMnemonic?.()
if (!minterMnemonic) throw new Error('Failed to resolve minter mnemonic')

console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance} satoshis\x1b[0m`)

const answer = await rl.question('\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m')
if (answer === 'n') {
  console.log(' - Aborting...')
  rl.close()
  process.exit(0)
}

const mod = await deploy(computer, chessContractDirectory)
const userMod = await computer.deploy(`export ${User}`)
const challengeMod = await computer.deploy(`export ${ChessChallengeTxWrapper}`)
const tbc20Mod = await computer.deploy(`export ${TBC20}`)
const tokenMod = await computer.deploy(`import {TBC20} from '${tbc20Mod}'; export ${TBC777M}`)
const token = await computer.new(
  TBC777M,
  [{ to: computer.getPublicKey(), amount: 1000000n, name: 'chess-token' }],
  tbc20Mod,
)
console.log(' \x1b[2m- Successfully deployed smart contracts\x1b[0m')
console.log(` \x1b[2m- Minted chess token: ${token._id}\x1b[0m`)

const answer2 = await rl.question('\nDo you want to update your .env files? \x1b[2m(y/n)\x1b[0m')
if (answer2 === 'n') {
  console.log(`
-----------------
ACTION REQUIRED
-----------------
    
Update the following rows in your .env file.

VITE_CHESS_GAME_MOD_SPEC\x1b[2m=${mod}\x1b[0m
VITE_CHESS_USER_MOD_SPEC\x1b[2m=${userMod}\x1b[0m
VITE_CHESS_CHALLENGE_MOD_SPEC\x1b[2m=${challengeMod}\x1b[0m
VITE_TOKEN_MOD_SPEC\x1b[2m=${tokenMod}\x1b[0m
VITE_TBC20_MOD_SPEC\x1b[2m=${tbc20Mod}\x1b[0m
VITE_MINTER_MNEMONIC\x1b[2m=${minterMnemonic}\x1b[0m
VITE_CHESS_TOKEN_ID\x1b[2m=${token._id}\x1b[0m
`)
} else {
  const files = ['../chess-app/.env']

  for (const file of files) {
    // Update module specifiers in the .env file
    const lines = (await readFile(file, 'utf-8')).split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('VITE_CHESS_GAME_MOD_SPEC'))
        lines[i] = `VITE_CHESS_GAME_MOD_SPEC=${mod}`
      if (lines[i].startsWith('VITE_CHESS_USER_MOD_SPEC'))
        lines[i] = `VITE_CHESS_USER_MOD_SPEC=${userMod}`
      if (lines[i].startsWith('VITE_CHESS_CHALLENGE_MOD_SPEC'))
        lines[i] = `VITE_CHESS_CHALLENGE_MOD_SPEC=${challengeMod}`
      if (lines[i].startsWith('VITE_TBC20_MOD_SPEC')) lines[i] = `VITE_TBC20_MOD_SPEC=${tbc20Mod}`
      if (lines[i].startsWith('VITE_TOKEN_MOD_SPEC')) lines[i] = `VITE_TOKEN_MOD_SPEC=${tokenMod}`
      if (lines[i].startsWith('VITE_MINTER_MNEMONIC'))
        lines[i] = `VITE_MINTER_MNEMONIC=${minterMnemonic}`
      if (lines[i].startsWith('VITE_CHESS_TOKEN_ID')) lines[i] = `VITE_CHESS_TOKEN_ID=${token._id}`
    }
    if (!lines.some((line) => line.startsWith('VITE_MINTER_MNEMONIC')))
      lines.push(`VITE_MINTER_MNEMONIC=${minterMnemonic}`)
    if (!lines.some((line) => line.startsWith('VITE_CHESS_TOKEN_ID')))
      lines.push(`VITE_CHESS_TOKEN_ID=${token._id}`)
    await writeFile(file, lines.join('\n'), 'utf-8')
  }

  console.log(' \x1b[2m- Successfully updated ../chess-app/.env file\x1b[0m')
}

console.log("\nRun 'npm start' to start the application.\n")
rl.close()
