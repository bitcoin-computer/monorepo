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
  /** Required by TBC777 `Escrow` interface (chess uses `withdraws` only). */
  finalWithdraws!: [string, string, bigint][]
  root!: string
  tokenIdW!: string
  tokenIdB!: string
  /** Public key of the player who created the game (white / first depositor). */
  creatorPublicKey!: string
  /** Set when a canceled pending game has been acknowledged (clears list badge). */
  canceledSeen!: boolean

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
      creatorPublicKey: '',
      canceledSeen: false,
    })
  }

  setCanceledSeen() {
    this.canceledSeen = true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async acceptDeposit(token: any, amount: bigint, name: string, nextOwner: string) {
    if (amount !== this.wagerAmount) throw new Error('Deposit amount must match wager')
    const tokenRoot = token.root ?? token._root
    if (tokenRoot !== this.root) throw new Error('Token root does not match wager')
    token.deposit(this._id, amount)
    this.deposits.push(token.depositTuple)
    const tokenOwner = Array.isArray(token._owners) ? token._owners[0] : token._owners
    if (!this.publicKeyB) {
      const gameOwner = Array.isArray(this._owners) ? this._owners[0] : this._owners
      if (tokenOwner !== gameOwner) {
        throw new Error('Deposit token must belong to the game creator')
      }
      this.creatorPublicKey = gameOwner
      this.tokenIdW = token._id
      this.nameW = name
      this.publicKeyB = nextOwner
      // Both players can sign while the game is pending: black accepts alone,
      // white can cancel alone. Do not set withdraws here — TBC777 sums every
      // historical withdraw entry, so a pending refund must be authorized in cancel().
      this._owners = [gameOwner, nextOwner]
    } else if (!this.publicKeyW) {
      if (tokenOwner !== this.publicKeyB) {
        throw new Error('Only the invited opponent can accept the game')
      }
      if (nextOwner !== this.creatorPublicKey) {
        throw new Error('Opponent must set the creator as the white player')
      }
      this.withdraws = []
      this.finalWithdraws = []
      this.tokenIdB = token._id
      this.nameB = name
      this.publicKeyW = nextOwner
      this._owners = [nextOwner]
    } else {
      throw new Error('Game is already fully funded')
    }
  }

  /**
   * Cancel a pending game before the opponent deposits. Refunds are authorized
   * via `withdraws` set in this method; the creator then claims with `withdrawTokens`.
   */
  cancel() {
    if (this.publicKeyW) throw new Error('Game started use resign to forfeit')
    if (this.deposits.length !== 1) throw new Error('Cannot cancel: invalid deposit state')
    if (!this.tokenIdW) throw new Error('Cannot cancel: no deposit to refund')
    if (!this.creatorPublicKey) throw new Error('Cannot cancel: creator not set')
    if (this.withdraws.length === 0) {
      this.withdraws = [[this.root, this.tokenIdW, this.wagerAmount]]
    }
    this.canceledSeen = true
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

    if (chessLib.isGameOver()) {
      // Settle the pot atomically with the winning move so the winner does not
      // need a separate "claim" transaction before they can withdraw.
      if (chessLib.isCheckmate()) {
        // The player who just moved is the winner.
        const winnerId = this._owners[0] === this.publicKeyW ? this.tokenIdW : this.tokenIdB
        this.withdraws = [[this.root, winnerId, 2n * this.wagerAmount]]
      } else {
        // Draw / stalemate / threefold / 50-move rule: each side gets its wager back.
        this.withdraws = [
          [this.root, this.tokenIdW, this.wagerAmount],
          [this.root, this.tokenIdB, this.wagerAmount],
        ]
      }
    } else {
      this._owners = [this._owners[0] === this.publicKeyW ? this.publicKeyB : this.publicKeyW]
    }

    return chessLib.isGameOver()
  }

  resign() {
    if (!this.publicKeyW || !this.publicKeyB) {
      throw new Error('Game not yet started')
    }
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
      // @ts-expect-error Cannot find name 'computer'. Did you mean 'Computer'?
      timestamps.push(await computer.txIdToBlockTime(txId))
      // @ts-expect-error Cannot find name 'computer'. Did you mean 'Computer'?
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
    timeLimit = 600n,
  ): Promise<SmartContract<typeof ChessContract>> {
    await this.validateUser()
    const { tx, effect } = await this.computer.encode({
      exp: `new ChessContract('${tokenRoot}', ${wagerAmount}n, ${timeLimit}n)`,
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    return effect.res as SmartContract<typeof ChessContract>
  }

  /**
   * Deposits wager tokens into a chess game. After the creator's first deposit
   * the invited opponent owns the contract and can accept without a co-sign.
   */
  async depositTokens(
    chessRev: string,
    tokenRev: string,
    wagerAmount: bigint,
    name: string,
    nextOwner: string,
    coSignComputer?: Computer,
  ): Promise<SmartContract<typeof ChessContract>> {
    const { tx, effect } = await this.computer.encode({
      exp: `chess.acceptDeposit(token, ${wagerAmount}n, '${name}', '${nextOwner}')`,
      env: { chess: chessRev, token: tokenRev },
      mod: this.mod,
    })
    if (coSignComputer) {
      await coSignComputer.sign(tx)
    }
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
    const latestChessRev = await this.computer.latest(chessId)
    if (!this.tokenMod) {
      throw new Error('tokenMod is required for TBC777 withdraw')
    }
    const { tx } = await this.computer.encode({
      exp: `token.withdraw('${latestChessRev}')`,
      env: { token: latestTokenRev },
      mod: this.tokenMod,
    })
    await this.computer.broadcast(tx)
  }

  /**
   * Finds any token owned by the current user with at least minAmount balance.
   * Used when creating a new game to auto-detect which token to wager.
   */
  async findAnyToken(
    minAmount: bigint,
  ): Promise<{ _rev: string; _root: string; _id: string; amount: bigint } | null> {
    const tokenRevs = await this.computer.getOUTXOs({
      mod: this.tokenMod,
      publicKey: this.computer.getPublicKey(),
    })
    for (const rev of tokenRevs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (await this.computer.sync(rev)) as any
      if (token.amount >= minAmount) {
        return token
      }
    }
    return null
  }

  /** True when both players have deposited and the game is playable. */
  isGameStarted(chess: SmartContract<typeof ChessContract>): boolean {
    return !!chess.publicKeyW && !!chess.publicKeyB
  }

  /** True when the creator canceled before the opponent deposited (refund claimed). */
  async isPendingGameCanceled(chess: SmartContract<typeof ChessContract>): Promise<boolean> {
    if (chess.publicKeyW || !chess.tokenIdW || chess.deposits.length !== 1) return false
    try {
      const latestChessRev = await this.computer.latest(chess._id)
      const latestTokenRev = await this.computer.latest(chess.tokenIdW)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (await this.computer.sync(latestTokenRev)) as any
      const withdrawn: string[] = token.withdrawn ?? []
      return withdrawn.includes(latestChessRev)
    } catch {
      return false
    }
  }

  /** True when waiting for the opponent's deposit (creator may cancel). */
  canCancel(chess: SmartContract<typeof ChessContract>): boolean {
    return (
      !!chess.creatorPublicKey &&
      !!chess.publicKeyB &&
      !chess.publicKeyW &&
      chess.deposits.length === 1 &&
      chess.withdraws.length === 0 &&
      chess.finalWithdraws.length === 0
    )
  }

  isCreator(chess: SmartContract<typeof ChessContract>): boolean {
    return chess.creatorPublicKey === this.computer.getPublicKey()
  }

  /**
   * Cancel a pending game before the opponent deposits. Sets `withdraws` on-chain
   * so the creator can claim their deposit with `withdrawTokens`.
   */
  async cancelGame(chessId: string): Promise<SmartContract<typeof ChessContract>> {
    const latestRev = await this.computer.latest(chessId)
    const chess = await this.computer.sync<typeof ChessContract>(latestRev)
    if (!this.canCancel(chess)) {
      throw new Error('Cannot cancel: game is not in a cancelable state')
    }
    if (!this.isCreator(chess)) {
      throw new Error('Cannot cancel: only the game creator can cancel')
    }
    if (await this.isPendingGameCanceled(chess)) {
      throw new Error('Cannot cancel: wager already refunded')
    }
    const { tx, effect } = await this.computer.encodeCall({
      target: chess,
      property: 'cancel',
      args: [],
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (effect as any).env.__bc__ as SmartContract<typeof ChessContract>
  }

  /** Cancel a pending game and withdraw the creator's wager in one flow. */
  async cancelGameAndWithdraw(chessId: string): Promise<void> {
    const chess = await this.cancelGame(chessId)
    await this.withdrawTokens(chess.tokenIdW, chessId)
  }

  /** Mark a canceled pending game as seen by the invited opponent (clears list badge). */
  async markCanceledSeen(chessId: string): Promise<SmartContract<typeof ChessContract>> {
    const latestRev = await this.computer.latest(chessId)
    const chess = await this.computer.sync<typeof ChessContract>(latestRev)
    if (chess.canceledSeen) return chess
    if (chess.publicKeyB !== this.computer.getPublicKey()) {
      throw new Error('Only the invited opponent can acknowledge a canceled game')
    }
    const { tx, effect } = await this.computer.encodeCall({
      target: chess,
      property: 'setCanceledSeen',
      args: [],
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (effect as any).env.__bc__ as SmartContract<typeof ChessContract>
  }

  /**
   * Resigns from the current game. Sets the withdraws array so the opponent
   * (winner) can call withdrawTokens. Can only be called by the current
   * contract owner (the player whose turn it is).
   */
  async resign(chessId: string): Promise<SmartContract<typeof ChessContract>> {
    const latestRev = await this.computer.latest(chessId)
    const chess = await this.computer.sync<typeof ChessContract>(latestRev)
    const { tx, effect } = await this.computer.encodeCall({
      target: chess,
      property: 'resign',
      args: [],
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (effect as any).env.__bc__ as SmartContract<typeof ChessContract>
  }
}
