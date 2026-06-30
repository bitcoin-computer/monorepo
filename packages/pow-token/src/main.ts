import dotenv from 'dotenv'
dotenv.config()

import { Computer } from '@bitcoin-computer/lib'
import { Pow } from './pow.js'
import { PowTokenMiner } from './miner.js'
import { config } from './config.js' // NEW

const main = async () => {
  if (!process.env.MNEMONIC) {
    console.error('Error. Set MNEMONIC=your twelve words in .env')
    process.exit(1)
  }

  const computer = new Computer({
    chain: process.env.CHAIN || config.DEFAULT_CHAIN,
    network: process.env.NETWORK || config.DEFAULT_NETWORK,
    url: process.env.BCN_URL || config.DEFAULT_URL,
  })

  const mod = process.env.POW_MOD
  if (!mod) {
    console.error('Error. Set POW_MOD=... in .env (deploy once first – see instructions below)')
    process.exit(1)
  }

  const miner = new PowTokenMiner(computer, mod)

  setInterval(() => miner.refreshCache().catch(console.error), 5000)

  console.log('PoW Miner started on', process.env.NETWORK || config.DEFAULT_NETWORK)
  console.log('Press Ctrl+C to stop')

  while (true) {
    try {
      const prev = await miner.getBestTip()
      const diff = await miner.computeDifficulty()

      const { nonce, amount } = await miner.computePow(prev, diff)

      const currentPrev = await miner.getBestTip()
      if (currentPrev !== prev) {
        console.log('⚡ Stale work – another miner won, restarting...')
        continue
      }

      console.log('Broadcasting mint transaction...')
      const myToken = await computer.new(
        Pow,
        [computer.getPublicKey(), amount, nonce, prev, diff],
        mod,
      )

      console.log('MINT SUCCESS!', myToken._rev)
    } catch (err) {
      console.error('Error:', err.message || err)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
}

main().catch(console.error)
