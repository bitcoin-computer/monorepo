/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import dotenv from 'dotenv'
import { Payment, PaymentHelper } from '../src'

dotenv.config({ path: '../../.env' })

const url = process.env.BCN_URL

describe('Payment', () => {
  const alice = new Computer({ url })
  const bob = new Computer({ url })

  before('Before', async () => {
    await alice.faucet(1e8)
    await bob.faucet(0.01e8)
  })

  describe('Alice creates payment', () => {
    let paymentTxId: string
    describe('Alice creates an offer and add tx using addSaleTx', async () => {
      let paymentHelper: PaymentHelper

      before('Before creating an offer', async () => {
        paymentHelper = new PaymentHelper(alice)
      })

      it('Alice deploys the payment contract', async () => {
        await alice.faucet(0.1e8)
        await paymentHelper.deploy()
      })

      it('Alice creates an payment transaction and broadcast it', async () => {
        await alice.faucet(1e8)
        const { tx: paymentTx } = await paymentHelper.createPaymentTx(2e8)

        paymentTxId = await alice.broadcast(paymentTx)

        const payment: Payment = await paymentHelper.getPayment(paymentTxId)
        expect(payment._amount).eq(2e8)
      })
    })
  })
})
