import { config } from "dotenv"
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { TBC721 } from "@bitcoin-computer/TBC721"
import { OfferHelper, PaymentHelper, SaleHelper } from "@bitcoin-computer/swap"

const { Computer } = await import("@bitcoin-computer/lib")

config()

const { REACT_APP_CHAIN, REACT_APP_NETWORK, MNEMONIC, REACT_APP_LTC_REGTEST_URL } = process.env
const mnemonic = MNEMONIC
const chain = REACT_APP_CHAIN
const network = REACT_APP_NETWORK
const url = REACT_APP_LTC_REGTEST_URL

const computerProps = { chain, network, mnemonic, url }

if (network !== "regtest") {
  if (!mnemonic) throw new Error("Please set MNEMONIC in the .env file")
  computerProps["mnemonic"] = mnemonic
}
 
const computer = new Computer(computerProps)
await computer.faucet(2e8)
const balance = await computer.wallet.getBalance()

// Summary
console.log(`Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance / 1e8}\x1b[0m`)

const rl = readline.createInterface({ input, output })
const answer = await rl.question('\nDo you want to deploy the contracts? (y/n)')
if (answer === 'n') {
  console.log("Aborting...")
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
Update the following rows in your .env file.

REACT_APP_NFT_MOD_SPEC=${modSpec}
REACT_APP_OFFER_MOD_SPEC=${offerModSpec}
REACT_APP_SALE_MOD_SPEC=${saleModSpec}
REACT_APP_PAYMENT_MOD_SPEC=${paymentModSpec}

Run 'npm start' to start the application.`)
}

rl.close()
