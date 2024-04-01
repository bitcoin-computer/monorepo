/* eslint-disable max-classes-per-file */
import { getMockedRev } from './utils'

const { Contract } = await import('@bitcoin-computer/lib')

export class Payment extends Contract {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor(_amount: number) {
    super({ _amount })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

export class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor(amount: number) {
    this._id = getMockedRev()
    this._rev = getMockedRev()
    this._root = getMockedRev()
    this._amount = amount
    this._owners = ['023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c']
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
