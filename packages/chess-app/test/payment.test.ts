import { Computer } from '@bitcoin-computer/lib'
import { Payment, PaymentHelper } from '../src/contracts/payment'
import { crypto } from '@bitcoin-computer/nakamotojs'

const CHAIN = 'LTC'
const NETWORK = 'regtest'
const BCN_URL = 'http://localhost:1031'

export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

describe("PaymentHelper", () => {
  const amount = 1e8
  const secretW = 'secretW'
  const secretB = 'secretB'
  const secretHashW = crypto.sha256(crypto.sha256(Buffer.from(secretW)))
  const secretHashB = crypto.sha256(crypto.sha256(Buffer.from(secretB)))
  const secretHexW = secretHashW.toString('hex')
  const secretHexB = secretHashB.toString('hex')

  let computerW
  let computerB
  let paymentHelperW
  let paymentHelperB
  
  beforeEach(async () => {
    computerW = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL })
    computerB = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL })

    paymentHelperB = new PaymentHelper(computerB, amount, computerW.getPublicKey(), secretHexW, computerB.getPublicKey(), secretHexB)
    paymentHelperW = new PaymentHelper(computerW, amount, computerW.getPublicKey(), secretHexW, computerB.getPublicKey(), secretHexB)
    await computerW.faucet(1.5e8)
    await computerB.faucet(1.5e8)
    await paymentHelperW.deploy()
  })

  describe('constructor', () => {
    it('Should create a smart object', async () => {
      const payment = await computerW.new(Payment, [{ amount, publicKeyW: computerW.getPublicKey(), secretHexW, publicKeyB: computerB.getPublicKey(), secretHexB }])
      expect(payment).toBeDefined()
      expect(typeof payment._id).toBe('string')
    })
  })

  describe('makeTx', () => {
    it('Should create a transaction', async () => {
      const tx = await paymentHelperW.makeTx()
      expect(tx).toBeDefined()
      expect(tx?.ins.length).toBeGreaterThan(0)
      expect(tx?.outs.length).toBeGreaterThan(0)
      expect(tx?.outs[0].value).toEqual(amount)
    })
  })

  describe('completeTx', () => {
    it('Should create a transaction', async () => {
      const tx = await paymentHelperW.makeTx()
      const txId = await paymentHelperB.completeTx(tx)
      expect(typeof txId).toEqual('string')
    })
  })

  describe('spend', () => {
    it('Should allow black to spend with the correct secret', async () => {
      const tx = await paymentHelperW.makeTx()
      const txId = await paymentHelperB.completeTx(tx)
      const txId2 = await paymentHelperB.spend(txId, secretB, 1)
      expect(typeof txId2).toEqual('string')
    })

    it('Should allow white to spend with the correct secret', async () => {
      const tx = await paymentHelperW.makeTx()
      const txId = await paymentHelperB.completeTx(tx)
      const txId2 = await paymentHelperW.spend(txId, secretW, 0)
      expect(typeof txId2).toEqual('string')
    })

    it('Should throw an error when trying to spend with the wrong secret', async () => {
      const tx = await paymentHelperW.makeTx()
      const txId = await paymentHelperB.completeTx(tx)
      await expect(paymentHelperW.spend(txId, secretB, 0)).rejects.toThrow('mandatory-script-verify-flag-failed (Script evaluated without error but finished with a false/empty top stack element)')
      await expect(paymentHelperW.spend(txId, secretB, 1)).rejects.toThrow('mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)')
    }, 20000)
  })
})