import { Computer, SmartContract } from '@bitcoin-computer/lib'
import { TBC20, TBC777M } from '@bitcoin-computer/TBC777'
import { ChessContract, ChessContractHelper } from '../src/chess-contract.js'
import { ChessChallengeTxWrapper } from '../src/chess-challenge.js'
import { User } from '../src/user.js'
import { expect } from 'expect'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { deploy as deployChessModule } from '../scripts/lib.js'

// `scripts/lib.ts` reads `${path}/src/chess.js`; `tsc` emits that file under `build/src/`. Deploy uses
// the same base (`build/scripts` → `..` = `build/`). From compiled `build/test/*.js`, one `..` is `build/`.
const chessDeployRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'),
  path.resolve(process.cwd(), '../../node/.env'),
  '../node/.env',
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

const url = process.env.BCN_URL ?? 'http://localhost:1031'
const chain = process.env.BCN_CHAIN ?? 'LTC'
const network = process.env.BCN_NETWORK ?? 'regtest'

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

async function ensureFunds(c: Computer, minSats = 10e8) {
  try {
    const { balance } = await c.getBalance()
    if (balance < minSats) await c.faucet(minSats)
  } catch {
    await c.faucet(minSats)
  }
}

describe('ChessContract', () => {
  describe('ChessContractHelper', () => {
    it('Should instantiate with required options', () => {
      const computer = new Computer({ url })
      const helper = new ChessContractHelper({
        computer,
        mod: 'test-mod',
        userMod: 'test-user-mod',
        tokenMod: 'test-token-mod',
      })
      expect(helper.computer).toBe(computer)
      expect(helper.mod).toBe('test-mod')
      expect(helper.userMod).toBe('test-user-mod')
      expect(helper.tokenMod).toBe('test-token-mod')
    })

    it('Should create via fromModSpecs static method', () => {
      const computer = new Computer({ url })
      const helper = ChessContractHelper.fromModSpecs(computer, 'mod', 'userMod', 'tokenMod')
      expect(helper).toBeInstanceOf(ChessContractHelper)
      expect(helper.mod).toBe('mod')
      expect(helper.tokenMod).toBe('tokenMod')
    })
  })

  describe('ChessChallengeTxWrapper', () => {
    it('Should have the correct fields', () => {
      const wrapper = new ChessChallengeTxWrapper('rev123', 5n, 'root456', 'pubKeyW', 'pubKeyB')
      expect(wrapper.chessRev).toBe('rev123')
      expect(wrapper.wagerAmount).toBe(5n)
      expect(wrapper.tokenRoot).toBe('root456')
      expect(wrapper.publicKeyW).toBe('pubKeyW')
      expect(wrapper.accepted).toBe(false)
    })
  })

  describe('User', () => {
    it('Should create a user with name and empty games', () => {
      const user = new User('Alice')
      expect(user.name).toBe('Alice')
      expect(user.games).toEqual([])
    })

    it('Should add games', () => {
      const user = new User('Bob')
      user.addGame('game1')
      user.addGame('game2')
      expect(user.games).toEqual(['game1', 'game2'])
    })
  })

  /**
   * Same pattern as packages/TBC777/test/tbc777m.test.ts: deploy each mod once, reuse
   * the returned spec strings for all tests (new wallets + faucet per test is fine).
   */
  describe('Chain integration (local BCN)', () => {
    let tbc20Mod: string
    let chessMod: string

    before(async () => {
      const deployer = new Computer({ url, chain, network })
      await deployer.faucet(20e8)
      tbc20Mod = await deployer.deploy(`export ${TBC20}`)
      await deployer.faucet(20e8)
      chessMod = await deployChessModule(deployer, chessDeployRoot)
    })

    describe('On-chain escrow flow', () => {
      const computer = new Computer({ url, chain, network })

      before(async () => {
        await computer.faucet(10e8)
      })

      it('Should create a ChessContract with correct initial state', async () => {
        const chess = await computer.new(ChessContract, ['root123', 5n], chessMod)
        expect(chess.root).toBe('root123')
        expect(chess.wagerAmount).toBe(5n)
        expect(chess.nameW).toBe('')
        expect(chess.nameB).toBe('')
        expect(chess.publicKeyW).toBe('')
        expect(chess.publicKeyB).toBe('')
        expect(chess.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        expect(chess.sans).toEqual([])
        expect(chess.deposits).toEqual([])
        expect(chess.withdraws).toEqual([])
        expect(chess.finalWithdraws).toEqual([])
        expect(chess.tokenIdW).toBe('')
        expect(chess.tokenIdB).toBe('')
      })

      it('Should reject moves when game is not fully funded', async () => {
        const chess = await computer.new(ChessContract, ['root123', 5n], chessMod)
        await expect(async () => {
          const { tx } = await computer.encodeCall({
            target: chess,
            property: 'move',
            args: ['e2', 'e4', 'q'],
            mod: chessMod,
          })
          await computer.broadcast(tx)
        }).rejects.toThrow('Game not yet fully funded')
      })
    })

    describe('E2E TBC777M escrow + ChessContract', () => {
      let minter: Computer
      let white: Computer
      let black: Computer

      beforeEach(async () => {
        minter = new Computer({ url, chain, network })
        white = new Computer({ url, chain, network })
        black = new Computer({ url, chain, network })
        await Promise.all([white.faucet(10e8), black.faucet(10e8), minter.faucet(10e8)])
        await ensureFunds(minter)
      })

      it('Should reject acceptDeposit when amount does not match wager', async () => {
        const wager = 5n
        const to = minter.getPublicKey()
        const token = await minter.new(TBC777M, [{ to, amount: 20n, name: 't' }], tbc20Mod)
        const whiteTokenM = await token.transfer(white.getPublicKey(), 10n)
        if (!whiteTokenM) throw new Error('expected white token UTXO')
        const chess = await white.new(ChessContract, [token._root, wager], chessMod)
        const whiteToken = await white.sync<typeof TBC777M>(whiteTokenM._rev)

        await expect(async () => {
          const { tx } = await white.encode({
            exp: `chess.acceptDeposit(whiteToken, 3n, 'W', '${black.getPublicKey()}')`,
            env: { chess: chess._rev, whiteToken: whiteToken._rev },
            mod: chessMod,
          })
          await white.broadcast(tx)
        }).rejects.toThrow()
      })

      it('Should run escrow, fool mate, and credit winner balance on withdraw', async () => {
        const wager = 5n
        const mintAmount = 30n
        const name = 'chess-e2e'
        const to = minter.getPublicKey()

        const token = await minter.new(TBC777M, [{ to, amount: mintAmount, name }], tbc20Mod)
        const whiteTokenM = await token.transfer(white.getPublicKey(), 10n)
        const blackTokenM = await token.transfer(black.getPublicKey(), 10n)
        if (!whiteTokenM || !blackTokenM) throw new Error('expected player token UTXOs')

        const chess = await white.new(ChessContract, [token._root, wager], chessMod)
        const whiteToken = await white.sync<typeof TBC777M>(whiteTokenM._rev)

        expect(whiteToken.amount).toBe(10n)
        await chess.acceptDeposit(whiteToken, wager, 'White', black.getPublicKey())
        expect(chess._owners).toEqual([black.getPublicKey()])

        const whiteAfterFirstDeposit = await white.sync<typeof TBC777M>(
          await white.latest(whiteTokenM._rev),
        )
        expect(whiteAfterFirstDeposit.amount).toBe(5n)

        const blackToken = await black.sync<typeof TBC777M>(blackTokenM._rev)
        // After white’s deposit, chess advanced — use the current head rev (not stale `chess._rev`).
        const chessHeadForBlack = await white.latest(chess._rev)
        const { tx: tx1, effect: effect1 } = await black.encode({
          exp: `chess.acceptDeposit(blackToken, ${wager}n, 'Black', '${white.getPublicKey()}')`,
          env: { chess: chessHeadForBlack, blackToken: blackToken._rev },
          mod: chessMod,
        })
        await black.broadcast(tx1)
        const chess1 = effect1.env.chess as SmartContract<typeof ChessContract>

        expect(chess1.deposits).toEqual([
          [token._root, whiteTokenM._rev],
          [token._root, blackTokenM._rev],
        ])
        expect(chess1.withdraws).toEqual([])

        // Fool’s mate (black wins): 1.f3 e5 2.g4 Qh4#
        const moves: { from: string; to: string; promotion: string; player: Computer }[] = [
          { from: 'f2', to: 'f3', promotion: '', player: white },
          { from: 'e7', to: 'e5', promotion: '', player: black },
          { from: 'g2', to: 'g4', promotion: '', player: white },
          { from: 'd8', to: 'h4', promotion: '', player: black },
        ]

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let currentChess: any = chess1
        for (const m of moves) {
          const latest = await m.player.latest(currentChess._id)
          const synced = await m.player.sync<typeof ChessContract>(latest)
          const { tx, effect } = await m.player.encodeCall({
            target: synced,
            property: 'move',
            args: [m.from, m.to, m.promotion],
            mod: chessMod,
          })
          await m.player.broadcast(tx)
          currentChess = (effect as unknown as { env: { __bc__: unknown } }).env.__bc__
          await sleep(300)
        }

        const chessFinal = currentChess as SmartContract<typeof ChessContract>
        const totalPot = wager * 2n
        expect(chessFinal.withdraws).toEqual([[token._root, blackToken._id, totalPot]])
        expect(chessFinal.finalWithdraws).toEqual([])

        const blackTokenBeforeWithdraw = await black.sync<typeof TBC777M>(
          await black.latest(blackTokenM._rev),
        )
        expect(blackTokenBeforeWithdraw.amount).toBe(5n)

        // TBC777M.isValid walks `computer.prev` / `next`; poll withdraw until the indexer catches up.
        let lastWithdrawErr: unknown
        let withdrew = false
        for (let attempt = 0; attempt < 10; attempt += 1) {
          try {
            const rev = await white.latest(chessFinal._id)
            const tok = await black.sync<typeof TBC777M>(await black.latest(blackTokenM._rev))
            await tok.withdraw(rev)
            withdrew = true
            break
          } catch (e) {
            lastWithdrawErr = e
            const msg = e instanceof Error ? e.message : String(e)
            if (!msg.includes('Escrow balance too low')) throw e
            await sleep(2500)
          }
        }
        if (!withdrew) throw lastWithdrawErr

        const blackTokenFinal = await black.sync<typeof TBC777M>(
          await black.latest(blackTokenM._rev),
        )
        expect(blackTokenFinal.amount).toBe(15n)
      })
    })
  })
})
