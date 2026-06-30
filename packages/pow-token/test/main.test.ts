/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai'
import * as crypto from 'crypto'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Pow, Sha256 } from '../src/pow.js'
import path from 'path'
import { PowTokenMiner } from '../src/miner.js'

// To connect to a local Bitcoin Computer Node,
// ensure the monorepo/packages/node/.env file exists and
// contains the following line with the correct value:
// BCN_URL=http://localhost:1031

const envPaths = [path.resolve(process.cwd(), '../node/.env')]

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.URL
const chain = process.env.CHAIN
const network = process.env.NETWORK

const { expect } = chai
chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()
let computer

before(async function () {
  computer = new Computer({
    url,
    chain,
    network,
  })
  await computer.faucet(10e8)
})

describe('Sha256 (pure JS implementation matching OpenSSL sha256.c)', () => {
  it('should match official SHA-256 test vectors (from NIST / OpenSSL test suite)', () => {
    // Empty string (NIST FIPS 180-2)
    expect(Sha256.hash('')).to.equal(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )

    // "abc" (NIST FIPS 180-2)
    expect(Sha256.hash('abc')).to.equal(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )

    // "hello" (standard example used in many OpenSSL tests)
    expect(Sha256.hash('hello')).to.equal(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    )

    // Longer message (NIST / OpenSSL "quick brown fox")
    expect(Sha256.hash('The quick brown fox jumps over the lazy dog')).to.equal(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    )
  })

  it('should be bit-identical to Node.js crypto.createHash("sha256") for any input', () => {
    const testInputs = [
      '',
      'abc',
      'bitcoin-computer-pow-token',
      'The quick brown fox jumps over the lazy dog',
      'a'.repeat(1000), // multi-block test
      '\x00\x01\x02\x03', // binary data
    ]

    for (const input of testInputs) {
      const nodeHash = crypto.createHash('sha256').update(input).digest('hex')
      expect(Sha256.hash(input)).to.equal(nodeHash)
    }
  })

  it('should produce deterministic output (same input = same output)', () => {
    const h1 = Sha256.hash('test')
    const h2 = Sha256.hash('test')
    expect(h1).to.equal(h2)
  })
})

