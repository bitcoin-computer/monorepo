import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer, SmartContract } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Swappable } from '../src/swappable.js'
import path from 'path'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // workspace root
  '../node/.env', // when running from local
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL
const chain = process.env.BCN_CHAIN
const network = process.env.BCN_NETWORK

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const meta = {
  _id: _.isString,
  _rev: _.isString,
  _root: _.isString,
  _owners: _.isArray,
  _satoshis: (x) => typeof x === 'bigint',
}

describe('Swapppable', () => {
  let a: SmartContract<typeof Swappable>
  let b: SmartContract<typeof Swappable>
  const alice = new Computer({ url, chain, network })
  const bob = new Computer({ url, chain, network })

  before('Before', async () => {
    await alice.faucet(1e8)
    await bob.faucet(1e8)
  })

  describe('Creating two NFTs to be swapped', () => {
    it('Alice creates a', async () => {
      a = await alice.new(Swappable, ['A', 'AAA'])
      expect(a).to.matchPattern({
        ...meta,
        name: 'A',
        symbol: 'AAA',
        _owners: [alice.getPublicKey()],
      })
    })

    it('Bob creates b', async () => {
      b = await bob.new(Swappable, ['B', 'BBB'])
      expect(b).to.matchPattern({
        ...meta,
        name: 'B',
        symbol: 'BBB',
        _owners: [bob.getPublicKey()],
      })
    })
  })

  describe('Executing a swap', async () => {
    let tx: any
    let txId: string

    it('Executes the swap', async () => {
      // Alice builds, funds, and signs a swap transaction
      ;({ tx } = await alice.encode({
        exp: `a.swap(b)`,
        env: { a: a._rev, b: b._rev },
      }))

      // Bob signs the swap transaction
      await bob.sign(tx)

      // Bob broadcasts the swap transaction
      txId = await bob.broadcast(tx)
      expect(txId).not.undefined

      // a is now owned by Bob
      const { env } = await bob.sync(txId)
      const aSwapped = env.a
      expect(aSwapped).to.matchPattern({
        ...meta,
        name: 'A',
        symbol: 'AAA',
        _owners: [bob.getPublicKey()],
      })

      // b is now owned by Alice
      const { env: env2 } = await alice.sync(txId)
      const bSwapped = env2.b
      expect(bSwapped).to.matchPattern({
        ...meta,
        name: 'B',
        symbol: 'BBB',
        _owners: [alice.getPublicKey()],
      })
    })
  })
})
