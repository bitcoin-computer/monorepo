import { Computer } from '@bitcoin-computer/lib'
import { ChessGame, ChessGameHelper } from '../src/contracts/chess-contract'
import { crypto } from '@bitcoin-computer/nakamotojs'
import { deploy } from '../scripts/lib'

const CHAIN = 'LTC'
const NETWORK = 'regtest'
const BCN_URL = 'http://localhost:1031'

const secretW = 'secretW'
const secretB = 'secretB'
const secretHashW = crypto.sha256(crypto.sha256(Buffer.from(secretW))).toString('hex')
const secretHashB = crypto.sha256(crypto.sha256(Buffer.from(secretB))).toString('hex')

export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

describe("ChessGame", () => {
  const computerW = new Computer()
  const computerB = new Computer()
  const computer = new Computer()
  const amount = 1e6
  let mod

  beforeAll(async () => {
    await computerW.faucet(1e8)
    await computer.faucet(1e8)
    mod = await deploy(computer)
  }, 20000)


  describe("constructor", () => {
    it('Should create a smart object', async () => {
      const chessGame = await computerW.new(ChessGame, [amount, 'w', 'b', computerW.getPublicKey(), computerB.getPublicKey(), secretHashW, secretHashB], mod)
      expect(chessGame).toBeDefined()
      expect(chessGame.fen).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    }, 30000)
  })

  describe('move', () => {
    test('Should perform a move', async () => {
      const chessGame = await computerW.new(ChessGame, [amount, 'w', 'b', computerW.getPublicKey(), computerB.getPublicKey(), secretHashW, secretHashB], mod)
      const fenBefore = chessGame.fen
      await chessGame.move('e4')
      expect(chessGame.fen).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')
      expect(chessGame.payment).toBeDefined()
      expect(chessGame.fen).not.toEqual(fenBefore)
    }, 30000)
  })
})

describe('ChessGameHelper', () => {
  let computerW
  let computerB
  let chessGameHelperW
  let chessGameHelperB
  const amount = 1e6

  beforeEach(async () => {
    computerW = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL })
    computerB = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL })
    
    await computerW.faucet(1e8)
    await computerB.faucet(1e8)
    chessGameHelperW = new ChessGameHelper(computerW,
      'nameW',
      'nameB',
      amount,
      computerW.getPublicKey(),
      computerB.getPublicKey(),
      secretHashW,
      secretHashB
    )
    chessGameHelperB = new ChessGameHelper(computerB,
      'nameW',
      'nameB',
      amount,
      computerW.getPublicKey(),
      computerB.getPublicKey(),
      secretHashW,
      secretHashB
    )
    chessGameHelperW.mod = await deploy(computerW)
  }, 20000)

  describe('makeTx', () => {
    it('Should deploy the smart contract', () => {
      expect(chessGameHelperW.mod).toBeDefined()
    })

    it('Should return a transaction', async () => { 
      const tx = await chessGameHelperW.makeTx()
      expect(tx).toBeDefined()
      expect(tx?.ins.length).toBeGreaterThan(0)
      expect(tx?.outs.length).toBeGreaterThan(0)
      // expect(tx?.outs[0].value).toEqual(amount)    
    })
  })

  describe('completeTx', () => {
    it('Should create a transaction', async () => {
      const tx = await chessGameHelperW.makeTx()
      const txId = await chessGameHelperB.completeTx(tx)
      expect(typeof txId).toEqual('string')
      const { res, env } = await computerW.sync(txId)
      expect(Object.keys(res)).toEqual(['amount', 'nameW', 'nameB', 'publicKeyW', 'publicKeyB', 'secretHashW', 'secretHashB', 'sans', 'fen', 'payment', '_root', '_rev', '_id', '_amount', '_owners'])
      expect(Object.keys(env)).toEqual([])      
      await res.move('e4')
    }, 10000)
  })

  describe('spend', () => {
    it('Should allow black to spend with the correct secret', async () => {
      const tx = await chessGameHelperW.makeTx()
      const txId = await chessGameHelperB.completeTx(tx)
      const txId2 = await chessGameHelperB.spend(txId, secretB, 1)
      expect(typeof txId2).toEqual('string')
    }, 20000)

    it('Should allow white to spend with the correct secret', async () => {
      const tx = await chessGameHelperW.makeTx()
      const txId = await chessGameHelperB.completeTx(tx)
      const txId2 = await chessGameHelperW.spend(txId, secretW, 0)
      expect(typeof txId2).toEqual('string')
    }, 20000)

    it('Should throw an error when trying to spend with the wrong secret', async () => {
      const tx = await chessGameHelperW.makeTx()
      const txId = await chessGameHelperB.completeTx(tx)
      await expect(chessGameHelperW.spend(txId, secretB, 0)).rejects.toThrow('mandatory-script-verify-flag-failed (Script evaluated without error but finished with a false/empty top stack element)')
      await expect(chessGameHelperW.spend(txId, secretB, 1)).rejects.toThrow('mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)')
    }, 20000)
  })
})