describe('Pow', () => {
  let computer: Computer
  let mod: string

  before(async () => {
    computer = new Computer({
      url: 'http://localhost:1031',
      chain: 'LTC',
      network: 'regtest',
    })

    await computer.faucet(1e8)
    await sleep(1000)
    mod = await computer.deploy(`export ${Pow}; export ${Sha256};`)
  })

  const mint = async (prev: string, diff = 16, mod: string) => {
    let nonce = 0
    while (true) {
      const puzzle = prev + nonce.toString() + diff.toString()
      const hashHex = crypto.createHash('sha256').update(puzzle).digest('hex')
      if (hashHex.startsWith('0'.repeat(Math.floor(diff / 4)))) break
      nonce++
    }
    return computer.new(Pow, [computer.getPublicKey(), 1n, nonce.toString(), prev, diff], mod)
  }

  it('should create a smart object', async () => {
    const token = await computer.new(Pow, [computer.getPublicKey(), 10000n, '11348', '', 16], mod)
    expect(token).to.matchPattern({
      amount: 10000n,
      name: 'TBC-alpha',
      nonce: '11348',
      prevMintedId: '',
      difficulty: 16,
      _id: _.isString,
      _rev: _.isString,
      _root: _.isString,
      _satoshis: (x: unknown) => typeof x === 'bigint',
      _owners: _.isArray,
    })
  })

  it('should mint the genesis token (prevMintedId = "", difficulty = 16)', async () => {
    const difficulty = 16
    const prevMintedId = ''

    // Find a valid nonce exactly like the miner does (using native crypto for speed)
    let nonce = 0
    while (true) {
      const puzzle = prevMintedId + nonce.toString() + difficulty.toString()
      const hashHex = crypto.createHash('sha256').update(puzzle).digest('hex')
      if (hashHex.startsWith('0'.repeat(Math.floor(difficulty / 4)))) {
        break
      }
      nonce++
    }
    const myToken = await computer.new(
      Pow,
      [computer.getPublicKey(), 1n, nonce.toString(), prevMintedId, difficulty],
      mod,
    )

    expect(myToken).to.matchPattern({
      amount: 1n,
      name: 'TBC-alpha',
      nonce: _.isString,
      prevMintedId: '',
      difficulty: 16,
      _id: _.isString,
      _rev: _.isString,
      _root: _.isString,
      _satoshis: (x) => typeof x === 'bigint',
      _owners: _.isArray,
    })

    expect(await myToken.isValid()).to.be.true
  })

  it('should reject invalid proof-of-work (wrong nonce)', async () => {
    try {
      await computer.new(
        Pow,
        [computer.getPublicKey(), 1n, 'this-is-not-a-valid-nonce', '', 16],
        mod,
      )
      expect(true).to.eq(false)
    } catch (error) {
      if (error instanceof Error) expect(error.message).to.eq('Invalid proof of work')
    }
  })

  it('should create a dummy object during transfer (nonce = "")', async () => {
    // First mint a token (reuse the same logic as above for simplicity)
    const difficulty = 16
    const prevMintedId = ''
    let nonce = 0
    while (true) {
      const puzzle = prevMintedId + nonce.toString() + difficulty.toString()
      const hashHex = crypto.createHash('sha256').update(puzzle).digest('hex')
      if (hashHex.startsWith('0'.repeat(Math.floor(difficulty / 4)))) break
      nonce++
    }

    const token = await computer.new(
      Pow,
      [computer.getPublicKey(), 1n, nonce.toString(), prevMintedId, difficulty],
      mod,
    )

    // Now transfer entire amount → should create a dummy object with nonce = ''
    const transferred = await token.transfer(computer.getPublicKey()) // full transfer
    expect(transferred).to.be.undefined // full transfer returns undefined

    // Partial transfer creates a new object with dummy nonce
    const split = (await token.transfer(computer.getPublicKey(), 1n)) as Pow | undefined
    expect(split?.nonce).to.equal('')
    expect(await split?.isValid()).to.be.true // dummy objects always pass
  })

  it('should allow merge of tokens', async () => {
    // mint two tokens (simplified – reuse same nonce logic)
    const makeToken = async () => {
      const d = 16
      const p = ''
      let n = 0
      while (true) {
        const puzzle = p + n.toString() + d.toString()
        if (crypto.createHash('sha256').update(puzzle).digest('hex').startsWith('0000')) break
        n++
      }
      return computer.new(Pow, [computer.getPublicKey(), 1n, n.toString(), p, d], mod)
    }

    const t1 = await makeToken()
    const t2 = await makeToken()

    await t1.merge([t2])
    expect(t1.amount).to.equal(2n)
  })

  it('should select the correct tip after multiple mints (longest-chain rule)', async () => {
    // Deploy a fresh module
    await computer.faucet(1e8)
    const freshMod = await computer.deploy(`export ${Pow}; export ${Sha256};`)

    // mint 5 tokens in a single chain
    const make = async (prev: string) => {
      const d = 16
      let n = 0
      while (true) {
        const puzzle = prev + n.toString() + d.toString()
        if (crypto.createHash('sha256').update(puzzle).digest('hex').startsWith('0000')) break
        n++
      }
      return computer.new(Pow, [computer.getPublicKey(), 1n, n.toString(), prev, d], freshMod)
    }

    const t1 = await make('')
    const t2 = await make(t1._rev)
    await computer.faucet(1e8)
    const t3 = await make(t2._rev)
    const t4 = await make(t3._rev)
    await computer.faucet(1e8)
    const t5 = await make(t4._rev)

    await sleep(500)
    const miner = new PowTokenMiner(computer, freshMod)
    const tip = await miner.getBestTip()

    expect(tip).to.equal(t5._rev) // must be the last one
  })

  // TODO: enable this test after generalization of difficulty adjustment logic (currently hardcoded to 2016 mints per adjustment)
  it.skip('should increase difficulty after 2016 mints', async () => {
    // This test is a bit slow on regtest, so we fake the length by minting only 2017 tokens
    // (in real life you would run a loop of 2017, but for CI we can use a smaller interval temporarily)
    // For test we can temporarily monkey-patch, but simpler: just mint enough to cross one interval

    const miner = new PowTokenMiner(computer, mod)
    const d1 = await miner.computeDifficulty()
    expect(d1).to.equal(16) // before any real mints

    // Mint 2017 tokens (fast on regtest because difficulty stays 16)
    for (let i = 0; i < 2017; i++) {
      const prev = await miner.getBestTip()
      let nonce = 0
      while (true) {
        const puzzle = prev + nonce.toString() + '16'
        if (crypto.createHash('sha256').update(puzzle).digest('hex').startsWith('0000')) break
        nonce++
      }
      await computer.new(Pow, [computer.getPublicKey(), 1n, nonce.toString(), prev, 16], mod)
      if (i % 25 === 0) {
        console.log(`Minted ${i} tokens...`)
        await computer.faucet(10e8)
      }
    }

    const d2 = await miner.computeDifficulty()
    expect(d2).to.be.greaterThan(16) // should have increased at least once
  })

  it('should reject a fork that is shorter than the main chain', async () => {
    // Fresh module for this test only → no pollution from other tests
    const freshMod = await computer.deploy(`export ${Pow}; export ${Sha256};`)

    const miner = new PowTokenMiner(computer, freshMod)

    // Simulate main chain: genesis → t1 → t2 → t3 → t4 (length 5)
    const genesis = await mint('', 16, freshMod)
    const t1 = await mint(genesis._rev, 16, freshMod)
    await computer.faucet(1e8)
    const t2 = await mint(t1._rev, 16, freshMod)
    const t3 = await mint(t2._rev, 16, freshMod)
    await computer.faucet(1e8)
    const t4 = await mint(t3._rev, 16, freshMod)
    const t5 = await mint(t4._rev, 16, freshMod) // Extra to make main longer than fork
    await computer.faucet(1e8)

    // Force a short fork from t2 (fork: t2 → f1 → f2)
    const f1 = await mint(t2._rev, 16, freshMod)
    const f2 = await mint(f1._rev, 16, freshMod)

    await sleep(500)
    // Check the tip – should be main chain t4 (longer work)
    const tip = await miner.getBestTip()
    expect(tip).to.equal(t5._rev)
    expect(tip).to.not.equal(f2._rev) // rejects shorter fork
  })

  it('isValid() must still return true after transfer and merge', async () => {
    const token = await computer.new(Pow, [computer.getPublicKey(), 5n, '11348', '', 16], mod)

    // partial transfer
    const split = await token.transfer(computer.getPublicKey(), 2n)
    expect(await split!.isValid()).to.be.true

    // full transfer
    await token.transfer(computer.getPublicKey())

    // merge back
    await split!.merge([token]) // merge the remaining 3n
    expect(await split!.isValid()).to.be.true
    expect(split!.amount).to.equal(5n)
  })

  it('should allow mint with difficulty 0 (genesis or test)', async () => {
    const freshMod = await computer.deploy(`export ${Pow}; export ${Sha256};`)
    const token = await computer.new(
      Pow,
      [computer.getPublicKey(), 1n, 'any-nonce', '', 0],
      freshMod,
    )
    expect(await token.isValid()).to.be.true
  })

  it('should return "" for tip on empty chain', async () => {
    const freshMod = await computer.deploy(`export ${Pow}; export ${Sha256};`)
    const miner = new PowTokenMiner(computer, freshMod)
    expect(await miner.getBestTip()).to.equal('')
  })

  it('should prefer heavier fork (higher difficulty)', async () => {
    const freshMod = await computer.deploy(`export ${Pow}; export ${Sha256};`)

    const genesis = await mint('', 16, freshMod)
    const light1 = await mint(genesis._rev, 16, freshMod)
    await mint(light1._rev, 16, freshMod) // Light: len 3, work ~3*2^16

    const heavy1 = await mint(genesis._rev, 20, freshMod) // Heavy: len 2, but work ~2^20 > light

    const miner = new PowTokenMiner(computer, freshMod)
    const tip = await miner.getBestTip()
    expect(tip).to.equal(heavy1._rev)
  })

  it('should update cache with new tip after refresh', async () => {
    const freshMod = await computer.deploy(`export ${Pow}; export ${Sha256};`)
    const miner = new PowTokenMiner(computer, freshMod)

    expect(miner['cachedPrev']).to.equal('')

    const genesis = await mint('', 16, freshMod) // Assume mint from above

    await miner.refreshCache()
    expect(miner['cachedPrev']).to.equal(genesis._rev)
  })
})
