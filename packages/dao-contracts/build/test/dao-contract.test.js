/* eslint-disable @typescript-eslint/ban-ts-comment*/
import { Election, Vote } from '../src/dao-contract.js';
import { expect } from 'chai';
import { Computer } from '@bitcoin-computer/lib';
import { Token } from '@bitcoin-computer/TBC20';
const url = 'http://localhost:1031';
function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
describe('Should create an Election object', () => {
    const computer = new Computer({ url });
    beforeEach('Before', async () => {
        await computer.faucet(1e8);
    });
    it('Should count to zero if the Vote is not deployed as a module', async () => {
        const election = await computer.new(Election, [{ voteMod: 'a', description: 'test' }]);
        expect(typeof election._id).eq('string');
        const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A']);
        expect(typeof t1._id).eq('string');
        const vote = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }]);
        expect(typeof vote._id).eq('string');
        const accepted = await election.acceptingVotes();
        expect(accepted).eq(0n);
    });
    it('Should count if the Vote is deployed as a module', async () => {
        const tokenMod = await computer.deploy(`export ${Token}`);
        expect(typeof tokenMod).eq('string');
        const voteMod = await computer.deploy(`export ${Vote}`);
        expect(typeof voteMod).eq('string');
        const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
        expect(typeof t1._id).eq('string');
        const election = await computer.new(Election, [{ voteMod, description: 'test' }]);
        expect(typeof election._id).eq('string');
        const vote = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], voteMod);
        expect(typeof vote._id).eq('string');
        const accepted = await election.acceptingVotes();
        expect(accepted).eq(10n);
    });
    it('Should be able to transfer tokens after voting with them', async () => {
        const tokenMod = await computer.deploy(`export ${Token}`);
        expect(typeof tokenMod).eq('string');
        const voteMod = await computer.deploy(`export ${Vote}`);
        expect(typeof voteMod).eq('string');
        const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
        expect(typeof t1._id).eq('string');
        const election = await computer.new(Election, [{ voteMod, description: 'test' }]);
        expect(typeof election._id).eq('string');
        const vote = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], voteMod);
        expect(typeof vote._id).eq('string');
        const accepted = await election.acceptingVotes();
        expect(accepted).eq(10n);
        // send some tokens to someone else
        const computer2 = new Computer({ url });
        const [newRev] = await computer.query({ ids: [t1._id] });
        const t1Updated = await computer.sync(newRev);
        // @ts-ignore
        const tokenSent = await t1Updated.transfer(computer2.getPublicKey(), 2n);
        expect(tokenSent?.amount).eq(2n);
        const updatedT1 = await computer.sync(t1._rev);
        // @ts-ignore
        expect(updatedT1.amount).eq(8n);
    });
    it('Should not count token amounts if the same token is transfer and then used for voting', async () => {
        const tokenMod = await computer.deploy(`export ${Token}`);
        expect(typeof tokenMod).eq('string');
        const voteMod = await computer.deploy(`export ${Vote}`);
        expect(typeof voteMod).eq('string');
        const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
        expect(typeof t1._id).eq('string');
        const election = await computer.new(Election, [{ voteMod, description: 'test' }]);
        expect(typeof election._id).eq('string');
        const vote = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], voteMod);
        expect(typeof vote._id).eq('string');
        const accepted = await election.acceptingVotes();
        expect(accepted).eq(10n);
        // send some tokens to someone else
        const computer2 = new Computer({ url });
        const [newRev] = await computer.query({ ids: [t1._id] });
        const t1Updated = await computer.sync(newRev);
        // @ts-ignore
        const tokenSent = await t1Updated.transfer(computer2.getPublicKey(), 2n);
        expect(tokenSent?.amount).eq(2n);
        const updatedT1 = await computer.sync(t1._rev);
        expect(updatedT1.amount).eq(8n);
        // Vote again
        const vote2 = await computer.new(Vote, [{ electionId: election._id, tokens: [updatedT1], vote: 'accept' }], voteMod);
        expect(typeof vote2._id).eq('string');
        const accepted2 = await election.acceptingVotes();
        expect(accepted2).eq(10n);
    });
    it('Should not count token amounts if the transferred token is used to vote in the same election', async () => {
        const tokenMod = await computer.deploy(`export ${Token}`);
        expect(typeof tokenMod).eq('string');
        const voteMod = await computer.deploy(`export ${Vote}`);
        expect(typeof voteMod).eq('string');
        const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
        expect(typeof t1._id).eq('string');
        const election = await computer.new(Election, [{ voteMod, description: 'test' }]);
        expect(typeof election._id).eq('string');
        const vote = await computer.new(Vote, [{ electionId: election._id, tokens: [t1], vote: 'accept' }], voteMod);
        expect(typeof vote._id).eq('string');
        const accepted = await election.acceptingVotes();
        expect(accepted).eq(10n);
        // send some tokens to someone else
        const computer2 = new Computer({ url });
        await computer2.faucet(1e8);
        const [newRev] = await computer.query({ ids: [t1._id] });
        const t1Updated = await computer.sync(newRev);
        // @ts-ignore
        const tokenSent = await t1Updated.transfer(computer2.getPublicKey(), 2n);
        expect(tokenSent?.amount).eq(2n);
        const updatedT1 = await computer.sync(t1._rev);
        expect(updatedT1.amount).eq(8n);
        // Vote again
        const vote2 = await computer2.new(Vote, [{ electionId: election._id, tokens: [tokenSent], vote: 'accept' }], voteMod);
        expect(typeof vote2._id).eq('string');
        const accepted2 = await election.acceptingVotes();
        expect(accepted2).eq(10n);
    });
    it.skip('Should count token amounts if the transferred token is used to vote in a different election', async () => {
        const tokenMod = await computer.deploy(`export ${Token}`);
        expect(typeof tokenMod).eq('string');
        const voteMod = await computer.deploy(`export ${Vote}`);
        expect(typeof voteMod).eq('string');
        const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
        expect(typeof t1._id).eq('string');
        console.log(`t1._id: ${t1._id}`);
        const election1 = await computer.new(Election, [{ voteMod, description: 'election1' }]);
        expect(typeof election1._id).eq('string');
        const vote = await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], voteMod);
        expect(typeof vote._id).eq('string');
        const accepted = await election1.acceptingVotes();
        expect(accepted).eq(10n);
        // send some tokens to someone else
        const computer2 = new Computer({ url });
        await computer2.faucet(1e8);
        const [newRev] = await computer.query({ ids: [t1._id] });
        const t1Updated = await computer.sync(newRev);
        // @ts-ignore
        const tokenSent = await t1Updated.transfer(computer2.getPublicKey(), 2n);
        expect(tokenSent?.amount).eq(2n);
        const updatedT1 = await computer.sync(t1._rev);
        expect(updatedT1.amount).eq(8n);
        const election2 = await computer.new(Election, [{ voteMod, description: 'election2' }]);
        expect(typeof election2._id).eq('string');
        // vote in another election
        const vote2 = await computer2.new(Vote, [{ electionId: election2._id, tokens: [tokenSent], vote: 'accept' }], voteMod);
        expect(typeof vote2._id).eq('string');
        const acceptedElection1 = await election1.acceptingVotes();
        expect(acceptedElection1).eq(10n);
        await sleep(4000);
        const acceptedElection2 = await election2.acceptingVotes();
        expect(acceptedElection2).eq(2n);
    });
    it('Should not count token amounts if same token is used twice', async () => {
        const tokenMod = await computer.deploy(`export ${Token}`);
        expect(typeof tokenMod).eq('string');
        const voteMod = await computer.deploy(`export ${Vote}`);
        expect(typeof voteMod).eq('string');
        const t1 = await computer.new(Token, [computer.getPublicKey(), 10n, 'A'], tokenMod);
        expect(typeof t1._id).eq('string');
        const election1 = await computer.new(Election, [{ voteMod, description: 'election1' }]);
        expect(typeof election1._id).eq('string');
        const vote = await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], voteMod);
        expect(typeof vote._id).eq('string');
        const accepted = await election1.acceptingVotes();
        expect(accepted).eq(10n);
        // use the token again
        const vote2 = await computer.new(Vote, [{ electionId: election1._id, tokens: [t1], vote: 'accept' }], voteMod);
        expect(typeof vote2._id).eq('string');
        const accepted2 = await election1.acceptingVotes();
        expect(accepted2).eq(10n);
    });
});
//# sourceMappingURL=dao-contract.test.js.map