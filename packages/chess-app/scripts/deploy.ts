import { Computer } from "@bitcoin-computer/lib"
import { ChessGame } from "../src/contracts/chess-game.js"
import { config } from "dotenv"
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import * as fs from "fs/promises"

config()

const { VITE_CHAIN: chain, VITE_NETWORK: network, VITE_URL: url, MNEMONIC: mnemonic } = process.env

const rl = readline.createInterface({ input, output })

if (network !== "regtest" && !mnemonic) throw new Error("Please set MNEMONIC in the .env file")

const computer = new Computer({ chain, network, mnemonic, url })
await computer.faucet(2e8)
const { balance } = await computer.getBalance()

console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance / 1e8}\x1b[0m`)

const answer = await rl.question("\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m")
if (answer === "n") {
  console.log(" - Aborting...")
  rl.close()
  process.exit(0)
}

const chessFile = await fs.readFile("./src/contracts/chess.mjs", "utf-8")
const chessModSpec = await computer.deploy(`${chessFile}`)
const chessGameModSpec = await computer.deploy(`
  import { Chess } from "${chessModSpec}"
  export ${ChessGame}
`)

console.log(' \x1b[2m- Successfully deployed smart contracts\x1b[0m')

const answer2 = await rl.question("\nDo you want to update your .env files? \x1b[2m(y/n)\x1b[0m")
if (answer2 === "n") {
  console.log(`
-----------------
ACTION REQUIRED
-----------------
    
Update the following rows in your .env file.

VITE_CHESS_MODULE_MOD_SPEC\x1b[2m=${chessModSpec}\x1b[0m
VITE_CHESS_GAME_MOD_SPEC\x1b[2m=${chessGameModSpec}\x1b[0m
`)
} else {
  // Update module specifiers in the .env file
  const lines = (await fs.readFile('.env', 'utf-8')).split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('VITE_CHESS_MODULE_MOD_SPEC')) {
      lines[i] = `VITE_CHESS_MODULE_MOD_SPEC=${chessModSpec}`
    }
    if (lines[i].startsWith('VITE_CHESS_GAME_MOD_SPEC')) {
      lines[i] = `VITE_CHESS_GAME_MOD_SPEC=${chessGameModSpec}`
    }
  }
  await fs.writeFile('.env', lines.join('\n'), 'utf-8')
  console.log(' \x1b[2m- Successfully updated .env file\x1b[0m')
}

console.log("\nRun 'npm start' to start the application.\n")
rl.close()
