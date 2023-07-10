// import bitcore from '@bitcoin-computer/bitcore-lib-ltc'
import Mnemonic from '@bitcoin-computer/bitcore-mnemonic-ltc'
import { expect } from 'chai'
import { getSpendablePublicKeyString, getPath } from '../../lib-secret/src/utils'
import { Tx } from '../../lib-secret/src/tx'
import { Db } from '../../lib-secret/src/db'
import { getFundedConfs, getTestMnemonic, } from '../../lib-secret/test/test-utils/index'
import { getSpendableAddress } from '../../lib-secret/src/utils'
import { SIGHASH_ALL } from '../../lib-secret/config/constants'
import { MIN_NON_DUST_AMOUNT, CHAIN, NETWORK } from '../../lib-secret/config/config'
import { Conf } from '../../node-secret/test/utils'

const { PublicKey, PrivateKey } = Mnemonic.bitcore
const ANYONE_CAN_SPEND_MNEMONIC = "replace this seed"
const BCDB_MNEMONIC = process.env.BCDB_MNEMONIC || ''

const random = true

let confs: Conf[] = []
before('Before db', async () => {
  confs = await getFundedConfs({ n: 1, random })
})

describe('Mnemonic', () => {
  describe('createPrivateKey()', () => {
    it('returns new secret', () => {
      const anyoneCanSpendMnemonic = new Mnemonic(ANYONE_CAN_SPEND_MNEMONIC)

      let hdPrivateKey = anyoneCanSpendMnemonic.toHDPrivateKey()
      const path = getPath({ chain: 'LTC', network: 'testnet' })
      if (path) {
        hdPrivateKey = hdPrivateKey.deriveChild(path)
      }
      expect(hdPrivateKey.privateKey).not.to.be.undefined
      expect(hdPrivateKey.privateKey instanceof PrivateKey).to.be.true
      const pubKey = PublicKey.fromPrivateKey(hdPrivateKey.privateKey)
      expect(pubKey).not.to.be.undefined
    })
  })
})

describe('Fees', () => {
  it('should work for a transaction with a data output', async () => {
    const db = new Db(confs.pop())

    const data = {
      a: 'a'.repeat(100),
      _owners: [db.wallet.publicKey.toString()],
      _amount: MIN_NON_DUST_AMOUNT,
    }

    const transaction = await db.toTx({ outData: [data] })
    await db.wallet.fund(transaction)
    await db.wallet.broadcast(transaction)

    const hex = transaction.tx.toString()
    const res = await db.fromTxHex(hex)
    expect(res.inRevs).to.deep.eq([])
    expect(res.outRevs).to.be.an('array')
    expect(res.inputs).to.be.an('array').that.have.lengthOf(1)
    expect(res.inputs[0]).to.be.a('string')
    expect(res.outData).to.deep.eq([data])
    // @ts-ignore
    expect(res.opReturns).to.deep.eq('000001002[{"a":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    expect(res.txId).to.be.a('string')

    const bcdbDb = new Db({ mnemonic: BCDB_MNEMONIC, path: getPath({ chain: CHAIN, network: NETWORK }), })
    const bcdbWallet = bcdbDb.wallet
    const { restClient } = bcdbWallet
    const bcdbAddres = getSpendableAddress(CHAIN, NETWORK)
    const bcdbBalanceBefore = await db.wallet.restClient.getBalance(
      bcdbAddres.toString()
    )

    // find a dataOutput with spendable publicKey
    const dataOutputIdx = transaction.tx.outputs.findIndex(
      (output) =>
        output.script.chunks.findIndex(
          (chunk) => chunk.buf?.toString('hex') === getSpendablePublicKeyString(CHAIN, NETWORK)
        ) > 0
    )
    expect(dataOutputIdx).to.be.greaterThan(0)

    const spendTx = new Tx({ restClient })

    await spendTx.spendFromData([`${transaction.tx.id}:${dataOutputIdx}`])
    spendTx.tx.to(bcdbAddres, MIN_NON_DUST_AMOUNT)
    spendTx.tx.sign(bcdbWallet.privateKey, SIGHASH_ALL)
    await bcdbWallet.restClient.broadcast(spendTx.tx.toString())

    const bcdbBalanceAfter = await bcdbDb.wallet.restClient.getBalance(bcdbAddres.toString())
    const bcdbPayment = bcdbBalanceAfter - bcdbBalanceBefore
    expect(bcdbPayment).to.be.greaterThan(0)
  })
})
