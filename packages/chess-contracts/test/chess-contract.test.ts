import { Computer, SmartContract } from '@bitcoin-computer/lib'
import { EscrowAuditor, TBC20, TBC777 } from '@bitcoin-computer/TBC777'
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

/** Keeps deployed module size down when inlining TBC777 + EscrowAuditor. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

async function deployTbc777Mod(deployer: Computer): Promise<string> {
  return deployer.deploy(`
    export ${stripComments(TBC20.toString())}
    export ${stripComments(EscrowAuditor.toString())}
    export ${stripComments(TBC777.toString())}
  `)
}

async function ensureFunds(c: Computer, minSats = 10e8) {
  try {
    const { balance } = await c.getBalance()
    if (balance < minSats) await c.faucet(minSats)
  } catch {
    await c.faucet(minSats)
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

/** Confirm pending txs on regtest (faucet mines a block; use minter, not players). */
async function confirmChainTip(miner: Computer) {
  if (network !== 'regtest') {
    await sleep(2000)
    return
  }
  await miner.faucet(1e8)
}

async function withdrawFromChess(
  player: Computer,
  tokenId: string,
  chessId: string,
  tbc777Mod: string,
) {
  const latestTokenRev = await player.latest(tokenId)
  const chessRev = await player.latest(chessId)
  const { tx, effect } = await player.encode({
    exp: `token.withdraw('${chessRev}')`,
    env: { token: latestTokenRev },
    mod: tbc777Mod,
  })
  await player.broadcast(tx)
  return effect.env.token as SmartContract<typeof TBC777>
}

