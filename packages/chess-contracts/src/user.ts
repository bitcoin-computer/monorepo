import { Computer } from '@bitcoin-computer/lib'

export class User extends Contract {
  name!: string
  games!: string[]

  constructor(name: string) {
    super({ name, games: [] })
  }

  addGame(gameId: string) {
    this.games.push(gameId)
  }
}

export class UserHelper {
  computer: Computer
  mod?: string

  constructor({ computer, mod }: { computer: Computer; mod?: string }) {
    this.computer = computer
    this.mod = mod
  }

  async createUser(name: string): Promise<string> {
    if (!name || !name.trim()) {
      throw new Error('Name can not be empty')
    }
    const { tx } = await this.computer.encode({
      exp: `new User(
        "${name}"
      )`,
      mod: this.mod,
    })
    return this.computer.broadcast(tx)
  }
}
