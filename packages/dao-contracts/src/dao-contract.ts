import { Token } from '@bitcoin-computer/TBC20'
import { SmartContract, Contract } from '@bitcoin-computer/lib'

type ElectionType = {
  proposalMod: string
  tokenRoot: string
  description: string
}

type VoteType = {
  electionId: string
  tokens: SmartContract<typeof Token>[]
  vote: 'accept' | 'reject'
}

export class Election extends Contract {
  proposalMod!: string
  tokenRoot!: string
  description!: string
  constructor({ proposalMod, tokenRoot, description }: ElectionType) {
    super({ proposalMod, tokenRoot, description })
  }

  private regexEscape(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  normalize(str: string): string {
    return str
      .replace(/\s+/g, '')
      .replace(/,([})])/g, '$1')
      .trim()
  }

  async proposalVotes(): Promise<string[]> {
    const revs = await computer.getTXOs({ mod: this.proposalMod })
    const voteTxIdsSet = new Set<string>(revs.map((r: string) => r.split(':')[0]))
    const validVotes = new Set<string>(voteTxIdsSet)

    for (const voteTxId of voteTxIdsSet) {
      const ancestors = (await computer.getAncestors(voteTxId)) as string[]
      const ancestorsSet = new Set<string>(ancestors)
      ancestorsSet.delete(voteTxId)

      if ([...ancestorsSet].some(voteTxIdsSet.has, voteTxIdsSet)) {
        validVotes.delete(voteTxId)
      }
    }

    return Array.from(validVotes)
  }

  private async validVotes(): Promise<Vote[]> {
    const proposalVotes = await this.proposalVotes()
    const resolved = (await Promise.all(proposalVotes.map((txId) => computer.sync(txId)))).map(
      (obj: { res: unknown }) => obj.res,
    ) as Vote[]

    const module = await computer.load(this.proposalMod)
    const voteClassStr = module['Vote'].toString()
    const normalizedClass = this.normalize(voteClassStr)

    const regex = new RegExp(
      '^' +
        this.regexEscape(normalizedClass) +
        "newVote\\({electionId:'" +
        this.regexEscape(this._id) +
        "',tokens:\\[(__bc\\d+__(?:,__bc\\d+__)*)\\],vote:'(accept|reject)'\\}\\)$",
    )

    const isValid = await Promise.all(
      resolved.map(async (r: Vote) => {
        const decoded = await computer.decode(r._rev.substring(0, 64))
        const normExp = this.normalize(decoded.exp)
        const match = regex.exec(normExp)
        if (!match) return false
        const tokensStr = match[1]
        const voteFromExp = match[2]
        if (voteFromExp !== r.vote) return false
        const tokenPlaceholders = tokensStr.split(',')
        const indices = tokenPlaceholders.map((ph) => {
          const m = ph.match(/^__bc(\d+)__$/)
          if (!m) return NaN
          return parseInt(m[1], 10)
        })
        if (indices.some(isNaN) || indices.length < 1) return false
        for (let i = 0; i < indices.length; i++) {
          if (indices[i] !== i) return false
        }
        return true
      }),
    )

    return resolved.filter(
      (r: Vote, i: number) =>
        r.electionId === this._id && r.tokenRoot === this.tokenRoot && isValid[i],
    )
  }

  async accepted(): Promise<bigint> {
    const votes = await this.validVotes()
    return votes
      .filter((v) => v.vote === 'accept')
      .reduce((acc, curr) => acc + curr.tokensAmount, 0n)
  }

  async rejected(): Promise<bigint> {
    const votes = await this.validVotes()
    return votes
      .filter((v) => v.vote === 'reject')
      .reduce((acc, curr) => acc + curr.tokensAmount, 0n)
  }
}

export class Vote extends Contract {
  tokensAmount!: bigint
  vote!: 'accept' | 'reject'
  electionId!: string
  tokenRoot!: string

  constructor({ electionId, tokens, vote }: VoteType) {
    super({
      electionId,
      tokensAmount: tokens.reduce(
        (acc: bigint, curr: SmartContract<typeof Token>) => acc + curr.amount,
        0n,
      ),
      vote,
      tokenRoot: tokens[0]._root,
    })
    // check that all tokens have the same root
    const tokenRoots = new Set(tokens.map((t) => t._root))
    if (tokenRoots.size > 1) {
      throw new Error('All tokens must have the same root')
    }
  }
}

export default { Election, Vote }
