import type { Transaction } from '@bitcoin-computer/lib'

export class StaticSwap extends Contract {
  static exec(a: any, b: any) {
    const [ownerA] = a._owners
    const [ownerB] = b._owners
    a.transfer(ownerB)
    b.transfer(ownerA)
  }
}

export class StaticSwapHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${StaticSwap}`)
    return this.mod
  }

  // async createSwapTx(a: any, b: any): Promise<{ tx: Transaction; effect: { res: any; env: any } }> {
  //   return this.computer.encode({
  //     // fund: false,
  //     exp: `StaticSwap.exec(a, b)`,
  //     env: { a: a._rev, b: b._rev },
  //     mod: this.mod,
  //   })
  // }

  async createSwapTx(a: any, b: any) {
    const { tx } = await this.computer.encode({
      fund: false,
      exp: `StaticSwap.exec(a, b)`,
      env: { a: a._rev, b: b._rev },
      mod: this.mod,
    })

    const fee = await this.computer.db.wallet.estimateFee(tx)
    const txId = await this.computer.send(BigInt(fee * 10), this.computer.getAddress())
    return this.computer.encode({
      exp: `StaticSwap.exec(a, b)`,
      env: { a: a._rev, b: b._rev },
      mod: this.mod,
      include: [`${txId}:0`],
    })
  }

  async checkSwapTx(tx: Transaction, pubKeyA: string, pubKeyB: string) {
    const { exp, env, mod } = await this.computer.decode(tx)
    if (exp !== 'StaticSwap.exec(a, b)') throw new Error('Unexpected expression')
    if (mod !== this.mod) throw new Error('Unexpected module specifier')

    const {
      effect: { res: r, env: e },
    } = await this.computer.encode({ exp, env, mod })

    if (r !== undefined) throw new Error('Unexpected result')
    if (Object.keys(e).toString() !== 'a,b') throw new Error('Unexpected environment')

    const { a, b } = e

    if (a._owners.toString() !== pubKeyB) throw new Error('Unexpected owner')
    if (b._owners.toString() !== pubKeyA) throw new Error('Unexpected owner')

    return e
  }
}
