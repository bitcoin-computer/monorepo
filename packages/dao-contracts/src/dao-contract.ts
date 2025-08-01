/* eslint-disable  @typescript-eslint/ban-ts-comment */
import { Buffer } from 'buffer'
import { Token } from '@bitcoin-computer/TBC20'
import { Contract } from '@bitcoin-computer/lib'

if (typeof global !== 'undefined') global.Buffer = Buffer

type ElectionType = {
  voteMod: string
  description: string
}

type VoteType = {
  electionId: string
  tokens: Token[]
  vote: 'accept' | 'reject'
}

export class Election extends Contract {
  voteMod!: string
  constructor({ voteMod, description }: ElectionType) {
    super({ voteMod, description })
  }

  intersect(a: string[], b: string[]): string[] {
    const set1 = new Set(a)
    const result: Set<string> = new Set()
  
    for (const item of b) {
      if (set1.has(item)) {
        result.add(item)
      }
    }
  
    return Array.from(result)
  }
  

  async acceptingVotes() {
    // @ts-ignore
    const revs = await computer.query({ mod: this.voteMod })
    // remove duplicated entries :> possible problem, if we transfer the token, we have
    // txId_A:0, txId_A:1, then we are skipping the tx with the new token?
    const voteTxIdsSet = new Set<string>(revs.map((r:string) => r.split(':')[0]))
    const voteTxIds= Array.from(voteTxIdsSet)
    const validVotes = voteTxIds
    for (const voteTxId of voteTxIds) {
      // @ts-ignore
      const ancestors = await computer.db.wallet.restClient.getAncestors(voteTxId)
      // id belongs to the ancestors, we should remove it before checking intersect
      const index = ancestors.indexOf(voteTxId)
      if (index !== -1) ancestors.splice(index, 1)

      const isInvalid = this.intersect(ancestors, voteTxIds).length > 0

      if (isInvalid) {
        const index = validVotes.indexOf(voteTxId);
        if (index !== -1) validVotes.splice(index, 1);
      }
    }
    // @ts-ignore
    const resolved = (await Promise.all(validVotes.map((txId) => computer.sync(txId)))).map( (obj) => obj.res)
    const acceptedVotes = [...resolved].filter((r: Vote) => r.vote === 'accept' && r.electionId === this._id)
    let count = 0n
    for (const v of acceptedVotes) {
      // sync to tokens
      // @ts-ignore
      const tokens = await Promise.all(v.tokenRevs.map((rev)=> computer.sync(rev)))
      count += tokens.reduce((acc: bigint, curr: Token) => acc + curr.amount, 0n)
    }
    return count
  }
}

export class Vote extends Contract {
  tokenRevs!: string[]
  vote!: 'accept' | 'reject'
  electionId!: string
  constructor({ electionId, tokens, vote }: VoteType) {
    super({ electionId, tokenRevs: tokens.map(t=>t._rev), vote })
  }
}

export default { Election, Vote}