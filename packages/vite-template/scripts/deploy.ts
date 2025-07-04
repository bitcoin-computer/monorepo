import { Computer } from '@bitcoin-computer/lib'
import { Counter } from '../src/contracts/counter.js'
import { readFile, writeFile } from 'fs/promises'
import { config } from 'dotenv'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
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

const computer = new Computer({ chain, network, mnemonic, url, path })
if (network === 'regtest') await computer.faucet(2e8)
const balance = await computer.wallet.getBalance()

// Summary
console.log(`Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance.balance} satoshis\x1b[0m`)

const answer = await rl.question('\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m')
if (answer === 'n') {
  console.log('\n Aborting...\n')
} else {
  console.log('\n * Deploying Counter contract...')
  const counterModSpec = await computer.deploy(`export ${Counter}`)

  console.log(' \x1b[2m- Successfully deployed smart contracts\x1b[0m')
  const answer2 = await rl.question('\nDo you want to update your .env files? \x1b[2m(y/n)\x1b[0m')
  if (answer2 === 'n') {
    console.log(`

    -----------------
    ACTION REQUIRED
    -----------------

    (1) Update the following rows in your .env file.

    VITE_COUNTER_MOD_SPEC\x1b[2m=${counterModSpec}\x1b[0m

    (2) Run 'npm start' to start the application.
    `)
  } else {
    const file = '.env'

    // Update module specifiers in the .env file
    const lines = (await readFile(file, 'utf-8')).split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('VITE_COUNTER_MOD_SPEC'))
        lines[i] = `VITE_COUNTER_MOD_SPEC=${counterModSpec}`
    }
    await writeFile(file, lines.join('\n'), 'utf-8')
    console.log(' \x1b[2m- Successfully updated .env file\x1b[0m')
  }
}

rl.close()
