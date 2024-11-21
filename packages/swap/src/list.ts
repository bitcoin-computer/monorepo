/* eslint-disable max-classes-per-file */

export class List extends Contract {
  elements: string[]

  constructor() {
    super({ elements: [] })
  }

  add(key: string) {
    this.elements = [key, ...this.elements]
  }

  delete(key: string) {
    this.elements = this.elements.filter((el) => el !== key)
  }
}

export class ListHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${List}`)
    return this.mod
  }
}
