/**
 * Tests for Commodity – Canonical Min-Revision Digital Commodity on Bitcoin Computer.
 *
 * Requires a live Bitcoin Computer node (LTC regtest by default).
 *
 * Funding / mining notes (regtest):
 * - `computer.faucet()` already matures coinbases (~100 blocks to a burn address).
 * - Never `generateToAddress` to a wallet we later spend from: immature coinbase
 *   outputs cause `bad-txns-premature-spend-of-coinbase`.
 * - Always mine confirmation blocks to a throwaway sink address.
 * - Re-faucet / mine between heavy sequences to avoid `too-long-mempool-chain`.
 *
 * @see ../src/commodity.ts
 * @see https://docs.bitcoincomputer.io
 */

import { expect } from 'chai'
import { Computer, SmartContract } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import path from 'path'
import { Commodity, config } from '../src/commodity.js'
import { Sha256 } from '../src/sha256.js'

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'),
  path.resolve(process.cwd(), '../../node/.env'),
  '../node/.env',
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL ?? config.DEFAULT_URL
const chain = process.env.BCN_CHAIN ?? config.DEFAULT_CHAIN
const network = process.env.BCN_NETWORK ?? config.DEFAULT_NETWORK

const COIN = 100_000_000n
const INDEX_WAIT_MS = 2000

/** Fixed LTC regtest burn address used only as a mining sink (never spent from). */
const MINE_SINK_ADDRESS = 'mrpdUjdfFZQWRYaqgqjgoXTJqn5rwahTHr'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip comments so the deployed module stays small. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ensureFunds(c: Computer, minSats = 2e8): Promise<void> {
  try {
    const { balance } = await c.getBalance()
    if (balance < minSats) await c.faucet(minSats)
  } catch {
    await c.faucet(minSats)
  }
}

/**
 * Fresh wallet with independent mature UTXOs.
 * Prefer fewer, larger faucets over many chained spends.
 */
async function fundedComputer(utxos = 2, sats = 5e8): Promise<Computer> {
  const computer = new Computer({ url, chain, network })
  for (let i = 0; i < utxos; i++) await computer.faucet(sats)
  return computer
}

/**
 * Mine `n` blocks to a throwaway address (never the spending wallet).
 * Returns the height of the last mined block.
 */
async function mineBlocks(computer: Computer, n = 1): Promise<number> {
  const hashes: string[] = await computer.rpc(
    'generateToAddress',
    `${n} ${MINE_SINK_ADDRESS}`,
  )
  await sleep(INDEX_WAIT_MS)
  const last = hashes[hashes.length - 1]
  const blockInfo = await computer.rpc('getBlock', `${last} 1`)
  return blockInfo.height as number
}

/**
 * Confirm pending mempool txs, wait until the mint is indexed, and poll until
 * getOTXOs({ mod, blockHeight }) can see it (claim() depends on that index).
 */
async function confirmMint(
  computer: Computer,
  mint: SmartContract<typeof Commodity>,
  modSpec?: string,
): Promise<number> {
  await mineBlocks(computer, 1)
  await computer.waitForIndexed(mint._id)

  const txId = mint._id.split(':')[0]
  const height = await computer.txIdToBlockHeight(txId)

  // Recover mod the same way claim() does when the caller did not pass it.
  let mod = modSpec
  if (!mod) {
    const decoded = await computer.decode(txId)
    mod = decoded.mod
  }
  if (mod) {
    await waitForMintInBlockIndex(computer, mod, mint._id, height)
  }
  return height
}

/** Poll until getOTXOs lists the mint at its creation height (claim precondition). */
async function waitForMintInBlockIndex(
  computer: Computer,
  mod: string,
  mintId: string,
  blockHeight: number,
  timeoutMs = 30_000,
): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    // Match claim(): all object TXOs in the block (spent or unspent).
    const revs = await computer.getOTXOs({ mod, blockHeight })
    if (revs.includes(mintId)) return
    await sleep(500)
  }
  throw new Error(
    `Timed out waiting for ${mintId} in getOTXOs({ mod, blockHeight: ${blockHeight} })`,
  )
}

