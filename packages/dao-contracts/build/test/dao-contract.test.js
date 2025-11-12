import { Election, Vote } from '../src/dao-contract.js';
import { expect } from 'chai';
import { Computer } from '@bitcoin-computer/lib';
import { Token } from '@bitcoin-computer/TBC20';
const url = 'http://localhost:1031';
describe('Election', () => {
    const computer = new Computer({ url });
    beforeEach('Before', async () => {
        await computer.faucet(1e8);
    });
    describe('validVotes', () => {
        it('Should compute one valid vote', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            const vote = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const revs = await computer.getOUTXOs({ mod: proposalMod });
            expect(revs.length).greaterThan(0);
            await election.proposalVotes();
            const validVotes = await election.proposalVotes();
            expect(validVotes.length).eq(1);
            expect(validVotes[0]).eq(vote._rev.substring(0, 64));
        });
        it('Should compute the first vote if the token is used twice', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            const vote1 = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            // vote again with the token
            await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const validVotes = await election.proposalVotes();
            expect(validVotes.length).eq(1);
            expect(validVotes[0]).eq(vote1._rev.substring(0, 64));
        });
        it('Should compute the first vote and other valid ones', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(``);
            // send some tokens to someone else
            const computer2 = new Computer({ url });
            await computer2.faucet(1e8);
            // send some tokens to someone else
            const computer3 = new Computer({ url });
            await computer3.faucet(1e8);
            const t0 = await computer.new(Token, [computer.getPublicKey(), 100n, 'A'], tokenMod);
            const t1 = (await t0.transfer(computer.getPublicKey(), 10n));
            const t2 = (await t0.transfer(computer2.getPublicKey(), 7n));
            const t3 = (await t0.transfer(computer3.getPublicKey(), 20n));
            const t4 = (await t0.transfer(computer3.getPublicKey(), 3n));
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t0._root, description: 'test' },
            ]);
            const vote1 = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            expect(vote1.tokenRoot).eq(t1._root);
            // vote again with the token
            await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            // vote with the other tokens
            await computer2.new(Vote, [{ electionId: election._id, tokens: [t2], vote: 'accept' }], proposalMod);
            await computer3.new(Vote, [{ electionId: election._id, tokens: [t3, t4], vote: 'accept' }], proposalMod);
            const validVotes = await election.proposalVotes();
            expect(validVotes.length).eq(3);
            expect(validVotes).to.include(vote1._rev.substring(0, 64));
            expect(validVotes).to.include(t2._rev.substring(0, 64));
            expect(validVotes).to.include(t3._rev.substring(0, 64));
            expect(validVotes).to.include(t4._rev.substring(0, 64));
            const accepted = await election.accepted();
            expect(accepted).eq(40n);
        });
        it('Should compute the first vote if the token is sent and used to vote in the same election', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            const vote1 = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            // transfer the token
            const computer2 = new Computer({ url });
            const t2 = await t1.transfer(computer2.getPublicKey(), 2n);
            expect(t2?.amount).eq(2n);
            // vote again with the token
            await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const validVotes = await election.proposalVotes();
            expect(validVotes.length).eq(1);
            expect(validVotes[0]).eq(vote1._rev.substring(0, 64));
        });
        it('Should compute the valid votes using a transferred token in another election with different mod specifier', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod1 = await computer.deploy(`export ${Vote}`);
            const proposalMod2 = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election1 = await computer.new(Election, [
                { proposalMod: proposalMod1, tokenRoot: t1._root, description: 'election1' },
            ]);
            const vote1 = await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], proposalMod1);
            const revs1 = await computer.getTXOs({ mod: proposalMod1 });
            expect(revs1.length).eq(1);
            const validVotes1 = await election1.proposalVotes();
            expect(validVotes1.length).eq(1);
            expect(validVotes1[0]).eq(vote1._rev.substring(0, 64));
            // send some tokens to someone else
            const computer2 = new Computer({ url });
            await computer2.faucet(1e8);
            const t2 = (await t1.transfer(computer2.getPublicKey(), 2n));
            expect(t2?.amount).eq(2n);
            const election2 = await computer.new(Election, [
                { proposalMod: proposalMod2, tokenRoot: t1._root, description: 'election2' },
            ]);
            // vote in another election
            const vote2 = await computer2.new(Vote, [{ electionId: election2._id, tokens: [t2], vote: 'accept' }], proposalMod2);
            const revs2 = await computer.getTXOs({ mod: proposalMod2 });
            expect(revs2.length).eq(1);
            expect(revs2.includes(vote1._rev));
            const validVotes2 = await election2.proposalVotes();
            expect(validVotes2.length).eq(1);
            expect(validVotes2[0]).eq(vote2._rev.substring(0, 64));
        });
    });
    describe('accepted-rejected', () => {
        it('Should count to zero if the Vote is not deployed as a module', async () => {
            const invalidMod = '0f08b977b9be9d96b8b02dd0866e7a692bb1527277a746dc8a74adde724d7856:22';
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A']);
            const election = await computer.new(Election, [
                { proposalMod: invalidMod, tokenRoot: t1._root, description: 'test' },
            ]);
            await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }]);
            const accepted = await election.accepted();
            expect(accepted).eq(0n);
        });
        it('Should count if the Vote is deployed as a module', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const accepted = await election.accepted();
            expect(accepted).eq(10n);
        });
        it('Should be able to transfer tokens after voting with them', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const accepted = await election.accepted();
            expect(accepted).eq(10n);
            // send some tokens to someone else
            const computer2 = new Computer({ url });
            const tokenSent = await t1.transfer(computer2.getPublicKey(), 2n);
            expect(tokenSent?.amount).eq(2n);
            const updatedT1 = (await computer.sync(t1._rev));
            expect(updatedT1.amount).eq(8n);
        });
        it('Should not count token amounts if the same token is transfer and then used for voting', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            const vote1 = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const accepted = await election.accepted();
            expect(accepted).eq(10n);
            // send some tokens to someone else
            const computer2 = new Computer({ url });
            const tokenSent = await t1.transfer(computer2.getPublicKey(), 2n);
            expect(tokenSent?.amount).eq(2n);
            const updatedT1 = (await computer.sync(t1._rev));
            expect(updatedT1.amount).eq(8n);
            // Vote again
            await computer.new(Vote, [{ electionId: election._id, tokens: [updatedT1], vote: 'accept' }], proposalMod);
            const validVotes = await election.validRevVotes();
            expect(validVotes.length).eq(1);
            expect(validVotes[0]).eq(vote1._rev);
            const accepted2 = await election.accepted();
            expect(accepted2).eq(10n);
        });
        it('Should not count token amounts if the transferred token is used to vote in the same election', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            const vote = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            expect(vote._id.length > 0).to.eq(true);
            const accepted = await election.accepted();
            expect(accepted).eq(10n);
            // send some tokens to someone else
            const computer2 = new Computer({ url });
            await computer2.faucet(1e8);
            const newRev = await computer.latest(t1._rev);
            const t1Updated = (await computer.sync(newRev));
            const tokenSent = (await t1Updated.transfer(computer2.getPublicKey(), 2n));
            expect(tokenSent?.amount).eq(2n);
            const updatedT1 = (await computer.sync(t1._rev));
            expect(updatedT1.amount).eq(8n);
            // Vote again
            await computer2.new(Vote, [{ electionId: election._id, tokens: [tokenSent], vote: 'accept' }], proposalMod);
            const accepted2 = await election.accepted();
            expect(accepted2).eq(10n);
        });
        it('Should count token amounts if the transferred token is used to vote in a different election', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod1 = await computer.deploy(`export ${Vote}`);
            const proposalMod2 = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election1 = await computer.new(Election, [
                { proposalMod: proposalMod1, tokenRoot: t1._root, description: 'election1' },
            ]);
            await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], proposalMod1);
            const accepted = await election1.accepted();
            expect(accepted).eq(10n);
            // send some tokens to someone else
            const computer2 = new Computer({ url });
            await computer2.faucet(1e8);
            const t2 = (await t1.transfer(computer2.getPublicKey(), 2n));
            expect(t2?.amount).eq(2n);
            const updatedT1 = (await computer.sync(t1._rev));
            expect(updatedT1.amount).eq(8n);
            const election2 = await computer.new(Election, [
                { proposalMod: proposalMod2, tokenRoot: t2._root, description: 'election2' },
            ]);
            // vote in another election
            await computer2.new(Vote, [{ electionId: election2._id, tokens: [t2], vote: 'accept' }], proposalMod2);
            const acceptedElection1 = await election1.accepted();
            expect(acceptedElection1).eq(10n);
            const acceptedElection2 = await election2.accepted();
            expect(acceptedElection2).eq(2n);
        });
        it('Should not count token amounts if same token is used twice', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election1 = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'election1' },
            ]);
            await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const accepted = await election1.accepted();
            expect(accepted).eq(10n);
            // use the token again
            await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const accepted2 = await election1.accepted();
            expect(accepted2).eq(10n);
        });
        it('Should not count token amounts if the token is not from the same lineage', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const election1 = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'election1' },
            ]);
            await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const accepted = await election1.accepted();
            expect(accepted).eq(10n);
            // create a new token that is not from the same lineage
            const t2 = await computer.new(Token, [computer.getPublicKey(), 5n, 'A'], tokenMod);
            // use the new token to vote
            await computer.new(Vote, [{ electionId: election1._id, tokens: [t2], vote: 'accept' }], proposalMod);
            const votes = await election1.proposalVotes();
            expect(votes.length).eq(2);
            expect(votes).includes(t1._rev.substring(0, 64));
            expect(votes).includes(t2._rev.substring(0, 64));
            const accepted2 = await election1.accepted();
            expect(accepted2).eq(10n);
        });
        it('Should not be possible to use a non owned token to vote in an election', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            // another user syncs to the valid token revision and uses it to vote
            const computer2 = new Computer({ url });
            await computer2.faucet(1e8);
            const syncedT1 = (await computer2.sync(t1._rev));
            const election = await computer2.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            try {
                await computer2.new(Vote, [{ electionId: election._id, tokens: [syncedT1], vote: 'accept' }], proposalMod);
                expect(true).to.eq(false);
            }
            catch (error) {
                expect(error.message.includes('mandatory-script-verify-flag-failed')).eq(true);
            }
        });
        it('Should count number of accepted and rejected votes', async () => {
            const tokenMod = await computer.deploy(`export ${Token}`);
            const proposalMod = await computer.deploy(`export ${Vote}`);
            const computer2 = new Computer({ url });
            await computer2.faucet(1e8);
            const computer3 = new Computer({ url });
            await computer3.faucet(1e8);
            const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
            const t2 = (await t1.transfer(computer2.getPublicKey(), 5n));
            expect(t2?.amount).eq(5n);
            const t3 = (await t1.transfer(computer3.getPublicKey(), 1n));
            expect(t1.amount).eq(10n - (t2.amount + t3.amount));
            const election = await computer.new(Election, [
                { proposalMod, tokenRoot: t1._root, description: 'test' },
            ]);
            await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], proposalMod);
            const accepted = await election.accepted();
            expect(accepted).eq(t1.amount);
            await computer2.new(Vote, [{ electionId: election._id, tokens: [t2], vote: 'reject' }], proposalMod);
            const rejected = await election.rejected();
            expect(rejected).eq(t2.amount);
            await computer3.new(Vote, [{ electionId: election._id, tokens: [t3], vote: 'accept' }], proposalMod);
            const accepted2 = await election.accepted();
            expect(accepted2).eq(t1.amount + t3.amount);
            const rejected2 = await election.rejected();
            expect(rejected2).eq(t2.amount);
        });
    });
});
//# sourceMappingURL=dao-contract.test.js.map