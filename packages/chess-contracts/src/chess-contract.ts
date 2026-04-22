import { Computer, Transaction, SmartContract } from '@bitcoin-computer/lib'
import { User } from './user.js'

export class ChessContract extends Contract {
  wagerAmount!: bigint
  timeLimit!: bigint
  nameW!: string
  nameB!: string
  publicKeyW!: string
  publicKeyB!: string
  sans!: string[]
  fen!: string
  deposits!: [string, string][]
  withdraws!: [string, string, bigint][]
  /** Required by TBC777M escrow audit (`isValid` / `computeFinalWithdraws`). */
  finalWithdraws!: [string, string, bigint][]
  root!: string
  tokenIdW!: string
  tokenIdB!: string

  constructor(root: string, wagerAmount: bigint, timeLimit: bigint) {
    super({
      wagerAmount,
      timeLimit,
      nameW: '',
      nameB: '',
      publicKeyW: '',
      publicKeyB: '',
      sans: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      deposits: [],
      withdraws: [],
      finalWithdraws: [],
      root,
      tokenIdW: '',
      tokenIdB: '',
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async acceptDeposit(token: any, amount: bigint, name: string, nextOwner: string) {
    if (amount !== this.wagerAmount) throw new Error('Deposit amount must match wager')
    token.deposit(this._id, amount)
    this.deposits.push([token._root, token._rev])
    this._owners = [nextOwner]
    if (!this.publicKeyB) {
      this.tokenIdW = token._id
      this.nameW = name
      this.publicKeyB = nextOwner
    } else if (!this.publicKeyW) {
      this.tokenIdB = token._id
      this.nameB = name
      this.publicKeyW = nextOwner
    } else {
      throw new Error('Game is already fully funded')
    }
  }

  move(from: string, to: string, promotion: string): boolean {
    if (!this.publicKeyB || !this.publicKeyW) throw new Error('Game not yet fully funded')
    // @ts-expect-error Chess is available in the deployed module scope
    const chessLib = new Chess(this.fen)
    const moveArg: { from: string; to: string; promotion?: string } = { from, to }
    if (promotion) moveArg.promotion = promotion
    const { san } = chessLib.move(moveArg)
    this.sans.push(san)
    this.fen = chessLib.fen()

    // const totalWager = this.wagerAmount * 2n
    if (!chessLib.isGameOver()) {
      if (this._owners[0] === this.publicKeyW) {
        this._owners = [this.publicKeyB]
        // this.finalWithdraws = [[this.root, this.tokenIdB, totalWager]]
      } else {
        this._owners = [this.publicKeyW]
        // this.finalWithdraws = [[this.root, this.tokenIdW, totalWager]]
      }
    }
    return chessLib.isGameOver()
  }

  claimWin() {
    // @ts-expect-error Chess is available in the deployed module scope
    const chessLib = new Chess(this.fen)
    if (!this.isGameOver()) throw new Error('Game not over')
    if (chessLib.isCheckmate()) {
      this.withdraws = [
        [this.root, this.tokenIdW, this.wagerAmount],
        [this.root, this.tokenIdB, this.wagerAmount],
      ]
    }
    const winnerId = this._owners[0] === this.publicKeyW ? this.tokenIdW : this.tokenIdB
    this.withdraws = [[this.root, winnerId, 2n * this.wagerAmount]]
  }

  resign() {
    const winnerId = this._owners[0] === this.publicKeyW ? this.tokenIdB : this.tokenIdW
    this.withdraws = [[this.root, winnerId, 2n * this.wagerAmount]]
  }

  isGameOver(): boolean {
    // @ts-expect-error Chess is available in the deployed module scope
    return new Chess(this.fen).isGameOver()
  }

  async hasTimedOutW(): Promise<boolean> {
    const { timeW } = await this.calculateTimes()
    return timeW > this.timeLimit
  }

  async hasTimedOutB(): Promise<boolean> {
    const { timeB } = await this.calculateTimes()
    return timeB > this.timeLimit
  }

  /**
   * Calculates white time (timeW) and black time (timeB) from a list of timestamps.
   * timeW = (t2 - t1) + (t4 - t3) + (t6 - t5) + ...
   * timeB = (t3 - t2) + (t5 - t4) + (t7 - t6) + ...
   *
   * Note: timeW + timeB will equal (tn - t1).
   */
  async calculateTimes(): Promise<{ timeW: bigint; timeB: bigint }> {
    let current = this._rev
    const timestamps: bigint[] = []

    // Collect every historical state. Deposits and withdrawals accumulate
    // across the entire lifetime of the escrow, so the audit must see them all.
    while (true) {
      const txId = current.split(':')[0]
      timestamps.push(await computer.txIdToBlockTime(txId))
      const previous = await computer.prev(current)
      if (!previous) break
      current = previous
    }

    if (timestamps.length < 2) return { timeW: 0n, timeB: 0n }

    let timeW = 0n
    let timeB = 0n

    // Start from the first move (index 0)
    for (let i = 1; i < timestamps.length; i++) {
      const diff: bigint = timestamps[i] - timestamps[i - 1]

      if (i % 2 === 1) {
        // Odd indices (1, 3, 5, ...): White's moves
        timeW += diff
      } else {
        // Even indices (2, 4, 6, ...): Black's moves
        timeB += diff
      }
    }

    return { timeW, timeB }
  }
}

export class ChessContractHelper {
  computer: Computer
  mod?: string
  userMod?: string
  tokenMod?: string

  constructor({
    computer,
    mod,
    userMod,
    tokenMod,
  }: {
    computer: Computer
    mod?: string
    userMod?: string
    tokenMod?: string
  }) {
    this.computer = computer
    this.mod = mod
    this.userMod = userMod
    this.tokenMod = tokenMod
  }

  static fromModSpecs(
    computer: Computer,
    mod?: string,
    userMod?: string,
    tokenMod?: string,
  ): ChessContractHelper {
    return new this({ computer, mod, userMod, tokenMod })
  }

  async validateUser(): Promise<void> {
    const [userRev] = await this.computer.getOUTXOs({
      mod: this.userMod,
      publicKey: this.computer.getPublicKey(),
    })
    if (!userRev) {
      throw new Error('Please create your account to start playing')
    }
  }

  async createGame(
    tokenRoot: string,
    wagerAmount: bigint,
  ): Promise<SmartContract<typeof ChessContract>> {
    await this.validateUser()
    const { tx, effect } = await this.computer.encode({
      exp: `new ChessContract('${tokenRoot}', ${wagerAmount}n)`,
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    return effect.res as SmartContract<typeof ChessContract>
  }

  async depositTokens(
    chessRev: string,
    tokenRev: string,
    wagerAmount: bigint,
    name: string,
    nextOwner: string,
  ): Promise<SmartContract<typeof ChessContract>> {
    const { tx, effect } = await this.computer.encode({
      exp: `chess.acceptDeposit(token, ${wagerAmount}n, '${name}', '${nextOwner}')`,
      env: { chess: chessRev, token: tokenRev },
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    return effect.env.chess as SmartContract<typeof ChessContract>
  }

  async findToken(
    tokenRoot: string,
    minAmount: bigint,
  ): Promise<{ _rev: string; _root: string; _id: string; amount: bigint } | null> {
    const tokenRevs = await this.computer.getOUTXOs({
      mod: this.tokenMod,
      publicKey: this.computer.getPublicKey(),
    })
    for (const rev of tokenRevs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (await this.computer.sync(rev)) as any
      if (token._root === tokenRoot && token.amount >= minAmount) {
        return token
      }
    }
    return null
  }

  async move(
    chessContract: SmartContract<typeof ChessContract>,
    from: string,
    to: string,
    promotion: string,
  ): Promise<{ newChessContract: SmartContract<typeof ChessContract>; isGameOver: boolean }> {
    if (chessContract && chessContract.sans.length < 2) {
      const [userRev] = await this.computer.getOUTXOs({
        mod: this.userMod,
        publicKey: this.computer.getPublicKey(),
      })
      if (userRev) {
        const userObj = await this.computer.sync<typeof User>(userRev)
        const gameId = chessContract._id
        if (!userObj.games.includes(gameId)) {
          await userObj.addGame(gameId)
        }
      }
    }

    const { tx, effect } = (await this.computer.encodeCall({
      target: chessContract,
      property: 'move',
      args: [from, to, promotion],
      mod: this.mod,
    })) as { tx: Transaction; effect: { res: boolean; env: unknown } }
    await this.computer.broadcast(tx)
    const { res: isGameOver, env } = effect
    const { __bc__: newChessContract } = env as { __bc__: SmartContract<typeof ChessContract> }
    return { newChessContract, isGameOver }
  }

  async withdrawTokens(tokenId: string, chessId: string): Promise<void> {
    const latestTokenRev = await this.computer.latest(tokenId)
    const token = await this.computer.sync(latestTokenRev)
    const latestChessRev = await this.computer.latest(chessId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (token as any).withdraw(latestChessRev)
  }
}