/** Deploy a Commodity module (required for claim() – decode must recover mod). */
async function deployCommodity(computer: Computer): Promise<string> {
  await ensureFunds(computer, 3e8)
  return computer.deploy(`export ${stripComments(Commodity.toString())}`)
}

/**
 * Create a genuine mint (non-empty salt, amount 0n) from the given module.
 * Does not faucet (faucet mines blocks and would split same-block competitors).
 */
async function createMint(
  computer: Computer,
  modSpec: string,
  salt = `salt-${Math.random().toString(36).slice(2)}`,
): Promise<SmartContract<typeof Commodity>> {
  return computer.new(Commodity, [computer.getPublicKey(), salt, 0n], modSpec)
}

/**
 * Deploy a private module, mint, confirm, and claim.
 * Uses a fresh wallet by default so coinbase / mempool-chain state stays clean.
 */
async function mintClaimAndGet(opts?: {
  computer?: Computer
  salt?: string
}): Promise<{
  computer: Computer
  mod: string
  mint: SmartContract<typeof Commodity>
  height: number
  subsidy: bigint
}> {
  const computer = opts?.computer ?? (await fundedComputer())
  await ensureFunds(computer, 5e8)
  const modSpec = await deployCommodity(computer)
  // Mine after deploy so the next mint is not chained too deep on unconfirmed deploys.
  await mineBlocks(computer, 1)

  const mint = await createMint(computer, modSpec, opts?.salt)
  const height = await confirmMint(computer, mint, modSpec)
  await mint.claim()
  const subsidy = Commodity.getSubsidy(height)
  expect(mint.amount).to.eq(subsidy)
  // Confirm the claim so the next operation does not sit on a long mempool chain.
  await mineBlocks(computer, 1)
  return { computer, mod: modSpec, mint, height, subsidy }
}

/**
 * Sync a revision as `owner` so subsequent spends are signed with the correct key.
 * Required after a transfer: only the new owner can spend the child UTXO.
 */
async function asOwner(
  owner: Computer,
  rev: string,
): Promise<SmartContract<typeof Commodity>> {
  return owner.sync<typeof Commodity>(rev)
}

/**
 * Create two genuine mints that land in the same host block (no faucet/mine between).
 * Pre-funds enough independent UTXOs first.
 */
async function twoMintsSameBlock(
  saltA: string,
  saltB: string,
): Promise<{
  computer: Computer
  mod: string
  mintA: SmartContract<typeof Commodity>
  mintB: SmartContract<typeof Commodity>
  height: number
}> {
  // Several large UTXOs so deploy + two mints need no mid-stream faucet (which mines).
  const computer = await fundedComputer(4, 5e8)
  const modSpec = await deployCommodity(computer)
  await mineBlocks(computer, 1)

  const mintA = await createMint(computer, modSpec, saltA)
  const mintB = await createMint(computer, modSpec, saltB)

  await mineBlocks(computer, 1)
  await computer.waitForIndexed(mintA._id)
  await computer.waitForIndexed(mintB._id)

  const heightA = await computer.txIdToBlockHeight(mintA._id.split(':')[0])
  const heightB = await computer.txIdToBlockHeight(mintB._id.split(':')[0])
  if (heightA !== heightB) {
    throw new Error(
      `Expected same-block mints, got heights ${heightA} and ${heightB}. ` +
        'Something mined between the two createMint calls.',
    )
  }

  await waitForMintInBlockIndex(computer, modSpec, mintA._id, heightA)
  await waitForMintInBlockIndex(computer, modSpec, mintB._id, heightB)

  return { computer, mod: modSpec, mintA, mintB, height: heightA }
}

