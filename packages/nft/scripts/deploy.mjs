import { config } from 'dotenv'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { readFile, writeFile } from 'fs/promises'
import { Computer } from '@bitcoin-computer/lib'
import { NftHelper } from '@bitcoin-computer/TBC721'
import { TxWrapperHelper, PaymentHelper, SaleHelper } from '@bitcoin-computer/swap'

config()

const rl = readline.createInterface({ input, output })

const {
  VITE_CHAIN: chain,
  VITE_NETWORK: network,
  VITE_URL: url,
  MNEMONIC: mnemonic,
  VITE_PATH: path,
} = process.env

if (network !== 'regtest') {
  if (!mnemonic) throw new Error('Please set MNEMONIC in the .env file')
}

const computer = new Computer({ chain, network, mnemonic, path, url })

if (network === 'regtest') await computer.faucet(2e8)
const balance = await computer.db.wallet.getBalance()

// Summary
console.log(`Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Path \x1b[2m${path}\x1b[0m
Balance \x1b[2m${balance.balance} satoshis\x1b[0m`)

const answer = await rl.question('\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m')
if (answer === 'n') {
  console.log('\n Aborting...\n')
} else {
  console.log('\n * Deploying NFT contract...')
  const nftHelper = new NftHelper(computer)
  const nftModSpec = await nftHelper.deploy()

  console.log(' * Deploying TxWrapper contract...')
  const txWrapperHelper = new TxWrapperHelper(computer)
  const txWrapperModSpec = await txWrapperHelper.deploy()

  console.log(' * Deploying Sale contract...')
  const saleHelper = new SaleHelper(computer)
  const saleModSpec = await saleHelper.deploy()

  console.log(' * Deploying Payment contract...')
  const paymentHelper = new PaymentHelper(computer)
  const paymentModSpec = await paymentHelper.deploy()

  console.log(' \x1b[2m- Successfully deployed smart contracts\x1b[0m')
  const answer2 = await rl.question('\nDo you want to update your .env files? \x1b[2m(y/n)\x1b[0m')
  if (answer2 === 'n') {
    console.log(`
    -----------------
    ACTION REQUIRED
    -----------------

    (1) Update the following rows in your .env file.

    VITE_NFT_MOD_SPEC\x1b[2m=${nftModSpec}\x1b[0m
    VITE_TX_WRAPPER_MOD_SPEC\x1b[2m=${txWrapperModSpec}\x1b[0m
    VITE_SALE_MOD_SPEC\x1b[2m=${saleModSpec}\x1b[0m
    VITE_PAYMENT_MOD_SPEC\x1b[2m=${paymentModSpec}\x1b[0m

    (2) Run 'npm start' to start the application.
    `)
  } else {
    const file = '.env'

    // Update module specifiers in the .env file
    const lines = (await readFile(file, 'utf-8')).split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('VITE_NFT_MOD_SPEC')) lines[i] = `VITE_NFT_MOD_SPEC=${nftModSpec}`
      if (lines[i].startsWith('VITE_TX_WRAPPER_MOD_SPEC'))
        lines[i] = `VITE_TX_WRAPPER_MOD_SPEC=${txWrapperModSpec}`
      if (lines[i].startsWith('VITE_SALE_MOD_SPEC')) lines[i] = `VITE_SALE_MOD_SPEC=${saleModSpec}`
      if (lines[i].startsWith('VITE_PAYMENT_MOD_SPEC'))
        lines[i] = `VITE_PAYMENT_MOD_SPEC=${paymentModSpec}`
    }
    await writeFile(file, lines.join('\n'), 'utf-8')
    console.log(' \x1b[2m- Successfully updated .env file\x1b[0m')
  }
}

rl.close()