/** Fund a chess game: mint, split tokens, both deposits. Returns game state. */
async function fundChessGame(opts: {
  minter: Computer
  white: Computer
  black: Computer
  tbc777Mod: string
  chessMod: string
  wager: bigint
  timeLimit: bigint
  mintAmount?: bigint
}) {
  const { minter, white, black, tbc777Mod, chessMod, wager, timeLimit } = opts
  const mintAmount = opts.mintAmount ?? 30n
  const to = minter.getPublicKey()

  const token = await minter.new(
    TBC777,
    [{ to, amount: mintAmount, name: 'chess-e2e', symbol: 'CHS' }],
    tbc777Mod,
  )
  await confirmChainTip(minter)
  const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n)
  await confirmChainTip(minter)
  const blackTokenUtxo = await token.transfer(black.getPublicKey(), 10n)
  await confirmChainTip(minter)
  if (!whiteTokenUtxo || !blackTokenUtxo) throw new Error('expected player token UTXOs')

  const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod)
  const whiteToken = await white.sync<typeof TBC777>(whiteTokenUtxo._rev)
  const { tx: whiteDepositTx, effect: whiteDepositEffect } = await white.encode({
    exp: `chess.acceptDeposit(whiteToken, ${wager}n, 'White', '${black.getPublicKey()}')`,
    env: { chess: chess._rev, whiteToken: whiteToken._rev },
    mod: chessMod,
  })
  await white.broadcast(whiteDepositTx)
  await confirmChainTip(minter)
  const chessAfterWhiteDeposit = whiteDepositEffect.env.chess as SmartContract<typeof ChessContract>

  const blackToken = await black.sync<typeof TBC777>(blackTokenUtxo._rev)
  const chessHeadForBlack = await white.latest(chessAfterWhiteDeposit._id)
  const { tx: tx1, effect: effect1 } = await black.encode({
    exp: `chess.acceptDeposit(blackToken, ${wager}n, 'Black', '${white.getPublicKey()}')`,
    env: { chess: chessHeadForBlack, blackToken: blackToken._rev },
    mod: chessMod,
  })
  await black.broadcast(tx1)
  await confirmChainTip(minter)
  const chessFunded = effect1.env.chess as SmartContract<typeof ChessContract>

  return {
    token,
    whiteTokenUtxo,
    blackTokenUtxo,
    blackToken,
    chess: chessAfterWhiteDeposit,
    chessFunded,
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
      expect(wrapper.canceledSeen).toBe(false)
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
   * Deploy chess + TBC777 token mods once; reuse spec strings across tests.
   */
  describe('Chain integration (local BCN)', () => {
    const TOKEN_SYMBOL = 'CHS'
    let tbc777Mod: string
    let chessMod: string

    before(async () => {
      const deployer = new Computer({ url, chain, network })
      await deployer.faucet(20e8)
      tbc777Mod = await deployTbc777Mod(deployer)
      await deployer.faucet(20e8)
      chessMod = await deployChessModule(deployer, chessDeployRoot)
    })

    describe('On-chain escrow flow', () => {
      const computer = new Computer({ url, chain, network })

      before(async () => {
        await computer.faucet(10e8)
      })

      it('Should create a ChessContract with correct initial state', async () => {
        const timeLimit = 60n * 10n
        const chess = await computer.new(ChessContract, ['root123', 5n, timeLimit], chessMod)
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
        expect(chess.canceledSeen).toBe(false)
      })

      it('Should reject moves when game is not fully funded', async () => {
        const timeLimit = 60n * 10n
        const chess = await computer.new(ChessContract, ['root123', 5n, timeLimit], chessMod)
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

      it('Should reject resign when game is not fully funded', async () => {
        await computer.faucet(1e8)
        const timeLimit = 60n * 10n
        const chess = await computer.new(ChessContract, ['root123', 5n, timeLimit], chessMod)
        await expect(async () => {
          const { tx } = await computer.encodeCall({
            target: chess,
            property: 'resign',
            args: [],
            mod: chessMod,
          })
          await computer.broadcast(tx)
        }).rejects.toThrow('Game not yet started')
      })
    })

    describe('E2E TBC777 escrow + ChessContract', () => {
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
        const timeLimit = 60n * 10n
        const to = minter.getPublicKey()
        const token = await minter.new(
          TBC777,
          [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }],
          tbc777Mod,
        )
        const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n)
        if (!whiteTokenUtxo) throw new Error('expected white token UTXO')
        const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod)
        const whiteToken = await white.sync<typeof TBC777>(whiteTokenUtxo._rev)

        await expect(async () => {
          const { tx } = await white.encode({
            exp: `chess.acceptDeposit(whiteToken, 3n, 'W', '${black.getPublicKey()}')`,
            env: { chess: chess._rev, whiteToken: whiteToken._rev },
            mod: chessMod,
          })
          await white.broadcast(tx)
        }).rejects.toThrow()
      })

      it('Should let the creator cancel a pending game and recover their wager', async () => {
        const wager = 5n
        const timeLimit = 60n * 10n
        const to = minter.getPublicKey()
        const token = await minter.new(
          TBC777,
          [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }],
          tbc777Mod,
        )
        await confirmChainTip(minter)
        const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n)
        if (!whiteTokenUtxo) throw new Error('expected white token UTXO')
        const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod)
        const whiteToken = await white.sync<typeof TBC777>(whiteTokenUtxo._rev)
        const { tx: depositTx, effect: depositEffect } = await white.encode({
          exp: `chess.acceptDeposit(whiteToken, ${wager}n, 'White', '${black.getPublicKey()}')`,
          env: { chess: chess._rev, whiteToken: whiteToken._rev },
          mod: chessMod,
        })
        await white.broadcast(depositTx)
        await confirmChainTip(minter)
        const chessPending = depositEffect.env.chess as SmartContract<typeof ChessContract>

        expect(chessPending.creatorPublicKey).toBe(white.getPublicKey())
        expect(chessPending.publicKeyW).toBe('')
        expect(chessPending.deposits.length).toBe(1)
        expect(chessPending._owners).toEqual([white.getPublicKey(), black.getPublicKey()])
        expect(chessPending.withdraws).toEqual([])
        expect(chessPending.finalWithdraws).toEqual([])

        const helper = ChessContractHelper.fromModSpecs(white, chessMod, undefined, tbc777Mod)
        expect(helper.canCancel(chessPending)).toBe(true)
        expect(helper.isCreator(chessPending)).toBe(true)

        await helper.cancelGameAndWithdraw(chessPending._id)
        await confirmChainTip(minter)

        const whiteTokenFinal = await white.sync<typeof TBC777>(await white.latest(whiteToken._id))
        expect(whiteTokenFinal.amount).toBe(10n)
      })

      it('Should reject cancel from the invited opponent', async () => {
        const wager = 5n
        const timeLimit = 60n * 10n
        const to = minter.getPublicKey()
        const token = await minter.new(
          TBC777,
          [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }],
          tbc777Mod,
        )
        await confirmChainTip(minter)
        const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n)
        if (!whiteTokenUtxo) throw new Error('expected white token UTXO')
        const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod)
        const whiteToken = await white.sync<typeof TBC777>(whiteTokenUtxo._rev)
        const { tx: depositTx, effect: depositEffect } = await white.encode({
          exp: `chess.acceptDeposit(whiteToken, ${wager}n, 'White', '${black.getPublicKey()}')`,
          env: { chess: chess._rev, whiteToken: whiteToken._rev },
          mod: chessMod,
        })
        await white.broadcast(depositTx)
        await confirmChainTip(minter)
        const chessPending = depositEffect.env.chess as SmartContract<typeof ChessContract>

        const blackHelper = ChessContractHelper.fromModSpecs(black, chessMod, undefined, tbc777Mod)

        await expect(blackHelper.cancelGameAndWithdraw(chessPending._id)).rejects.toThrow(
          'Cannot cancel',
        )
      })

      it('Should reject second deposit from the creator using their own token', async () => {
        const wager = 5n
        const timeLimit = 60n * 10n
        const to = minter.getPublicKey()
        const token = await minter.new(
          TBC777,
          [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }],
          tbc777Mod,
        )
        await confirmChainTip(minter)
        const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n)
        if (!whiteTokenUtxo) throw new Error('expected white token UTXO')
        const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod)
        const whiteToken = await white.sync<typeof TBC777>(whiteTokenUtxo._rev)
        await chess.acceptDeposit(whiteToken, wager, 'White', black.getPublicKey())

        const chessHead = await white.latest(chess._id)
        const whiteTokenAfterDeposit = await white.sync<typeof TBC777>(
          await white.latest(whiteToken._id),
        )

        await expect(async () => {
          const { tx } = await white.encode({
            exp: `chess.acceptDeposit(whiteTokenAfterDeposit, ${wager}n, 'FakeBlack', '${white.getPublicKey()}')`,
            env: { chess: chessHead, whiteTokenAfterDeposit: whiteTokenAfterDeposit._rev },
            mod: chessMod,
          })
          await white.broadcast(tx)
        }).rejects.toThrow('Only the invited opponent can accept the game')
      })

      it('Should reject cancel after the game has started', async () => {
        const wager = 5n
        const timeLimit = 60n * 10n
        const { chess, chessFunded } = await fundChessGame({
          minter,
          white,
          black,
          tbc777Mod,
          chessMod,
          wager,
          timeLimit,
        })

        expect(chessFunded.publicKeyW).toBe(white.getPublicKey())

        const chessHead = await white.latest(chess._id)
        const chessStarted = await white.sync<typeof ChessContract>(chessHead)

        await expect(async () => {
          const { tx } = await white.encodeCall({
            target: chessStarted,
            property: 'cancel',
            args: [],
            mod: chessMod,
          })
          await white.broadcast(tx)
        }).rejects.toThrow('Game started use resign to forfeit')
      })

      it('Should reject resign on a pending game via helper', async () => {
        const wager = 5n
        const timeLimit = 60n * 10n
        const to = minter.getPublicKey()
        const token = await minter.new(
          TBC777,
          [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }],
          tbc777Mod,
        )
        const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n)
        if (!whiteTokenUtxo) throw new Error('expected white token UTXO')
        const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod)
        const whiteToken = await white.sync<typeof TBC777>(whiteTokenUtxo._rev)
        await chess.acceptDeposit(whiteToken, wager, 'White', black.getPublicKey())

        const helper = ChessContractHelper.fromModSpecs(white, chessMod, undefined, tbc777Mod)
        await expect(helper.resign(chess._id)).rejects.toThrow('Game not yet started')
      })

      it('Should settle on resign and credit winner balance on withdraw', async () => {
        const wager = 5n
        const timeLimit = 60n * 10n
        const { token, whiteTokenUtxo, blackTokenUtxo, blackToken, chess, chessFunded } =
          await fundChessGame({
            minter,
            white,
            black,
            tbc777Mod,
            chessMod,
            wager,
            timeLimit,
          })

        expect(chessFunded.deposits).toEqual([
          [token._root, whiteTokenUtxo._rev],
          [token._root, blackTokenUtxo._rev],
        ])
        expect(chessFunded.withdraws).toEqual([])
        expect(chessFunded.finalWithdraws).toEqual([])
        // After both deposits it is white’s turn.
        expect(chessFunded._owners).toEqual([white.getPublicKey()])

        const chessHead = await white.latest(chess._id)
        const chessToResign = await white.sync<typeof ChessContract>(chessHead)
        const { tx: resignTx, effect: resignEffect } = await white.encodeCall({
          target: chessToResign,
          property: 'resign',
          args: [],
          mod: chessMod,
        })
        await white.broadcast(resignTx)
        const chessFinal = (resignEffect as unknown as { env: { __bc__: unknown } }).env
          .__bc__ as SmartContract<typeof ChessContract>

        const totalPot = wager * 2n
        expect(chessFinal.withdraws).toEqual([[token._root, blackToken._id, totalPot]])

        expect((await black.sync<typeof TBC777>(await black.latest(blackToken._id))).amount).toBe(
          5n,
        )

        const blackTokenFinal = await withdrawFromChess(
          black,
          blackToken._id,
          chess._id,
          tbc777Mod,
        )
        expect(blackTokenFinal.amount).toBe(15n)
      })

      it('Should run fool mate and credit winner balance on withdraw', async () => {
        const wager = 5n
        const timeLimit = 60n * 10n
        const { token, whiteTokenUtxo, blackTokenUtxo, blackToken, chess, chessFunded } =
          await fundChessGame({
            minter,
            white,
            black,
            tbc777Mod,
            chessMod,
            wager,
            timeLimit,
          })

        expect(chessFunded.deposits).toEqual([
          [token._root, whiteTokenUtxo._rev],
          [token._root, blackTokenUtxo._rev],
        ])

        // Fool’s mate (black wins): 1.f3 e5 2.g4 Qh4#
        const moves: { from: string; to: string; promotion: string; player: Computer }[] = [
          { from: 'f2', to: 'f3', promotion: '', player: white },
          { from: 'e7', to: 'e5', promotion: '', player: black },
          { from: 'g2', to: 'g4', promotion: '', player: white },
          { from: 'd8', to: 'h4', promotion: '', player: black },
        ]

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let currentChess: any = chessFunded
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
          await confirmChainTip(minter)
          currentChess = (effect as unknown as { env: { __bc__: unknown } }).env.__bc__
        }

        const chessFinal = currentChess as SmartContract<typeof ChessContract>
        const totalPot = wager * 2n
        expect(chessFinal.withdraws).toEqual([[token._root, blackToken._id, totalPot]])

        const blackTokenFinal = await withdrawFromChess(
          black,
          blackToken._id,
          chess._id,
          tbc777Mod,
        )
        expect(blackTokenFinal.amount).toBe(15n)
      })
    })
  })
})
