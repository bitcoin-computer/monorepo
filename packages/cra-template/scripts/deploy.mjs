import { config } from "dotenv"
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { Contract } from "@bitcoin-computer/lib"

// todo: import from file instead of defining the class here
// import { Counter } from "../src/contracts/counter"
export class Counter extends Contract {
  constructor() {
    super({ count: 0 })
  }

  inc() {
    this.count += 1
  }
}

const { Computer } = await import("@bitcoin-computer/lib")

config()

const rl = readline.createInterface({ input, output })

const { REACT_APP_CHAIN: chain, REACT_APP_NETWORK: network, REACT_APP_URL: url, REACT_APP_MNEMONIC: mnemonic } = process.env
 
const computer = new Computer({ chain, network, mnemonic, url })
await computer.faucet(2e8)
const balance = await computer.wallet.getBalance()

// Summary
console.log(`Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance / 1e8}\x1b[0m`)

const answer = await rl.question('\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m')
if (answer === 'n') {
  console.log("\n Aborting...\n")
} else {
  console.log("\n * Deploying counter contract...")
  const counterModSpec = await computer.deploy(Counter)

  console.log(`
Successfully deployed smart contracts.

-----------------
 ACTION REQUIRED
-----------------

(1) Update the following row in your .env file.

REACT_APP_COUNTER_MOD_SPEC\x1b[2m=${counterModSpec}\x1b[0m

(2) Run 'npm start' to start the application.
`)
}

rl.close()
