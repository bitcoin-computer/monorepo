import { config } from "dotenv"
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { TBC20 } from "@bitcoin-computer/TBC20"
import { OfferHelper, PaymentHelper, SaleHelper, StaticSwapHelper, BuyHelper } from "@bitcoin-computer/swap"

const { Computer } = await import("@bitcoin-computer/lib")

config()

const rl = readline.createInterface({ input, output })

const { REACT_APP_CHAIN: chain, REACT_APP_NETWORK: network, REACT_APP_URL: url, REACT_APP_MNEMONIC: mnemonic } = process.env
 
const computer = new Computer({ chain, network, mnemonic, url })
await computer.faucet(2e8)
const { balance } = await computer.wallet.getBalance()

// Summary
console.log(`Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance / 1e8} ${computer.getNetwork()} ${computer.getChain()} \x1b[0m`)

const answer = await rl.question('\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m')
if (answer === 'n') {
  console.log("\n Aborting...\n")
} else {
  console.log("\n * Deploying Token contract...")
  const tbc721 = new TBC20(computer)
  const tokenModSpec = await tbc721.deploy()

  console.log(" * Deploying Offer contract...")
  const offerHelper = new OfferHelper(computer)
  const offerModSpec = await offerHelper.deploy()

  console.log(" * Deploying Buy contract...")
  const buyHelper = new BuyHelper(computer)
  const buyModSpec = await buyHelper.deploy()

  console.log(" * Deploying Sale contract...")
  const saleHelper = new SaleHelper(computer)
  const saleModSpec = await saleHelper.deploy()

  console.log(" * Deploying Swap contract...")
  const swapHelper = new StaticSwapHelper(computer)
  const swapModSpec = await swapHelper.deploy()

  console.log(" * Deploying Payment contract...")
  const paymentHelper = new PaymentHelper(computer)
  const paymentModSpec = await paymentHelper.deploy()

  console.log(`
Successfully deployed smart contracts.

-----------------
 ACTION REQUIRED
-----------------

(1) Update the following row in your .env file.

REACT_APP_TOKEN_MOD_SPEC\x1b[2m=${tokenModSpec}\x1b[0m
REACT_APP_OFFER_MOD_SPEC\x1b[2m=${offerModSpec}\x1b[0m
REACT_APP_BUY_MOD_SPEC\x1b[2m=${buyModSpec}\x1b[0m
REACT_APP_SALE_MOD_SPEC\x1b[2m=${saleModSpec}\x1b[0m
REACT_APP_SWAP_MOD_SPEC\x1b[2m=${swapModSpec}\x1b[0m
REACT_APP_PAYMENT_MOD_SPEC\x1b[2m=${paymentModSpec}\x1b[0m

(2) Run 'npm start' to start the application.
`)
}

rl.close()
