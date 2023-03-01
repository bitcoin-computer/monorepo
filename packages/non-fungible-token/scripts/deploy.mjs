import { config } from 'dotenv';
import { Computer } from '@bitcoin-computer/lib'
import { Payment } from '../src/contracts/payment.mjs'
import { Royalty } from '../src/contracts/royalty.mjs'
import { Offer } from '../src/contracts/offer.mjs'
import { NFT } from '../src/contracts/nft.mjs'
import readline from 'readline';

config()

const mnemonic = process.env.MNEMONIC;
const chain = process.env.CHAIN || 'LTC'
const network = process.env.NETWORK || 'regtest'
const url = process.env.BCN_URL || 'http://127.0.0.1:3000'

if (!mnemonic) {
  throw new Error('Please set your MNEMONIC in a .env file')
}

const computer = new Computer({ mnemonic, chain, network, url })

// Prompt the user to confirm an action
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const paymentModule = `export ${Payment.toString()};`
const royaltyModule = (paymentModSpec) => `import { Payment } from '${paymentModSpec}';
export ${Royalty.toString()};`
const offerModule = `export ${Offer.toString()};`
const nftModule = (royaltyModSpec) => `import { Royalty } from '${royaltyModSpec}';
export ${NFT.toString()};`

const balance = await computer.wallet.getBalance()

// Summary
console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance/1e8}\x1b[0m

Payment Contract
\x1b[2m${paymentModule}\x1b[0m

Royalty Contract
\x1b[2m${royaltyModule('<payment-module-specifier>')}\x1b[0m

Nft Contract
\x1b[2m${nftModule('<royalty-module-specifier>')}\x1b[0m

Offer Contract
\x1b[2m${offerModule}\x1b[0m
`)

const q = `
Do you want to deploy the contracts? (y/n)
`
rl.question(q, async (answer) => {
  if (answer === 'y') {
    console.log('\n  Deploying contracts...')

    const paymentModSpec = await computer.export(paymentModule)
    const royaltyModSpec = await computer.export(royaltyModule(paymentModSpec))
    const nftModSpec = await computer.export(nftModule(royaltyModSpec))
    const offerModSpec = await computer.export(offerModule)

    console.log(`
Export successful
\x1b[2mYou can copy these module specifiers into src/App.js\x1b[0m

const paymentModSpec = \x1b[2m'${paymentModSpec}'\x1b[0m
const royaltyModSpec = \x1b[2m'${royaltyModSpec}'\x1b[0m
const nftModSpec = \x1b[2m'${nftModSpec}'\x1b[0m
const offerModSpec = \x1b[2m'${offerModSpec}'\x1b[0m
`)

  } else {
    console.log('Aborting...');
  }
  rl.close();
});
