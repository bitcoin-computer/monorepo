import { Computer } from '@bitcoin-computer/lib'
import * as crypto from 'crypto'
import { Pow } from './pow.js'
import { config } from './config.js' // NEW: import config

export interface IPowTokenMiner {
  computePrevMintedTokenId(): Promise<string>
  computeDifficulty(): Promise<number>
  computePow(prevMintedId: string, difficulty: number): Promise<{ nonce: string; amount: bigint }>
}

export class PowTokenMiner implements IPowTokenMiner {
  private computer: Computer
  private mod: string
  private cachedPrev: string = ''
  private cachedDifficulty: number = config.getInitialDifficulty() // Use config

  constructor(computer: Computer, mod: string) {
    this.computer = computer
    this.mod = mod
  }

  async computePrevMintedTokenId(): Promise<string> {
    const revs = await this.computer.getOUTXOs({ mod: this.mod })
    if (revs.length === 0) return ''

    const graph = new Map<string, { prev: string; diff: number }>()

    for (const rev of revs) {
      const obj = (await this.computer.sync(rev)) as Pow
      if (!Pow.isValidPow(obj.nonce, obj.prevMintedId, obj.difficulty)) continue

      graph.set(rev, { prev: obj.prevMintedId || '', diff: obj.difficulty })
    }

    const allPrev = new Set(
      Array.from(graph.values())
        .map((v) => v.prev)
        .filter(Boolean),
    )
    const tips = Array.from(graph.keys()).filter((r) => !allPrev.has(r))

    if (tips.length === 0) return ''

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

  async computeDifficulty(): Promise<number> {
    const prev = await this.computePrevMintedTokenId()
    if (!prev) return config.getInitialDifficulty() // NEW: chain-aware

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

    const initial = config.getInitialDifficulty()
    const interval = config.getAdjustmentInterval() // NEW: from config, chain-specific
    return initial + Math.floor((maxLength - 1) / interval)
  }

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

  async refreshCache() {
    this.cachedPrev = await this.computePrevMintedTokenId()
    this.cachedDifficulty = await this.computeDifficulty()
  }
}
