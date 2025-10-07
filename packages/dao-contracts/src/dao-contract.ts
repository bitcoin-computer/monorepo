import { Token } from '@bitcoin-computer/TBC20'
import { Contract } from '@bitcoin-computer/lib'

type ElectionType = {
  proposalMod: string
  tokenRoot: string
  description: string
}

type VoteType = {
  electionId: string
  tokens: Token[]
  vote: 'accept' | 'reject'
}

export class Election extends Contract {
  proposalMod!: string
  tokenRoot!: string
  description!: string
  constructor({ proposalMod, tokenRoot, description }: ElectionType) {
    super({ proposalMod, tokenRoot, description })
  }

  async validVotes(): Promise<string[]> {
    const revs = await computer.getTXOs({ mod: this.proposalMod })
    const voteTxIdsSet = new Set<string>(revs.map((r) => r.split(':')[0]))
    const validVotes = new Set<string>(voteTxIdsSet)

    for (const voteTxId of voteTxIdsSet) {
      const ancestors = await computer.db.wallet.restClient.getAncestors(voteTxId)
      const ancestorsSet = new Set<string>(ancestors)
      ancestorsSet.delete(voteTxId)

      if ([...ancestorsSet].some(voteTxIdsSet.has, voteTxIdsSet)) {
        validVotes.delete(voteTxId)
      }
    }

    return Array.from(validVotes)
  }

  async acceptingVotes(): Promise<bigint> {
    const validVotes = await this.validVotes()

    const resolved = (await Promise.all(validVotes.map((txId) => computer.sync(txId)))).map(
      // @ts-expect-error type unknown
      (obj) => obj.res,
    )

    const acceptedVotes = [...resolved].filter(
      (r: Vote) =>
        r.vote === 'accept' && r.electionId === this._id && r.tokenRoot === this.tokenRoot,
    )

    const count = acceptedVotes.reduce((acc: bigint, curr: Vote) => acc + curr.tokensAmount, 0n)
    return count
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
      tokensAmount: tokens.reduce((acc: bigint, curr: Token) => acc + curr.amount, 0n),
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
