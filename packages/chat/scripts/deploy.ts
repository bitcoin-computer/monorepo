import { config } from "dotenv"
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { Computer } from "@bitcoin-computer/lib"
import { ChatSc } from "../src/contracts/chat.js"

config()

const rl = readline.createInterface({ input, output })

const { VITE_CHAIN: chain, VITE_NETWORK: network, VITE_URL: url, MNEMONIC: mnemonic } = process.env

if (network !== "regtest") {
  if (!mnemonic) throw new Error("Please set MNEMONIC in the .env file")
}

const computer = new Computer({ chain, network, mnemonic, url })
if (network === "regtest") {
  await computer.faucet(2e8)
}

const balance = await computer.wallet.getBalance()

// Summary
console.log(`Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance.balance / 1e8}\x1b[0m`)

const answer = await rl.question("\nDo you want to deploy the contract? \x1b[2m(y/n)\x1b[0m")
if (answer === "n") {
  console.log("\n Aborting...\n")
} else {
  console.log("\n * Deploying ChatSc contract...")
  const chatModSpec = await computer.deploy(`export ${ChatSc}`)

  console.log(`
Successfully deployed chat smart contract.

-----------------
 ACTION REQUIRED
-----------------

(1) Update the following rows in your .env file.

VITE_CHAT_MOD_SPEC\x1b[2m=${chatModSpec}\x1b[0m
(2) Run 'npm start' to start the application.
`)
}

rl.close()