async function expectClaimFails(
  mint: SmartContract<typeof Commodity>,
  msg?: string | RegExp,
): Promise<void> {
  let thrown: unknown
  try {
    await mint.claim()
  } catch (err: unknown) {
    thrown = err
  }
  if (thrown === undefined) {
    expect.fail('claim() should have thrown')
  }
  const message = thrown instanceof Error ? thrown.message : String(thrown)
  if (msg !== undefined) {
    if (typeof msg === 'string') expect(message).to.include(msg)
    else expect(message).to.match(msg)
  }
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe('Commodity – Canonical Min-Revision Digital Commodity', function () {
  // Long timeout: regtest faucet + mine + index.
  this.timeout(180_000)

  let miner: Computer
  let alice: Computer
  let bob: Computer
  /** Shared module for non-claim / constructor-style tests only. */
  let mod: string

  before(async () => {
    miner = new Computer({ url, chain, network })
    alice = new Computer({ url, chain, network })
    bob = new Computer({ url, chain, network })

    await Promise.all([
      miner.faucet(config.FAUCET_AMOUNT),
      alice.faucet(config.FAUCET_AMOUNT),
      bob.faucet(config.FAUCET_AMOUNT),
    ])

    mod = await deployCommodity(miner)
    // Confirm deploy so later alice mints are not deep descendants of an unconfirmed deploy.
    await mineBlocks(miner, 1)
    await ensureFunds(alice, config.FAUCET_AMOUNT)
    await ensureFunds(bob, config.FAUCET_AMOUNT)
  })

  beforeEach(async () => {
    // Fresh mature UTXOs break long unconfirmed descendant chains.
    await Promise.all([alice.faucet(2e8), bob.faucet(2e8)])
  })

  // =========================================================================
  // 1. Constructor & minting paths
  // =========================================================================
  describe('Constructor and minting', () => {
    describe('Genuine mint path (salt non-empty, amount must be 0n)', () => {
      it('creates a mint root with amount 0n, non-empty salt, and _id === _rev === _root', async () => {
        const salt = 'salt-abc'
        const mint = await alice.new(Commodity, [alice.getPublicKey(), salt, 0n], mod)

        expect(mint.amount).to.eq(0n)
        expect(mint.salt).to.eq(salt)
        expect(mint._owners).deep.eq([alice.getPublicKey()])
        expect(mint._id).to.be.a('string')
        expect(mint._rev).to.eq(mint._id)
        expect(mint._root).to.eq(mint._id)
      })

      it('throws when a mined Commodity is constructed with amount !== 0n', () => {
        const pk = alice.getPublicKey()
        expect(() => new Commodity(pk, 'salt', 1n)).to.throw(
          'Mined Commodity must start with amount === 0n',
        )
      })

      it('stores the grinding salt for transparency (never cryptographically checked)', async () => {
        const salt = 'my-grind-salt'
        const mint = await alice.new(Commodity, [alice.getPublicKey(), salt, 0n], mod)
        expect(mint.salt).to.eq(salt)
      })
    })

    describe("Transfer / split construction path (salt === '')", () => {
      it('allows construction with empty salt and non-negative amount (used by transfer)', () => {
        const child = new Commodity(bob.getPublicKey(), '', 5n)
        expect(child.salt).to.eq('')
        expect(child.amount).to.eq(5n)
        expect(child._owners).deep.eq([bob.getPublicKey()])
      })

      it('throws if amount is negative', () => {
        expect(() => new Commodity(bob.getPublicKey(), '', -1n)).to.throw(
          'Amount cannot be negative',
        )
      })

      it('allows zero amount with empty salt', () => {
        const child = new Commodity(bob.getPublicKey(), '', 0n)
        expect(child.amount).to.eq(0n)
        expect(child.salt).to.eq('')
      })
    })
  })

  // =========================================================================
  // 2. Lineage authenticity (isGenuine + immutable _root)
  // =========================================================================
  describe('isGenuine() and lineage via immutable _root', () => {
    it('returns true for a genuine mint root (non-empty salt)', async () => {
      const mint = await createMint(alice, mod, 'genuine-salt')
      expect(await mint.isGenuine()).to.eq(true)
    })

    it('returns true for any transfer/split descendant that inherits the same _root', async () => {
      // Fresh wallet: avoid chaining claim/transfer on the shared alice UTXO set.
      const { mint } = await mintClaimAndGet()

      const half = mint.amount / 2n
      expect(half > 0n).to.eq(true)

      const child = (await mint.transfer(bob.getPublicKey(), half)) as SmartContract<
        typeof Commodity
      >
      expect(child).to.not.eq(undefined)
      expect(child!._root).to.eq(mint._root)
      expect(await child!.isGenuine()).to.eq(true)
    })

    it('returns true even for deep descendants (only the short root is ever synced)', async () => {
      const { mint, computer } = await mintClaimAndGet()

      const quarter = mint.amount / 4n
      expect(quarter > 0n).to.eq(true)

      const child = (await mint.transfer(bob.getPublicKey(), quarter)) as SmartContract<
        typeof Commodity
      >
      // Confirm transfer; only bob can spend the child (sync as owner).
      await mineBlocks(computer, 1)
      await ensureFunds(bob, 2e8)
      const childAsBob = await asOwner(bob, child!._rev)

      const grand = (await childAsBob.transfer(
        alice.getPublicKey(),
        quarter / 2n,
      )) as SmartContract<typeof Commodity>

      expect(grand!._root).to.eq(mint._root)
      expect(await grand!.isGenuine()).to.eq(true)
    })

    it('returns false when the root itself was created with empty salt (fake / non-mint lineage)', async () => {
      const fake = await alice.new(Commodity, [alice.getPublicKey(), '', 10n], mod)
      expect(fake.salt).to.eq('')
      expect(fake._id).to.eq(fake._root)
      expect(await fake.isGenuine()).to.eq(false)
    })
  })

  // =========================================================================
  // 3. transfer()
  // =========================================================================
  describe('transfer()', () => {
    describe('Whole-balance transfer (no amount argument)', () => {
      it('re-assigns _owners and leaves amount unchanged', async () => {
        const { mint } = await mintClaimAndGet()
        const amountBefore = mint.amount

        await mint.transfer(bob.getPublicKey())

        expect(mint.amount).to.eq(amountBefore)
        expect(mint._owners).deep.eq([bob.getPublicKey()])
      })

      it('advances _rev while keeping _id and _root immutable', async () => {
        const { mint } = await mintClaimAndGet()
        const { _id: oldId, _rev: oldRev, _root: oldRoot } = mint

        await mint.transfer(bob.getPublicKey())

        expect(mint._rev).to.not.eq(oldRev)
        expect(mint._id).to.eq(oldId)
        expect(mint._root).to.eq(oldRoot)
      })

      it('returns undefined (no new object is created)', async () => {
        const { mint } = await mintClaimAndGet()
        const ret = await mint.transfer(bob.getPublicKey())
        expect(ret).to.eq(undefined)
      })
    })

    describe('Partial transfer / split (amount argument)', () => {
      it('deducts amount from the parent and returns a new Commodity owned by the recipient', async () => {
        const { mint } = await mintClaimAndGet()
        const total = mint.amount
        const send = total / 3n

        const child = (await mint.transfer(bob.getPublicKey(), send)) as SmartContract<
          typeof Commodity
        >

        expect(mint.amount).to.eq(total - send)
        expect(child!.amount).to.eq(send)
        expect(child!._owners).deep.eq([bob.getPublicKey()])
        expect(child!._id).to.not.eq(mint._id)
      })

      it('the child inherits the exact same _root (lineage preserved)', async () => {
        const { mint } = await mintClaimAndGet()
        const child = (await mint.transfer(bob.getPublicKey(), 1n)) as SmartContract<
          typeof Commodity
        >
        expect(child!._root).to.eq(mint._root)
      })

      it("the child has salt === '' and is permanently ineligible for claim()", async () => {
        const { mint } = await mintClaimAndGet()
        const child = (await mint.transfer(bob.getPublicKey(), 1n)) as SmartContract<
          typeof Commodity
        >

        expect(child!.salt).to.eq('')
        expect(child!._rev).to.not.eq(child!._root)
        await expectClaimFails(child!, /claim\(\) can only be called on the mint creation revision/)
      })

      it('throws on insufficient funds', async () => {
        const { mint } = await mintClaimAndGet()
        try {
          await mint.transfer(bob.getPublicKey(), mint.amount + 1n)
          expect.fail('should have thrown on insufficient funds')
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          expect(message).to.include('Insufficient funds')
        }
      })

      it('after any mutation the original mint’s creation revision is spent (_rev !== _root)', async () => {
        const { mint } = await mintClaimAndGet()
        await mint.transfer(bob.getPublicKey(), 1n)
        expect(mint._rev).to.not.eq(mint._root)
        await expectClaimFails(mint, /claim\(\) can only be called on the mint creation revision/)
      })
    })
  })

  // =========================================================================
  // 4. burn() and merge()
  // =========================================================================
  describe('burn()', () => {
    it('sets amount to 0n after a successful claim', async () => {
      const { mint } = await mintClaimAndGet()
      expect(mint.amount > 0n).to.eq(true)

      await mint.burn()
      expect(mint.amount).to.eq(0n)
    })

    it('advances _rev when amount actually changes, rendering the object ineligible for claim()', async () => {
      // Note: burn() only mutates when amount !== 0n. On a fresh mint amount is
      // already 0n, so the framework treats burn as a no-op and does not spend
      // the creation UTXO. Claim first so burn has a real state change.
      const { mint } = await mintClaimAndGet()
      const revBefore = mint._rev
      await mint.burn()
      expect(mint.amount).to.eq(0n)
      expect(mint._rev).to.not.eq(revBefore)
      expect(mint._rev).to.not.eq(mint._root)
      await expectClaimFails(mint, /claim\(\) can only be called on the mint creation revision/)
    })
  })

  describe('merge()', () => {
    it('always throws "Merge disabled."', () => {
      const local = new Commodity(alice.getPublicKey(), 'salt', 0n)
      expect(() => local.merge()).to.throw('Merge disabled.')
    })
  })

  // =========================================================================
  // 5. Static subsidy schedule
  // =========================================================================
  describe('Commodity.getSubsidy(hostBlockHeight)', () => {
    it('returns 50 * COIN for heights in [0, 209_999]', () => {
      expect(Commodity.getSubsidy(0)).to.eq(50n * COIN)
      expect(Commodity.getSubsidy(1)).to.eq(50n * COIN)
      expect(Commodity.getSubsidy(209_999)).to.eq(50n * COIN)
    })

    it('halves every 210_000 host blocks (Bitcoin-style)', () => {
      expect(Commodity.getSubsidy(210_000)).to.eq(25n * COIN)
      expect(Commodity.getSubsidy(419_999)).to.eq(25n * COIN)
      expect(Commodity.getSubsidy(420_000)).to.eq(12n * COIN + 5n * (COIN / 10n)) // 12.5
      expect(Commodity.getSubsidy(630_000)).to.eq((50n * COIN) / 8n)
      expect(Commodity.getSubsidy(210_000 * 10)).to.eq((50n * COIN) / 1024n)
    })

    it('returns 0n after 64 halvings', () => {
      expect(Commodity.getSubsidy(210_000 * 64)).to.eq(0n)
      expect(Commodity.getSubsidy(210_000 * 100)).to.eq(0n)
    })

    it('returns 0n for negative heights', () => {
      expect(Commodity.getSubsidy(-1)).to.eq(0n)
      expect(Commodity.getSubsidy(-100)).to.eq(0n)
    })
  })

  // =========================================================================
  // 6. claim() – Tier 1: eligibility guards
  // =========================================================================
  describe('claim() – Tier 1: eligibility guards (no same-block control required)', () => {
    it('throws if called when _rev !== _root (not on the mint creation revision)', async () => {
      const mint = await createMint(alice, mod)
      await mint.transfer(bob.getPublicKey())
      await expectClaimFails(mint, /claim\(\) can only be called on the mint creation revision/)
    })

    it('throws after a successful claim (creation UTXO is spent, second call fails the _rev check)', async () => {
      const { mint } = await mintClaimAndGet()
      expect(mint.amount > 0n).to.eq(true)
      await expectClaimFails(mint, /claim\(\) can only be called on the mint creation revision/)
    })

    it('throws after burn() of a claimed mint', async () => {
      const { mint } = await mintClaimAndGet()
      await mint.burn()
      await expectClaimFails(mint, /claim\(\) can only be called on the mint creation revision/)
    })

    it('throws on a transfer/split child even if it happens to hold a small revision', async () => {
      const { mint } = await mintClaimAndGet()
      const child = (await mint.transfer(bob.getPublicKey(), 1n)) as SmartContract<typeof Commodity>
      await expectClaimFails(child!, /claim\(\) can only be called on the mint creation revision/)
    })

    it('throws if the lineage is not genuine (isGenuine() === false)', async () => {
      const local = await fundedComputer()
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)
      const fake = await local.new(Commodity, [local.getPublicKey(), '', 0n], localMod)
      await confirmMint(local, fake, localMod)

      await expectClaimFails(fake, /genuine mint lineage/)
    })

    it('throws when the creation transaction has no module (mod missing)', async () => {
      const solo = await fundedComputer()
      const bare = await solo.new(Commodity, [solo.getPublicKey(), 'no-mod-salt', 0n])
      // No module: only wait for confirmation, not getOTXOs(mod, height).
      await mineBlocks(solo, 1)
      await solo.waitForIndexed(bare._id)
      await expectClaimFails(bare, /Could not recover module from creation tx/)
    })
  })

  // =========================================================================
  // 7. claim() – Tier 2: canonical min-revision selection
  // =========================================================================
  describe('claim() – Tier 2: canonical selection (same-block control required)', () => {
    it('credits exactly Commodity.getSubsidy(blockHeight) when this mint holds the lex-smallest creation revision of the module in its host block', async () => {
      const local = await fundedComputer()
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)
      const mint = await createMint(local, localMod, 'solo-winner')

      const height = await confirmMint(local, mint, localMod)
      await mint.claim()

      expect(mint.amount).to.eq(Commodity.getSubsidy(height))
    })

    it('throws if this object’s creation revision is not the lexicographically smallest in its host block', async () => {
      // No faucet between mints: faucet mines a block and would split competitors.
      const { mintA, mintB } = await twoMintsSameBlock('competitor-a', 'competitor-b')

      const [winner, loser] = mintA._id < mintB._id ? [mintA, mintB] : [mintB, mintA]

      await winner.claim()
      expect(winner.amount > 0n).to.eq(true)

      await expectClaimFails(loser, /is not canonical for host block/)
    })

    it('includes transfer/split children tagged with the same mod when selecting the min revision', async () => {
      const local = await fundedComputer(4, 5e8)
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)

      const parent = await createMint(local, localMod, 'parent-for-split')
      const parentHeight = await confirmMint(local, parent, localMod)
      await parent.claim()
      expect(parent.amount).to.eq(Commodity.getSubsidy(parentHeight))
      await mineBlocks(local, 1)

      // Split + competitor without faucet between (keep them in the same block).
      const { tx: splitTx } = await local.encode({
        exp: `a.transfer('${local.getPublicKey()}', 1n)`,
        env: { a: parent._rev },
        mod: localMod,
      })
      await local.broadcast(splitTx!)
      const childRev = `${splitTx!.getId()}:0`
      const child = await local.sync<typeof Commodity>(childRev)

      const competitor = await createMint(local, localMod, 'competes-with-child')
      await mineBlocks(local, 1)
      await local.waitForIndexed(child._id)
      await local.waitForIndexed(competitor._id)

      const height = await local.txIdToBlockHeight(competitor._id.split(':')[0])
      await waitForMintInBlockIndex(local, localMod, competitor._id, height)

      expect(child.salt).to.eq('')
      expect(child._rev).to.not.eq(child._root)
      await expectClaimFails(child, /claim\(\) can only be called on the mint creation revision/)

      const candidates = await local.getOTXOs({ mod: localMod, blockHeight: height })
      expect(candidates.length).to.be.greaterThan(0)
      expect(candidates).to.include(competitor._id)

      const sorted = [...candidates].sort()
      const winnerRev = sorted[0]

      if (winnerRev === competitor._id) {
        await competitor.claim()
        expect(competitor.amount).to.eq(Commodity.getSubsidy(height))
      } else {
        await expectClaimFails(competitor, /is not canonical for host block/)
        expect(competitor.amount).to.eq(0n)
      }
    })

    it('is history-independent and deterministic: two Computer instances agree on claim outcome', async () => {
      const local = await fundedComputer()
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)
      const mint = await createMint(local, localMod, 'deterministic-salt')
      const height = await confirmMint(local, mint, localMod)

      await mint.claim()
      expect(mint.amount).to.eq(Commodity.getSubsidy(height))

      const other = new Computer({ url, chain, network })
      const synced = await other.sync<typeof Commodity>(mint._rev)
      expect(synced.amount).to.eq(mint.amount)
      expect(synced._root).to.eq(mint._root)
      expect(synced.salt).to.eq(mint.salt)
    })

    it('leaves salt and _root unchanged after a successful claim', async () => {
      const local = await fundedComputer()
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)
      const salt = 'unchanged-salt'
      const mint = await createMint(local, localMod, salt)
      const rootBefore = mint._root

      await confirmMint(local, mint, localMod)
      await mint.claim()

      expect(mint.salt).to.eq(salt)
      expect(mint._root).to.eq(rootBefore)
      expect(mint._id).to.eq(rootBefore)
      expect(mint._rev).to.not.eq(rootBefore)
    })
  })

  // =========================================================================
  // 8. End-to-end mining / claiming workflow
  // =========================================================================
  describe('Mining / claiming workflow (end-to-end happy path)', () => {
    it('full happy path: grind-ish salt → mint → confirm → claim → transferable', async () => {
      const local = await fundedComputer()
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)

      const salt = `grind-${Date.now()}`
      const mint = await local.new(Commodity, [local.getPublicKey(), salt, 0n], localMod)
      expect(mint.amount).to.eq(0n)
      expect(mint._rev).to.eq(mint._root)

      const height = await confirmMint(local, mint, localMod)
      await mint.claim()

      const subsidy = Commodity.getSubsidy(height)
      expect(mint.amount).to.eq(subsidy)
      expect(await mint.isGenuine()).to.eq(true)

      await mineBlocks(local, 1)
      const recipient = new Computer({ url, chain, network })
      const child = (await mint.transfer(recipient.getPublicKey(), subsidy / 2n)) as SmartContract<
        typeof Commodity
      >
      expect(child!.amount).to.eq(subsidy / 2n)
      expect(mint.amount).to.eq(subsidy - subsidy / 2n)
      expect(await child!.isGenuine()).to.eq(true)
    })

    it('multiple genuine mints in different host blocks can each claim their own subsidy independently', async () => {
      const local = await fundedComputer(4, 5e8)
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)

      const mintA = await createMint(local, localMod, 'block-a')
      const heightA = await confirmMint(local, mintA, localMod)
      await mintA.claim()
      expect(mintA.amount).to.eq(Commodity.getSubsidy(heightA))
      // Confirm claim before minting the next one so they cannot share a block.
      await mineBlocks(local, 1)

      const mintB = await createMint(local, localMod, 'block-b')
      const heightB = await confirmMint(local, mintB, localMod)
      await mintB.claim()
      expect(mintB.amount).to.eq(Commodity.getSubsidy(heightB))

      expect(heightB).to.be.greaterThan(heightA)
      expect(mintA._root).to.not.eq(mintB._root)
    })
  })

  // =========================================================================
  // 9. Post-claim lifecycle
  // =========================================================================
  describe('Post-claim lifecycle', () => {
    it('a successfully claimed mint can still be transferred, split, or burned normally', async () => {
      const { mint, computer } = await mintClaimAndGet()

      const total = mint.amount
      const child = (await mint.transfer(bob.getPublicKey(), 1n)) as SmartContract<typeof Commodity>
      expect(child!.amount).to.eq(1n)
      expect(mint.amount).to.eq(total - 1n)
      expect(await child!.isGenuine()).to.eq(true)

      await mineBlocks(computer, 1)
      await mint.burn()
      expect(mint.amount).to.eq(0n)
    })

    it('after claim the object can be synced by any computer and shows the credited amount', async () => {
      const local = await fundedComputer()
      const localMod = await deployCommodity(local)
      await mineBlocks(local, 1)
      const mint = await createMint(local, localMod)
      const height = await confirmMint(local, mint, localMod)
      await mint.claim()

      const synced = await bob.sync<typeof Commodity>(mint._rev)
      expect(synced.amount).to.eq(Commodity.getSubsidy(height))
      expect(synced._owners).deep.eq([local.getPublicKey()])
    })
  })

  // =========================================================================
  // 10. Config & defaults
  // =========================================================================
  describe('config', () => {
    it('exposes sensible defaults (DEFAULT_CHAIN, DEFAULT_NETWORK, DEFAULT_URL, FAUCET_AMOUNT)', () => {
      expect(config.DEFAULT_CHAIN).to.eq('LTC')
      expect(config.DEFAULT_NETWORK).to.eq('regtest')
      expect(config.DEFAULT_URL).to.be.a('string')
      expect(config.DEFAULT_URL.length).to.be.greaterThan(0)
      expect(config.FAUCET_AMOUNT).to.be.a('number')
      expect(config.FAUCET_AMOUNT).to.be.greaterThan(0)
    })
  })

  // =========================================================================
  // 11. Additional invariants
  // =========================================================================
  describe('Invariants', () => {
    it('amount is always a non-negative bigint after mint, claim, transfer, and burn', async () => {
      const { mint, computer } = await mintClaimAndGet()
      expect(mint.amount >= 0n).to.eq(true)

      const child = (await mint.transfer(bob.getPublicKey(), 1n)) as SmartContract<typeof Commodity>
      expect(mint.amount >= 0n).to.eq(true)
      expect(child!.amount >= 0n).to.eq(true)

      await mineBlocks(computer, 1)
      await mint.burn()
      expect(mint.amount).to.eq(0n)
    })

    it('a mint that is not the min in its block can never claim, even after the winner has claimed', async () => {
      const { mintA: a, mintB: b } = await twoMintsSameBlock('late-a', 'late-b')

      const [winner, loser] = a._id < b._id ? [a, b] : [b, a]
      await winner.claim()

      expect(loser._rev).to.eq(loser._root)
      await expectClaimFails(loser, /is not canonical for host block/)
    })

    it('transfer children remain fully functional tokens of the same lineage even though they can never claim', async () => {
      const { mint, computer } = await mintClaimAndGet()

      const child = (await mint.transfer(bob.getPublicKey(), 2n)) as SmartContract<typeof Commodity>
      expect(await child!.isGenuine()).to.eq(true)

      // Only bob can spend the child UTXO.
      await mineBlocks(computer, 1)
      await ensureFunds(bob, 2e8)
      const childAsBob = await asOwner(bob, child!._rev)
      const grandchild = (await childAsBob.transfer(
        alice.getPublicKey(),
        1n,
      )) as SmartContract<typeof Commodity>
      expect(grandchild!.amount).to.eq(1n)
      expect(grandchild!._root).to.eq(mint._root)

      await mineBlocks(computer, 1)
      // Re-sync latest child rev as bob before burn (transfer advanced it).
      const childLatest = await asOwner(bob, await bob.latest(child!._id))
      await childLatest.burn()
      expect(childLatest.amount).to.eq(0n)

      await expectClaimFails(
        childLatest,
        /claim\(\) can only be called on the mint creation revision/,
      )
      await expectClaimFails(
        grandchild!,
        /claim\(\) can only be called on the mint creation revision/,
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Sha256 (off-chain grinding helper)
// ---------------------------------------------------------------------------
describe('Sha256', () => {
  it('matches the empty-string SHA-256 digest', () => {
    expect(Sha256.hash('')).to.eq(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })

  it('matches the well-known "abc" SHA-256 digest', () => {
    expect(Sha256.hash('abc')).to.eq(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('is deterministic for arbitrary salt-like strings', () => {
    const salt = 'grind-salt-42'
    expect(Sha256.hash(salt)).to.eq(Sha256.hash(salt))
    expect(Sha256.hash(salt)).to.have.length(64)
  })
})
