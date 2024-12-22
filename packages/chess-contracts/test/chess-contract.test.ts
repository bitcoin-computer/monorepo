import { Computer } from '@bitcoin-computer/lib'
import { crypto } from '@bitcoin-computer/nakamotojs'
import { ChessContract, ChessContractHelper } from '../src/chess-contract'
import { deploy } from '../scripts/lib.js'
import { expect } from 'expect'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const chain = 'LTC'
const network = 'regtest'
const url = 'http://localhost:1031'

const secretW = 'secretW'
const secretB = 'secretB'
const secretHashW = crypto.sha256(crypto.sha256(Buffer.from(secretW))).toString('hex')
const secretHashB = crypto.sha256(crypto.sha256(Buffer.from(secretB))).toString('hex')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const chessContractDirectory = `${__dirname}/..`

describe('deploy', () => {
  const computer = new Computer()
  
  beforeEach(async () => {
    await computer.faucet(1e8)
  })

  it('Should deploy the smart contract', async () => {
    const mod = await deploy(computer, chessContractDirectory)
    expect(typeof mod).toEqual('string')
  })
})

describe('ChessContract', () => {
  const computerW = new Computer()
  const computerB = new Computer()
  const computer = new Computer()
  const amount = 1e6
  let mod: string

  beforeEach(async () => {
    await computerW.faucet(1e8)
    await computer.faucet(1e8)
    mod = await deploy(computer, chessContractDirectory)
  })

  describe('constructor', () => {
    it('Should create a smart object', async () => {
      const chessContract = await computerW.new(
        ChessContract,
        [
          amount,
          'w',
          'b',
          computerW.getPublicKey(),
          computerB.getPublicKey(),
          secretHashW,
          secretHashB,
        ],
        mod,
      )
      expect(typeof secretHashW).not.toEqual('undefined')
      expect(chessContract.fen).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    }, 30000)
  })

  describe('move', () => {
    it('Should perform a move', async () => {
      const chessContract = await computerW.new(
        ChessContract,
        [
          amount,
          'w',
          'b',
          computerW.getPublicKey(),
          computerB.getPublicKey(),
          secretHashW,
          secretHashB,
        ],
        mod,
      )
      const fenBefore = chessContract.fen
      await chessContract.move('e2', 'e4')
      expect(chessContract.fen).toEqual(
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      )
      expect(typeof chessContract.payment).not.toEqual('undefined')
      expect(chessContract.fen).not.toEqual(fenBefore)
    }, 30000)
  })
})

describe('ChessContractHelper', () => {
  let computerW: Computer
  let computerB: Computer
  let chessContractHelperW: ChessContractHelper
  let chessContractHelperB: ChessContractHelper
  const amount = 1e6

  beforeEach(async () => {
    computerW = new Computer({ chain, network, url })
    computerB = new Computer({ chain, network, url })

    await computerW.faucet(1e8)
    await computerB.faucet(1e8)
    chessContractHelperW = new ChessContractHelper(
      computerW,
      'nameW',
      'nameB',
      amount,
      computerW.getPublicKey(),
      computerB.getPublicKey(),
      secretHashW,
      secretHashB,
    )
    chessContractHelperB = new ChessContractHelper(
      computerB,
      'nameW',
      'nameB',
      amount,
      computerW.getPublicKey(),
      computerB.getPublicKey(),
      secretHashW,
      secretHashB,
    )
    chessContractHelperW.mod = await deploy(computerW, chessContractDirectory)
  }, 20000)

  describe('makeTx', () => {
    it('Should deploy the smart contract', () => {
      expect(chessContractHelperW.mod).toBeDefined()
    })

    it('Should return a transaction', async () => {
      const tx = await chessContractHelperW.makeTx()
      expect(tx).toBeDefined()
      expect(tx?.ins.length).toBeGreaterThan(0)
      expect(tx?.outs.length).toBeGreaterThan(0)
      // expect(tx?.outs[0].value).toEqual(amount)
    })
  })

  describe('completeTx', () => {
    it('Should create a transaction', async () => {
      const tx = await chessContractHelperW.makeTx()
      const txId = await chessContractHelperB.completeTx(tx)
      expect(typeof txId).toEqual('string')
      const { res, env } = await computerW.sync(txId) as { res: ChessContract, env: [] }
      expect(Object.keys(res)).toEqual([
        'amount',
        'nameW',
        'nameB',
        'publicKeyW',
        'publicKeyB',
        'secretHashW',
        'secretHashB',
        'sans',
        'fen',
        'payment',
        '_root',
        '_rev',
        '_id',
        '_amount',
        '_owners',
      ])
      expect(Object.keys(env)).toEqual([])
      await res.move('e2', 'e4')
    }, 10000)
  })

  describe('spend', () => {
    it('Should allow black to spend with the correct secret', async () => {
      const tx = await chessContractHelperW.makeTx()
      const txId = await chessContractHelperB.completeTx(tx)
      const txId2 = await chessContractHelperB.spendWithSecret(txId, secretB, 1)
      expect(typeof txId2).toEqual('string')
    }, 20000)

    it('Should allow white to spend with the correct secret', async () => {
      const tx = await chessContractHelperW.makeTx()
      const txId = await chessContractHelperB.completeTx(tx)
      const txId2 = await chessContractHelperW.spendWithSecret(txId, secretW, 0)
      expect(typeof txId2).toEqual('string')
    }, 20000)

    it('Should throw an error when trying to spend with the wrong secret', async () => {
      const tx = await chessContractHelperW.makeTx()
      const txId = await chessContractHelperB.completeTx(tx)
      await expect(chessContractHelperW.spendWithSecret(txId, secretB, 0)).rejects.toThrow(
        'mandatory-script-verify-flag-failed (Script evaluated without error but finished with a false/empty top stack element)',
      )
      await expect(chessContractHelperW.spendWithSecret(txId, secretB, 1)).rejects.toThrow(
        'mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)',
      )
    }, 20000)
  })
})
