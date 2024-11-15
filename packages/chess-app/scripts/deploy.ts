import { Computer } from "@bitcoin-computer/lib"
import { ChessGame } from "../src/contracts/chess-game.js"
import { config } from "dotenv"
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import * as fs from "fs"

config()

const rl = readline.createInterface({ input, output })

const { VITE_CHAIN: chain, VITE_NETWORK: network, VITE_URL: url, MNEMONIC: mnemonic } = process.env

if (network !== "regtest") {
  if (!mnemonic) throw new Error("Please set MNEMONIC in the .env file")
}

const computer = new Computer({ chain, network, mnemonic, url })
await computer.faucet(2e8)
const balance = await computer.wallet.getBalance()

// Summary
console.log(`Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance.balance / 1e8}\x1b[0m`)

const answer = await rl.question("\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m")
if (answer === "n") {
  console.log("\n Aborting...\n")
} else {
  fs.readFile("./src/contracts/chess.mjs", "utf-8", async (err, chessFile) => {
    if (err) {
      console.error("Error reading file:", err)
      return
    }
    console.log("\n * Deploying Chess contract...")
    const chessModSpec = await computer.deploy(`${chessFile}`)
    const chessGameModSpec = await computer.deploy(`
      import { Chess } from "${chessModSpec}"
      export ${ChessGame}
    `)

    console.log(`
    import { Chess } from "${chessModSpec}"
    export ${ChessGame}
  `)

    console.log(`
Successfully deployed smart contracts.

-----------------
  ACTION REQUIRED
-----------------

(1) Update the following rows in your .env file.

VITE_CHESS_MODULE_MOD_SPEC\x1b[2m=${chessModSpec}\x1b[0m
VITE_CHESS_GAME_MOD_SPEC\x1b[2m=${chessGameModSpec}\x1b[0m

(2) Run 'npm start' to start the application.
`)
  })
}

rl.close()
