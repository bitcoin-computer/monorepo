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
    it.only('Should compute one valid vote', async () => {
      const tokenMod = await computer.deploy(`export ${Token}`)
      const voteMod = await computer.deploy(`export ${Vote}`)

      const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
      const election = await computer.new(Election, [{ voteMod, description: 'test' }])
      console.log(`Election ${election._rev}`)
      await computer.new(
        Vote,
        [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
        voteMod,
      )

      await sleep(2000)
      const revs = await computer.query({ mod: voteMod })
      expect(revs.length).greaterThan(0)
      await election.validVotes(revs)

      // const validVotes = await election.validVotes(revs)
      // expect(validVotes.length).eq(1)
      // expect(validVotes[0]).eq(vote._rev.substring(0, 64))
    })

    //   it('Should compute the first vote if the token is used twice', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election = await computer.new(Election, [{ voteMod, description: 'test' }])
    //     const vote1 = await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )

    //     await sleep(2000)
    //     // vote again with the token
    //     await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )

    //     const revs = await computer.query({ mod: voteMod })
    //     const validVotes = await election.validVotes(revs)
    //     expect(validVotes.length).eq(1)
    //     expect(validVotes[0]).eq(vote1._rev.substring(0, 64))
    //   })

    //   it('Should compute the first vote if the token is sent and used to vote in the same election', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election = await computer.new(Election, [{ voteMod, description: 'test' }])
    //     const vote1 = await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )

    //     await sleep(2000)
    //     // vote again with the token
    //     await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )

    //     // transfer the token
    //     const computer2 = new Computer({ url })
    //     const t2 = await t1.transfer(computer2.getPublicKey(), 2n)
    //     expect(t2?.amount).eq(2n)

    //     const revs = await computer.query({ mod: voteMod })
    //     const validVotes = await election.validVotes(revs)
    //     expect(validVotes.length).eq(1)
    //     expect(validVotes[0]).eq(vote1._rev.substring(0, 64))
    //   })

    //   // TODO: fix this test when fixing module specifiers
    //   it.skip('Should compute the valid votes using a transferred token in another election', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)
    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election1 = await computer.new(Election, [{ voteMod, description: 'election1' }])

    //     const vote1 = await computer.new(
    //       Vote,
    //       [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )
    //     const revs1 = await computer.query({ mod: voteMod })
    //     // TODO: uncomment the following expect. Query is returning one extra revision with the voteMod
    //     // expect(revs1.length).eq(1)
    //     const validVotes1 = await election1.validVotes(revs1)
    //     expect(validVotes1.length).eq(1)
    //     expect(validVotes1[0]).eq(vote1._rev.substring(0, 64))

    //     // send some tokens to someone else
    //     const computer2 = new Computer({ url })
    //     await computer2.faucet(1e8)

    //     const t2 = await t1.transfer(computer2.getPublicKey(), 2n)
    //     expect(t2?.amount).eq(2n)

    //     const election2 = await computer.new(Election, [{ voteMod, description: 'election2' }])
    //     // vote in another election
    //     const vote2 = await computer2.new(
    //       Vote,
    //       [{ electionId: election2._id, tokens: [t2!], vote: 'accept' }],
    //       voteMod,
    //     )

    //     const revs2 = await computer.query({ mod: voteMod })
    //     // TODO: fix this. Query is returning 4 revisions. t1's and t2's mod specifier have been updated when deploying the Vote
    //     expect(revs2.length).eq(2)
    //     expect(revs2.includes(vote1._rev))
    //     expect(revs2.includes(vote2._rev))
    //     const validVotes2 = await election2.validVotes(revs2)
    //     expect(validVotes2.length).eq(1)
    //     expect(validVotes2[0]).eq(vote2._rev.substring(0, 64))
    //   })
    // })

    // describe('acceptingVotes', () => {
    //   it('Should count to zero if the Vote is not deployed as a module', async () => {
    //     const election = await computer.new(Election, [{ voteMod: 'a', description: 'test' }])

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'])

    //     await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }])

    //     const accepted = await election.acceptingVotes()
    //     expect(accepted).eq(0n)
    //   })

    //   it('Should count if the Vote is deployed as a module', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election = await computer.new(Election, [{ voteMod, description: 'test' }])
    //     await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )

    //     const accepted = await election.acceptingVotes()
    //     expect(accepted).eq(10n)
    //   })

    //   it('Should be able to transfer tokens after voting with them', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election = await computer.new(Election, [{ voteMod, description: 'test' }])

    //     await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )

    //     const accepted = await election.acceptingVotes()
    //     expect(accepted).eq(10n)

    //     // send some tokens to someone else
    //     const computer2 = new Computer({ url })

    //     const tokenSent = await t1.transfer(computer2.getPublicKey(), 2n)
    //     expect(tokenSent?.amount).eq(2n)

    //     const updatedT1 = (await computer.sync(t1._rev)) as Token
    //     expect(updatedT1.amount).eq(8n)
    //   })

    //   it('Should not count token amounts if the same token is transfer and then used for voting', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election = await computer.new(Election, [{ voteMod, description: 'test' }])

    //     await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )

    //     const accepted = await election.acceptingVotes()
    //     expect(accepted).eq(10n)

    //     // send some tokens to someone else
    //     const computer2 = new Computer({ url })
    //     const tokenSent = await t1.transfer(computer2.getPublicKey(), 2n)
    //     expect(tokenSent?.amount).eq(2n)

    //     const updatedT1 = (await computer.sync(t1._rev)) as Token
    //     expect(updatedT1.amount).eq(8n)

    //     // Vote again
    //     const vote2 = await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [updatedT1], vote: 'accept' }],
    //       voteMod,
    //     )
    //     expect(typeof vote2._id).eq('string')

    //     const accepted2 = await election.acceptingVotes()
    //     expect(accepted2).eq(10n)
    //   })

    //   it('Should not count token amounts if the transferred token is used to vote in the same election', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     expect(typeof tokenMod).eq('string')

    //     const voteMod = await computer.deploy(`export ${Vote}`)
    //     expect(typeof voteMod).eq('string')

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     expect(typeof t1._id).eq('string')

    //     const election = await computer.new(Election, [{ voteMod, description: 'test' }])
    //     expect(typeof election._id).eq('string')

    //     const vote = await computer.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )
    //     expect(typeof vote._id).eq('string')

    //     const accepted = await election.acceptingVotes()
    //     expect(accepted).eq(10n)

    //     // send some tokens to someone else
    //     const computer2 = new Computer({ url })
    //     await computer2.faucet(1e8)
    //     const [newRev] = await computer.query({ ids: [t1._id] })
    //     const t1Updated = await computer.sync(newRev)

    //     // @ts-ignore
    //     const tokenSent = await t1Updated.transfer(computer2.getPublicKey(), 2n)
    //     expect(tokenSent?.amount).eq(2n)

    //     const updatedT1 = (await computer.sync(t1._rev)) as Token
    //     expect(updatedT1.amount).eq(8n)

    //     // Vote again
    //     const vote2 = await computer2.new(
    //       Vote,
    //       [{ electionId: election._id, tokens: [tokenSent], vote: 'accept' }],
    //       voteMod,
    //     )
    //     expect(typeof vote2._id).eq('string')
    //     await sleep(2000)
    //     const accepted2 = await election.acceptingVotes()
    //     expect(accepted2).eq(10n)
    //   })

    //   // TODO: fix this test when fixing module specifiers issue
    //   it.skip('Should count token amounts if the transferred token is used to vote in a different election', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election1 = await computer.new(Election, [{ voteMod, description: 'election1' }])

    //     await computer.new(
    //       Vote,
    //       [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )
    //     const accepted = await election1.acceptingVotes()
    //     expect(accepted).eq(10n)

    //     // send some tokens to someone else
    //     const computer2 = new Computer({ url })
    //     await computer2.faucet(1e8)

    //     const t2 = await t1.transfer(computer2.getPublicKey(), 2n)
    //     expect(t2?.amount).eq(2n)

    //     const updatedT1 = (await computer.sync(t1._rev)) as Token
    //     expect(updatedT1.amount).eq(8n)

    //     const election2 = await computer.new(Election, [{ voteMod, description: 'election2' }])
    //     expect(typeof election2._id).eq('string')

    //     // vote in another election
    //     await computer2.new(
    //       Vote,
    //       [{ electionId: election2._id, tokens: [t2!], vote: 'accept' }],
    //       voteMod,
    //     )
    //     const acceptedElection1 = await election1.acceptingVotes()
    //     expect(acceptedElection1).eq(10n)

    //     const acceptedElection2 = await election2.acceptingVotes()
    //     expect(acceptedElection2).eq(2n)
    //   })

    //   it('Should not count token amounts if same token is used twice', async () => {
    //     const tokenMod = await computer.deploy(`export ${Token}`)
    //     const voteMod = await computer.deploy(`export ${Vote}`)

    //     const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod)
    //     const election1 = await computer.new(Election, [{ voteMod, description: 'election1' }])

    //     await computer.new(
    //       Vote,
    //       [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )
    //     const accepted = await election1.acceptingVotes()
    //     expect(accepted).eq(10n)

    //     // use the token again
    //     const vote2 = await computer.new(
    //       Vote,
    //       [{ electionId: election1._id, tokens: [t1], vote: 'accept' }],
    //       voteMod,
    //     )
    //     expect(typeof vote2._id).eq('string')

    //     const accepted2 = await election1.acceptingVotes()
    //     expect(accepted2).eq(10n)
    //   })
  })
})
