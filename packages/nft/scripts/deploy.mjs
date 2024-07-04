import { config } from "dotenv"
import readline from "readline"
import { NFT, TBC721 } from "@bitcoin-computer/TBC721"
import {
  Offer,
  OfferHelper,
  Payment,
  PaymentHelper,
  Sale,
  SaleHelper
} from "@bitcoin-computer/swap"
const { Computer } = await import("@bitcoin-computer/lib")

config()

const mnemonic = process.env.MNEMONIC
const chain = process.env.CHAIN || "LTC"
const network = process.env.NETWORK || "regtest"
const url = process.env.BCN_URL || "http://127.0.0.1:1031"

if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file")
}

const computer = new Computer({ chain, network, url })

// Prompt the user to confirm an action
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

await computer.faucet(2e8)
const balance = await computer.wallet.getBalance()

// Summary
console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance / 1e8}\x1b[0m
`)

const q = `
Do you want to deploy the contracts? (y/n)
`
rl.question(q, async (answer) => {
  if (answer !== "n") {
    try {
      console.log("Deploying NFT contract...")
      console.log(`export ${NFT}`)
      const tbc721 = new TBC721(computer)
      const modSpec = await tbc721.deploy()

      console.log("Deploying Offer contract...")
      console.log(`export ${Offer}`)
      const offerHelper = new OfferHelper(computer)
      const offerModSpec = await offerHelper.deploy()

      console.log("Deploying Sale contract...")
      console.log(`export ${Sale}`)
      const saleHelper = new SaleHelper(computer)
      const saleModSpec = await saleHelper.deploy()

      console.log("Deploying Payment contract...")
      console.log(`export ${Payment}`)
      const paymentHelper = new PaymentHelper(computer)
      const paymentModSpec = await paymentHelper.deploy()

      // Log the module specifiers
      console.log(`// Updaate env variables/file with module specifiers for deployed contracts
REACT_APP_NFT_MOD_SPEC=${modSpec}
REACT_APP_OFFER_MOD_SPEC=${offerModSpec}
REACT_APP_SALE_MOD_SPEC=${saleModSpec}
REACT_APP_PAYMENT_MOD_SPEC=${paymentModSpec}
`)

      console.log("\nDeployment successful. Please update your env variables.")
    } catch (err) {
      console.log(err)
    }

    console.log(`\nSuccessfully created smart objects`)
  } else {
    console.log("Aborting...")
  }
  rl.close()
})
