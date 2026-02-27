import { Computer } from '@bitcoin-computer/lib'
import * as crypto from 'crypto'
import { Pow } from './pow.js'

export interface IPowTokenMiner {
  computePrevMintedTokenId(): Promise<string>
  computeDifficulty(): Promise<number>
  computePow(prevMintedId: string, difficulty: number): Promise<{ nonce: string; amount: bigint }>
}

export class PowTokenMiner implements IPowTokenMiner {
  private computer: Computer
  private mod: string // deployed module id of Pow
  private cachedPrev: string = ''
  private cachedDifficulty: number = 16 // initial

  constructor(computer: Computer, mod: string) {
    this.computer = computer
    this.mod = mod
  }

  /** Returns the _rev of the current tip of the longest valid chain (or '' for genesis) */
  async computePrevMintedTokenId(): Promise<string> {
    const revs = await this.computer.getOUTXOs({ mod: this.mod })
    if (revs.length === 0) return ''

    const graph = new Map<string, { prev: string; diff: number }>()

    for (const rev of revs) {
      const obj = (await this.computer.sync(rev)) as Pow
      if (!Pow.isValidPow(obj.nonce, obj.prevMintedId, obj.difficulty)) continue

      graph.set(rev, { prev: obj.prevMintedId || '', diff: obj.difficulty })
    }

    // Find true tips: objects not used as prev by anyone
    const allPrev = new Set(
      Array.from(graph.values())
        .map((v) => v.prev)
        .filter(Boolean),
    )
    const tips = Array.from(graph.keys()).filter((r) => !allPrev.has(r))

    if (tips.length === 0) return ''

    // Heaviest chain: sum of work (2^diff), tie-break by length
    let bestTip = tips[0]
    let maxWork = this.getCumulativeWork(bestTip, graph)

    for (const tip of tips) {
      const work = this.getCumulativeWork(tip, graph)
      if (
        work > maxWork ||
        (work === maxWork && this.getChainLength(tip, graph) > this.getChainLength(bestTip, graph))
      ) {
        maxWork = work
        bestTip = tip
      }
    }

    this.cachedPrev = bestTip
    return bestTip
  }

  private getCumulativeWork(
    rev: string,
    graph: Map<string, { prev: string; diff: number }>,
  ): bigint {
    let total = 0n
    let current = rev
    while (current) {
      total += 1n << BigInt(graph.get(current)!.diff)
      current = graph.get(current)!.prev
    }
    return total
  }

  private getChainLength(rev: string, graph: Map<string, { prev: string; diff: number }>): number {
    let len = 0
    let current = rev
    while (current) {
      len++
      current = graph.get(current)!.prev
    }
    return len
  }

  /** Difficulty adjustment based on length of longest valid chain (every 2016 mints +1) */
  async computeDifficulty(): Promise<number> {
    const prev = await this.computePrevMintedTokenId() // ensures we have latest chain
    if (!prev) return 16 // genesis

    // count length of longest chain (we already did most of the work above)
    const revs = await this.computer.getOUTXOs({ mod: this.mod })
    const graph = new Map<string, string>()
    let maxLength = 0

    for (const rev of revs) {
      const obj = (await this.computer.sync(rev)) as Pow
      if (!Pow.isValidPow(obj.nonce, obj.prevMintedId, obj.difficulty)) continue
      graph.set(rev, obj.prevMintedId)

      let len = 0
      let current = rev
      while (current) {
        len++
        current = graph.get(current) || ''
      }
      if (len > maxLength) maxLength = len
    }

    // Bitcoin-style: increase difficulty every 2016 mints on the longest chain
    const initial = 16
    const interval = 2016
    return initial + Math.floor((maxLength - 1) / interval)
  }

  /** Pure mining loop – exactly like Bitcoin miner hot path */
  async computePow(
    prevMintedId: string,
    difficulty: number,
  ): Promise<{ nonce: string; amount: bigint }> {
    let nonce = 0
    const start = Date.now()

    while (true) {
      const puzzle = prevMintedId + nonce.toString() + difficulty.toString()
      const hashHex = crypto.createHash('sha256').update(puzzle).digest('hex')

      if (hashHex.startsWith('0'.repeat(Math.floor(difficulty / 4)))) {
        console.log(
          `SUCCESS: PoW solved in ${Date.now() - start}ms (diff=${difficulty}, nonce=${nonce})`,
        )
        return { nonce: nonce.toString(), amount: 1n }
      }
      nonce++
      if (nonce % 100000 === 0) await new Promise((r) => setTimeout(r, 0))
    }
  }

  /** Keep cache fresh */
  async refreshCache() {
    this.cachedPrev = await this.computePrevMintedTokenId()
    this.cachedDifficulty = await this.computeDifficulty()
  }
}
