import { Contract } from '@bitcoin-computer/lib'

export class Payment extends Contract {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor(owner: string, _amount: number) {
    super({ _owners: [owner], _amount })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
