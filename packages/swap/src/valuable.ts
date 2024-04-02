/* eslint-disable max-classes-per-file */
import { getMockedRev } from './utils/index.js'

const { Contract } = await import('@bitcoin-computer/lib')

const randomPublicKey = '023e21361b53bb2e625cc1f41d18b35ae882e88d8d107df1c3711fa8bc54db8fed'

export class Valuable extends Contract {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  setAmount(amount: number) {
    this._amount = amount
  }
}

export class ValuableMock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor() {
    this._id = getMockedRev()
    this._rev = getMockedRev()
    this._root = getMockedRev()
    this._owners = [randomPublicKey]
    this._amount = 7860
  }

  setAmount(amount: number) {
    this._amount = amount
  }
}
