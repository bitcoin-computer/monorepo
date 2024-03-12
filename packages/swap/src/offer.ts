// @ts-ignore
import { Contract } from '@bitcoin-computer/lib'

export class Offer extends Contract {
  constructor(owner: string, url: string, json: string) {
    super({ _owners: [owner], _url: url, json })
  }
}
