import { Computer } from "@bitcoin-computer/lib"
import { config } from "dotenv"
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { readFile, writeFile } from "fs/promises"
import { deploy } from "./lib.js"
import { CHAIN, NETWORK, URL, MNEMONIC } from '../src/config.js'

config()

const rl = createInterface({ input, output })

if (NETWORK !== "regtest" && !MNEMONIC) throw new Error("Please set MNEMONIC in the .env file")

const computer = new Computer({ chain: CHAIN, network: NETWORK, url: URL })
await computer.faucet(2e8)
const { balance } = await computer.getBalance()

console.log(`
Chain \x1b[2m${CHAIN}\x1b[0m
Network \x1b[2m${NETWORK}\x1b[0m
Node Url \x1b[2m${URL}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Mnemonic \x1b[2m${MNEMONIC}\x1b[0m
Balance \x1b[2m${balance / 1e8}\x1b[0m`)

const answer = await rl.question("\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m")
if (answer === "n") {
  console.log(" - Aborting...")
  rl.close()
  process.exit(0)
}

const mod = await deploy(computer)
console.log(" \x1b[2m- Successfully deployed smart contracts\x1b[0m")

const answer2 = await rl.question("\nDo you want to update your .env files? \x1b[2m(y/n)\x1b[0m")
if (answer2 === "n") {
  console.log(`
-----------------
ACTION REQUIRED
-----------------
    
Update the following rows in your .env file.

VITE_CHESS_GAME_MOD_SPEC\x1b[2m=${mod}\x1b[0m
`)
} else {
  // Update module specifiers in the .env file
  const lines = (await readFile(".env", "utf-8")).split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("VITE_CHESS_GAME_MOD_SPEC")) {
      lines[i] = `VITE_CHESS_GAME_MOD_SPEC=${mod}`
    }
  }
  await writeFile(".env", lines.join("\n"), "utf-8")
  console.log(" \x1b[2m- Successfully updated .env file\x1b[0m")
}

console.log("\nRun 'npm start' to start the application.\n")
rl.close()
