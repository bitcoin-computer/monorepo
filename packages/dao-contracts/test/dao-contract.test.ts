import { Election, Vote } from '../src/dao-contract.js'
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { Token } from '@bitcoin-computer/TBC20'
const url = 'http://localhost:1031'

function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

describe('Election', () => {
  const computer = new Computer({ url })

  beforeEach('Before', async () => {
    await computer.faucet(1e8)
  })

  describe('validVotes', () => {
    it('Should compute one valid vote', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])
      const vote = await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      await sleep(2000)
      const revs = await computer.query({ mod: proposalMod })
      expect(revs.length).greaterThan(0)
      await election.validVotes()

      const validVotes = await election.validVotes()
      expect(validVotes.length).eq(1)
      expect(validVotes[0]).eq(vote._rev.substring(0, 64))
    })

    it('Should compute the first vote if the token is used twice', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])
      const vote1 = await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      await sleep(2000)
      // vote again with the token
      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      const validVotes = await election.validVotes()
      expect(validVotes.length).eq(1)
      expect(validVotes[0]).eq(vote1._rev.substring(0, 64))
    })

    it('Should compute the first vote and other valid ones', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(``)

      // send some tokens to someone else
      const computer2 = new Computer({ url })
      await computer2.faucet(1e8)
      // send some tokens to someone else
      const computer3 = new Computer({ url })
      await computer3.faucet(1e8)

      const t0 = await computer.new(Token, [computer.getPublicKey(), 100n, 'A'], tokenMod)
      const t1 = (await t0.transfer(computer.getPublicKey(), 10n)) as Token
      const t2 = (await t0.transfer(computer2.getPublicKey(), 7n)) as Token
      const t3 = (await t0.transfer(computer3.getPublicKey(), 20n)) as Token
      const t4 = (await t0.transfer(computer3.getPublicKey(), 3n)) as Token

      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t0._root, description: 'test' },
      ])

      const vote1 = await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )
      expect(vote1.tokenRoot).eq(t1._root)

      await sleep(2000)
      // vote again with the token
      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      // vote with the other tokens
      await computer2.new(
        Vote,
        [{ electionId: election._id, tokens: [t2], vote: 'accept' }],
        proposalMod,
      )

      await computer3.new(
        Vote,
        [{ electionId: election._id, tokens: [t3, t4], vote: 'accept' }],
        proposalMod,
      )

      const validVotes = await election.validVotes()
      expect(validVotes.length).eq(3)
      expect(validVotes).to.include(vote1._rev.substring(0, 64))
      expect(validVotes).to.include(t2._rev.substring(0, 64))
      expect(validVotes).to.include(t3._rev.substring(0, 64))
      expect(validVotes).to.include(t4._rev.substring(0, 64))

      const acceptedCount = await election.acceptingVotes()
      expect(acceptedCount).eq(40n)
    })

    it('Should compute the first vote if the token is sent and used to vote in the same election', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])
      const vote1 = await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )
      // transfer the token
      const computer2 = new Computer({ url })
      const t2 = await t1.transfer(computer2.getPublicKey(), 2n)
      expect(t2?.amount).eq(2n)

      await sleep(2000)
      // vote again with the token
      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      const validVotes = await election.validVotes()
      expect(validVotes.length).eq(1)
      expect(validVotes[0]).eq(vote1._rev.substring(0, 64))
    })

    it('Should compute the valid votes using a transferred token in another election with different mod specifier', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod1 = await computer.deploy(`export ${Vote}`)
      const proposalMod2 = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election1 = await computer.new(Election, [
        { proposalMod: proposalMod1, tokenRoot: t1._root, description: 'election1' },
      ])

      const vote1 = await computer.new(
        Vote,
        [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
        proposalMod1, // use the module specifier to distinguish different elections
      )
      const revs1 = await computer.getTXOs({ mod: proposalMod1 })
      expect(revs1.length).eq(1)

      const validVotes1 = await election1.validVotes()
      expect(validVotes1.length).eq(1)
      expect(validVotes1[0]).eq(vote1._rev.substring(0, 64))

      // send some tokens to someone else
      const computer2 = new Computer({ url })
      await computer2.faucet(1e8)

      const t2 = (await t1.transfer(computer2.getPublicKey(), 2n)) as Token
      expect(t2?.amount).eq(2n)

      const election2 = await computer.new(Election, [
        { proposalMod: proposalMod2, tokenRoot: t1._root, description: 'election2' },
      ])

      // vote in another election
      const vote2 = await computer2.new(
        Vote,
        [{ electionId: election2._id, tokens: [t2], vote: 'accept' }],
        proposalMod2, // use a different module specifier to distinguish the second election
      )

      const revs2 = await computer.getTXOs({ mod: proposalMod2 })
      expect(revs2.length).eq(1)
      expect(revs2.includes(vote1._rev))

      const validVotes2 = await election2.validVotes()
      expect(validVotes2.length).eq(1)
      expect(validVotes2[0]).eq(vote2._rev.substring(0, 64))
    })
  })

  describe('acceptingVotes', () => {
    it('Should count to zero if the Vote is not deployed as a module', async () => {
      const invalidMod = '0f08b977b9be9d96b8b02dd0866e7a692bb1527277a746dc8a74adde724d7856:22'
      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'])
      const election = await computer.new(Election, [
        { proposalMod: invalidMod, tokenRoot: t1._root, description: 'test' },
      ])

      await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }])

      const accepted = await election.acceptingVotes()
      expect(accepted).eq(0n)
    })

    it('Should count if the Vote is deployed as a module', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])
      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      const accepted = await election.acceptingVotes()
      expect(accepted).eq(10n)
    })

    it('Should be able to transfer tokens after voting with them', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])

      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      const accepted = await election.acceptingVotes()
      expect(accepted).eq(10n)

      // send some tokens to someone else
      const computer2 = new Computer({ url })

      const tokenSent = await t1.transfer(computer2.getPublicKey(), 2n)
      expect(tokenSent?.amount).eq(2n)

      const updatedT1 = (await computer.sync(t1._rev)) as Token
      expect(updatedT1.amount).eq(8n)
    })

    it('Should not count token amounts if the same token is transfer and then used for voting', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])

      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      const accepted = await election.acceptingVotes()
      expect(accepted).eq(10n)

      // send some tokens to someone else
      const computer2 = new Computer({ url })
      const tokenSent = await t1.transfer(computer2.getPublicKey(), 2n)
      expect(tokenSent?.amount).eq(2n)

      const updatedT1 = (await computer.sync(t1._rev)) as Token
      expect(updatedT1.amount).eq(8n)

      // Vote again
      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [updatedT1], vote: 'accept' }],
        proposalMod,
      )

      const accepted2 = await election.acceptingVotes()
      expect(accepted2).eq(10n)
    })

    it('Should not count token amounts if the transferred token is used to vote in the same election', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)

      const election = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])

      const vote = await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )
      expect(vote._id.length > 0).to.eq(true)

      const accepted = await election.acceptingVotes()
      expect(accepted).eq(10n)

      // send some tokens to someone else
      const computer2 = new Computer({ url })
      await computer2.faucet(1e8)
      const newRev = await computer.latest(t1._rev)
      const t1Updated = (await computer.sync(newRev)) as Token

      const tokenSent = (await t1Updated.transfer(computer2.getPublicKey(), 2n)) as Token
      expect(tokenSent?.amount).eq(2n)

      const updatedT1 = (await computer.sync(t1._rev)) as Token
      expect(updatedT1.amount).eq(8n)

      // Vote again
      await computer2.new(
        Vote,
        [{ electionId: election._id, tokens: [tokenSent], vote: 'accept' }],
        proposalMod,
      )

      await sleep(2000)
      const accepted2 = await election.acceptingVotes()
      expect(accepted2).eq(10n)
    })

    it('Should count token amounts if the transferred token is used to vote in a different election', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod1 = await computer.deploy(`export ${Vote}`)
      const proposalMod2 = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election1 = await computer.new(Election, [
        { proposalMod: proposalMod1, tokenRoot: t1._root, description: 'election1' },
      ])

      await computer.new(
        Vote,
        [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
        proposalMod1,
      )
      const accepted = await election1.acceptingVotes()
      expect(accepted).eq(10n)

      // send some tokens to someone else
      const computer2 = new Computer({ url })
      await computer2.faucet(1e8)

      const t2 = (await t1.transfer(computer2.getPublicKey(), 2n)) as Token
      expect(t2?.amount).eq(2n)

      const updatedT1 = (await computer.sync(t1._rev)) as Token
      expect(updatedT1.amount).eq(8n)

      const election2 = await computer.new(Election, [
        { proposalMod: proposalMod2, tokenRoot: t2._root, description: 'election2' },
      ])

      // vote in another election
      await computer2.new(
        Vote,
        [{ electionId: election2._id, tokens: [t2], vote: 'accept' }],
        proposalMod2,
      )
      const acceptedElection1 = await election1.acceptingVotes()
      expect(acceptedElection1).eq(10n)

      const acceptedElection2 = await election2.acceptingVotes()
      expect(acceptedElection2).eq(2n)
    })

    it('Should not count token amounts if same token is used twice', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election1 = await computer.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'election1' },
      ])

      await computer.new(
        Vote,
        [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )
      const accepted = await election1.acceptingVotes()
      expect(accepted).eq(10n)

      // use the token again
      await computer.new(
        Vote,
        [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
        proposalMod,
      )

      const accepted2 = await election1.acceptingVotes()
      expect(accepted2).eq(10n)
    })

    it('Should not be possible to use a non owned token to vote in an election', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const proposalMod = await computer.deploy(`export ${Vote}`)
      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)

      // another user syncs to the valid token revision and uses it to vote
      const computer2 = new Computer({ url })
      await computer2.faucet(1e8)
      const syncedT1 = (await computer2.sync(t1._rev)) as Token

      const election = await computer2.new(Election, [
        { proposalMod, tokenRoot: t1._root, description: 'test' },
      ])

      try {
        await computer2.new(
          Vote,
          [{ electionId: election._id, tokens: [syncedT1], vote: 'accept' }],
          proposalMod,
        )
        expect(true).to.eq(false)
      } catch (error) {
        expect((error as Error).message.includes('mandatory-script-verify-flag-failed')).eq(true)
      }
    })
  })
})
