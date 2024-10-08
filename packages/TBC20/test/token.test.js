/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { Computer } from '@bitcoin-computer/lib';
import dotenv from 'dotenv';
import { TBC20, Token } from '../src/token';
dotenv.config({ path: '../node/.env' });
const url = process.env.BCN_URL;
const chain = process.env.BCN_CHAIN;
const network = process.env.BCN_NETWORK;
function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
const sender = new Computer({ url, chain, network });
const receiver = new Computer({ url, chain, network });
before(async () => {
    await sender.faucet(1e7);
});
describe('Token', () => {
    describe('Using fungible tokens without a helper class', () => {
        let token;
        describe('Minting a fungible token', async () => {
            it('Sender mints a token', async () => {
                token = await sender.new(Token, [sender.getPublicKey(), 3, 'test']);
            });
            it('The meta data should be set', async () => {
                expect(token.amount).to.eq(3);
                expect(token._owners).deep.equal([sender.getPublicKey()]);
                expect(token.name).to.eq('test');
                expect(token.symbol).to.eq('');
                expect(token._id).to.be.a('string');
                expect(token._rev).to.be.a('string');
                expect(token._root).to.be.a('string');
            });
        });
        describe('Transferring the NFT', () => {
            let newToken;
            it('Sender transfers the NFT to receiver', async () => {
                newToken = await token.transfer(receiver.getPublicKey(), 1);
            });
            it('The meta data of token should be set correctly', () => {
                expect(token.amount).to.eq(2);
                expect(token._owners).deep.equal([sender.getPublicKey()]);
                expect(token.name).to.eq('test');
                expect(token.symbol).to.eq('');
                expect(token._id).to.be.a('string');
                expect(token._rev).to.be.a('string');
                expect(token._root).to.be.a('string');
            });
            it('The meta data of newToken should be set correctly', () => {
                expect(newToken.amount).to.eq(1);
                expect(newToken._owners).deep.equal([receiver.getPublicKey()]);
                expect(newToken.name).to.eq('test');
                expect(newToken.symbol).to.eq('');
                expect(newToken._id).to.be.a('string');
                expect(newToken._rev).to.be.a('string');
                expect(newToken._root).to.be.a('string');
            });
        });
    });
    describe('Using fungible tokens with a helper class', () => {
        describe('mint', () => {
            const tbc20 = new TBC20(sender);
            let root;
            it('Should create the tbc20 object', async () => {
                const publicKey = tbc20.computer.getPublicKey();
                root = await tbc20.mint(publicKey, 200, 'test', 'TST');
                expect(root).not.to.be.undefined;
                expect(typeof root).to.eq('string');
                expect(root.length).to.be.greaterThan(64);
            });
            it('Should mint a root token', async () => {
                const rootToken = await sender.sync(root);
                expect(rootToken).not.to.be.undefined;
                expect(rootToken._id).to.eq(root);
                expect(rootToken._rev).to.eq(root);
                expect(rootToken._root).to.eq(root);
                expect(rootToken.amount).to.eq(200);
                expect(rootToken.name).to.eq('test');
                expect(rootToken.symbol).to.eq('TST');
            });
        });
        describe('totalSupply', () => {
            it('Should return the supply of tokens', async () => {
                const tbc20 = new TBC20(sender);
                const publicKey = tbc20.computer.getPublicKey();
                const root = await tbc20.mint(publicKey, 200, 'test', 'TST');
                const supply = await tbc20.totalSupply(root);
                expect(supply).to.eq(200);
            });
        });
        describe('balanceOf', () => {
            it('Should throw an error if the root is not set', async () => {
                const publicKeyString = sender.getPublicKey();
                const tbc20 = new TBC20(sender);
                expect(tbc20).not.to.be.undefined;
                try {
                    await tbc20.balanceOf(publicKeyString, undefined);
                    expect(true).to.eq(false);
                }
                catch (err) {
                    expect(err.message).to.eq('Please pass a root into balanceOf.');
                }
            });
            it('Should compute the balance', async () => {
                const tbc20 = new TBC20(sender);
                const publicKey = tbc20.computer.getPublicKey();
                const root = await tbc20.mint(publicKey, 200, 'test', 'TST');
                await sleep(200);
                const res = await tbc20.balanceOf(publicKey, root);
                expect(res).to.eq(200);
            });
        });
        describe('transfer', () => {
            it('Should transfer a token', async () => {
                const computer2 = new Computer({ url, chain, network });
                const tbc20 = new TBC20(sender);
                const publicKey = tbc20.computer.getPublicKey();
                const root = await tbc20.mint(publicKey, 200, 'test', 'TST');
                await sleep(200);
                await tbc20.transfer(computer2.getPublicKey(), 20, root);
                await sleep(200);
                const res = await tbc20.balanceOf(publicKey, root);
                expect(res).to.eq(180);
            });
            it('Should transfer random amounts to different people', async () => {
                const computer2 = new Computer({ url, chain, network });
                const computer3 = new Computer({ url, chain, network });
                const tbc20 = new TBC20(sender);
                const publicKey = tbc20.computer.getPublicKey();
                const root = await tbc20.mint(publicKey, 200, 'multiple', 'MULT');
                const amount2 = Math.floor(Math.random() * 100);
                const amount3 = Math.floor(Math.random() * 100);
                await sleep(200);
                await tbc20.transfer(computer2.getPublicKey(), amount2, root);
                await sleep(200);
                await tbc20.transfer(computer3.getPublicKey(), amount3, root);
                await sleep(200);
                const res = await tbc20.balanceOf(publicKey, root);
                expect(res).to.eq(200 - amount2 - amount3);
                const res2 = await tbc20.balanceOf(computer2.getPublicKey(), root);
                expect(res2).to.eq(amount2);
                const res3 = await tbc20.balanceOf(computer3.getPublicKey(), root);
                expect(res3).to.eq(amount3);
            });
            it('Should fail if the amount is greater than the balance', async () => {
                const computer2 = new Computer({ url, chain, network });
                const tbc20 = new TBC20(sender);
                const publicKey = tbc20.computer.getPublicKey();
                const root = await tbc20.mint(publicKey, 200, 'test', 'TST');
                await sleep(200);
                try {
                    await tbc20.transfer(computer2.getPublicKey(), 201, root);
                    expect(true).to.eq('false');
                }
                catch (err) {
                    expect(err.message).to.eq('Could not send entire amount');
                }
            });
        });
    });
});
