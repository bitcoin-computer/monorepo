import { config } from "dotenv"
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { Computer } from "@bitcoin-computer/lib"
import { TBC721 } from "@bitcoin-computer/TBC721"
import { OfferHelper, PaymentHelper, SaleHelper } from "@bitcoin-computer/swap"

config()

const rl = readline.createInterface({ input, output })

const { CHAIN: chain, NETWORK: network, URL: url, MNEMONIC: mnemonic } = process.env

if (network !== "regtest") {
  if (!mnemonic) throw new Error("Please set MNEMONIC in the .env file")
  computerProps["mnemonic"] = mnemonic
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
  console.log("\n * Deploying NFT contract...")
  const tbc721 = new TBC721(computer)
  const modSpec = await tbc721.deploy()

  console.log(" * Deploying Offer contract...")
  const offerHelper = new OfferHelper(computer)
  const offerModSpec = await offerHelper.deploy()

  console.log(" * Deploying Sale contract...")
  const saleHelper = new SaleHelper(computer)
  const saleModSpec = await saleHelper.deploy()

  console.log(" * Deploying Payment contract...")
  const paymentHelper = new PaymentHelper(computer)
  const paymentModSpec = await paymentHelper.deploy()

  console.log(`
Successfully deployed smart contracts.

-----------------
 ACTION REQUIRED
-----------------

(1) Update the following rows in your .env file.

VITE_NFT_MOD_SPEC\x1b[2m=${modSpec}\x1b[0m
VITE_OFFER_MOD_SPEC\x1b[2m=${offerModSpec}\x1b[0m
VITE_SALE_MOD_SPEC\x1b[2m=${saleModSpec}\x1b[0m
VITE_PAYMENT_MOD_SPEC\x1b[2m=${paymentModSpec}\x1b[0m

(2) Run 'npm start' to start the application.
`)
}

rl.close()
