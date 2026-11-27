/**
 * An ordinary transfer in the same host block must not affect which mint wins
 * the subsidy: claim() selects the smallest *creation* revision of the module
 * in the block, and a transfer is an update, not a creation.
 */
import { expect } from 'chai'
import { Computer, SmartContract } from '@bitcoin-computer/lib'
import { EscrowAuditor, TBC20, TBC777 } from '@bitcoin-computer/TBC777'
import dotenv from 'dotenv'
import path from 'path'
import { Commodity, config } from '../src/commodity.js'

for (const envPath of [
  path.resolve(process.cwd(), './packages/node/.env'),
  path.resolve(process.cwd(), '../../node/.env'),
  '../node/.env',
]) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL ?? config.DEFAULT_URL
const chain = process.env.BCN_CHAIN ?? config.DEFAULT_CHAIN
const network = process.env.BCN_NETWORK ?? config.DEFAULT_NETWORK
const MINE_SINK_ADDRESS = 'mrpdUjdfFZQWRYaqgqjgoXTJqn5rwahTHr'
const MAX_TRANSFERS = 20

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function mine(computer: Computer): Promise<void> {
  await computer.rpc('generateToAddress', `1 ${MINE_SINK_ADDRESS}`)
  await sleep(2000)
}

async function waitConfirmed(computer: Computer, rev: string): Promise<void> {
  for (let i = 0; i < 60; i++) {
    const rows = await computer.getTXOs({ rev, isConfirmed: true })
    if (rows.length > 0) return
    await sleep(500)
  }
  throw new Error(`${rev} not confirmed in index`)
}

describe('C7: same-block transfer vs. commodity block winner', function () {
  this.timeout(600_000)

  it('a genuine mint still claims when a lower-sorting transfer rev shares its block', async function () {
    // Fund everything up front: faucet() mines, which would split the target block.
    const computer = new Computer({ url, chain, network })
    const bob = new Computer({ url, chain, network })
    for (let i = 0; i < 4; i++) await computer.faucet(5e8)
    for (let i = 0; i < 2; i++) await bob.faucet(5e8)

    const mod = await computer.deploy(`
      export ${stripComments(TBC20.toString())}
      export ${stripComments(EscrowAuditor.toString())}
      export ${stripComments(TBC777.toString())}
      export ${stripComments(Commodity.toString())}
    `)
    await mine(computer)

    // An older object of the same module, confirmed in an earlier block.
    const other = (await computer.new(
      Commodity,
      [{ to: computer.getPublicKey(), salt: 'older', amount: 0n }],
      mod,
    )) as SmartContract<typeof Commodity>
    await mine(computer)
    await computer.waitForIndexed(other._rev)

    // Target block: the only creation is mint M. Then ordinary whole-balance
    // transfers of `other` until one of their revs sorts below M._id.
    const mint = (await computer.new(
      Commodity,
      [{ to: computer.getPublicKey(), salt: 'target', amount: 0n }],
      mod,
    )) as SmartContract<typeof Commodity>
    // A self-transfer changes no state and broadcasts nothing, so pass `other`
    // back and forth between two wallets.
    let lowest = ''
    let holder = other
    const owners = [computer, bob]
    for (let i = 0; i < MAX_TRANSFERS; i++) {
      const before = holder._rev
      await holder.transfer(owners[(i + 1) % 2].getPublicKey())
      expect(holder._rev).to.not.eq(before)
      if (holder._rev < mint._id) {
        lowest = holder._rev
        break
      }
      holder = await owners[(i + 1) % 2].sync<typeof Commodity>(holder._rev)
    }
    if (!lowest) this.skip() // M._id happened to sort very low; rerun

    await mine(computer)
    await waitConfirmed(computer, mint._id)
    await waitConfirmed(computer, lowest)

    const height = await computer.txIdToBlockHeight(mint._id.split(':')[0])
    expect(await computer.txIdToBlockHeight(lowest.split(':')[0])).to.eq(height)
    const revs = await computer.getOTXOs({ mod, blockHeight: height })
    console.log(
      `      block ${height}: ${revs.length} object revs; mint ${mint._id}; transfer ${lowest}`,
    )
    expect(revs).to.include(lowest) // the index ranks transfer revs alongside creations

    await mint.claim()
    expect(mint.amount).to.eq(Commodity.getSubsidy(height))

    // A fresh validator replays claim() when syncing the claimed revision.
    await mine(computer)
    await waitConfirmed(computer, mint._rev)
    const replayed = await new Computer({ url, chain, network }).sync<typeof Commodity>(mint._rev)
    expect(replayed.amount).to.eq(Commodity.getSubsidy(height))
  })
})
