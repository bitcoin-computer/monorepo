import { Computer } from '@bitcoin-computer/lib';
import { crypto } from '@bitcoin-computer/nakamotojs';
import { ChessContract, ChessContractHelper } from '../src/chess-contract';
import { deploy } from '../../chess-server/scripts/lib.js';
import { expect } from 'expect';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
const chain = 'LTC';
const network = 'regtest';
const url = 'http://localhost:1031';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const chessContractDirectory = `${__dirname}/..`;
describe('deploy', () => {
    const computer = new Computer();
    beforeEach(async () => {
        await computer.faucet(1e8);
    });
    it('Should deploy the smart contract', async () => {
        const mod = await deploy(computer, chessContractDirectory);
        expect(typeof mod).toEqual('string');
    });
});
describe('ChessContract', () => {
    let computerW;
    let computerB;
    let computer;
    const amount = 1e6;
    let mod;
    const secretW = 'secretW';
    const secretB = 'secretB';
    const secretHashW = crypto.sha256(crypto.sha256(Buffer.from(secretW))).toString('hex');
    const secretHashB = crypto.sha256(crypto.sha256(Buffer.from(secretB))).toString('hex');
    beforeEach(async () => {
        computerW = new Computer({ chain, network, url });
        computerB = new Computer({ chain, network, url });
        computer = new Computer({ chain, network, url });
        await computerW.faucet(1e8);
        await computer.faucet(1e8);
        mod = await deploy(computer, chessContractDirectory);
    });
    describe('constructor', () => {
        it('Should create a smart object', async () => {
            const chessContract = await computerW.new(ChessContract, [
                amount,
                'w',
                'b',
                computerW.getPublicKey(),
                computerB.getPublicKey(),
                secretHashW,
                secretHashB,
            ], mod);
            expect(typeof secretHashW).not.toEqual('undefined');
            expect(chessContract.fen).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        }, 30000);
    });
    describe('move', () => {
        it('Should perform a move', async () => {
            const chessContract = await computerW.new(ChessContract, [
                amount,
                'w',
                'b',
                computerW.getPublicKey(),
                computerB.getPublicKey(),
                secretHashW,
                secretHashB,
            ], mod);
            const fenBefore = chessContract.fen;
            await chessContract.move('e2', 'e4');
            expect(chessContract.fen).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
            expect(typeof chessContract.payment).not.toEqual('undefined');
            expect(chessContract.fen).not.toEqual(fenBefore);
        }, 30000);
    });
});
describe('ChessContractHelper', () => {
    let computerW;
    let computerB;
    let chessContractHelperW;
    let chessContractHelperB;
    const amount = 1e6;
    beforeEach(async () => {
        computerW = new Computer({ chain, network, url });
        computerB = new Computer({ chain, network, url });
        const { data: secretHashW } = await axios.get(`http://127.0.0.1:4000/hash`);
        const { data: secretHashB } = await axios.get(`http://127.0.0.1:4000/hash`);
        await computerW.faucet(1e8);
        await computerB.faucet(1e8);
        chessContractHelperW = new ChessContractHelper({
            computer: computerW,
            amount,
            nameW: 'nameW',
            nameB: 'nameB',
            publicKeyW: computerW.getPublicKey(),
            publicKeyB: computerB.getPublicKey(),
            secretHashW,
            secretHashB
        });
        chessContractHelperB = new ChessContractHelper({
            computer: computerB,
            amount,
            nameW: 'nameW',
            nameB: 'nameB',
            publicKeyW: computerW.getPublicKey(),
            publicKeyB: computerB.getPublicKey(),
            secretHashW,
            secretHashB
        });
        chessContractHelperW.mod = await deploy(computerW, chessContractDirectory);
        chessContractHelperB.mod = chessContractHelperW.mod;
    }, 20000);
    describe('makeTx', () => {
        it('Should deploy the smart contract', () => {
            expect(chessContractHelperW.mod).toBeDefined();
        });
        it('Should return a transaction', async () => {
            const tx = await chessContractHelperW.makeTx();
            expect(tx).toBeDefined();
            expect(tx?.ins.length).toBeGreaterThan(0);
            expect(tx?.outs.length).toBeGreaterThan(0);
            // expect(tx?.outs[0].value).toEqual(amount)
        });
    });
    describe('completeTx', () => {
        it('Should create a transaction', async () => {
            const tx = await chessContractHelperW.makeTx();
            const txId = await chessContractHelperB.completeTx(tx);
            expect(typeof txId).toEqual('string');
            const { res, env } = await computerW.sync(txId);
            expect(Object.keys(res)).toEqual([
                'amount',
                'nameW',
                'nameB',
                'publicKeyW',
                'publicKeyB',
                'secretHashW',
                'secretHashB',
                'sans',
                'fen',
                'payment',
                '_root',
                '_rev',
                '_id',
                '_amount',
                '_owners',
            ]);
            expect(Object.keys(env)).toEqual([]);
            await res.move('e2', 'e4');
        }, 10000);
    });
    describe('move', () => {
        it('Should perform a move', async () => {
            const tx = await chessContractHelperW.makeTx();
            const txId = await chessContractHelperB.completeTx(tx);
            expect(typeof txId).toEqual('string');
            const { res: chessContract, env } = await computerW.sync(txId);
            expect(Object.keys(chessContract)).toEqual(['amount', 'nameW', 'nameB', 'publicKeyW', 'publicKeyB', 'secretHashW', 'secretHashB', 'sans', 'fen', 'payment', '_root', '_rev', '_id', '_amount', '_owners']);
            expect(Object.keys(env)).toEqual([]);
            const { newChessContract } = await chessContractHelperW.move(chessContract, 'e2', 'e4');
            expect(newChessContract.fen).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
            expect(newChessContract.sans).toEqual(['e4']);
        }, 20000);
    });
    describe.skip('spendWithSecret', () => {
        let secretW;
        let secretB;
        let cchw;
        let cchb;
        beforeEach(async () => {
            secretW = 'secretW';
            secretB = 'secretB';
            const secretHashW = crypto.sha256(crypto.sha256(Buffer.from(secretW))).toString('hex');
            const secretHashB = crypto.sha256(crypto.sha256(Buffer.from(secretB))).toString('hex');
            cchw = new ChessContractHelper({
                computer: computerW,
                amount,
                nameW: 'nameW',
                nameB: 'nameB',
                publicKeyW: computerW.getPublicKey(),
                publicKeyB: computerB.getPublicKey(),
                secretHashW,
                secretHashB
            });
            cchb = new ChessContractHelper({
                computer: computerB,
                amount,
                nameW: 'nameW',
                nameB: 'nameB',
                publicKeyW: computerW.getPublicKey(),
                publicKeyB: computerB.getPublicKey(),
                secretHashW,
                secretHashB
            });
        });
        it('Should allow black to spend with the correct secret', async () => {
            const tx = await cchw.makeTx();
            const txId = await cchb.completeTx(tx);
            const txId2 = await cchb.spendWithSecret(txId, secretB, 1);
            expect(typeof txId2).toEqual('string');
        }, 20000);
        it('Should allow white to spend with the correct secret', async () => {
            const tx = await cchw.makeTx();
            const txId = await cchb.completeTx(tx);
            const txId2 = await cchw.spendWithSecret(txId, secretW, 0);
            expect(typeof txId2).toEqual('string');
        }, 20000);
        it('Should throw an error when trying to spend with the wrong secret', async () => {
            const tx = await cchw.makeTx();
            const txId = await cchb.completeTx(tx);
            await expect(cchw.spendWithSecret(txId, secretB, 0)).rejects.toThrow('mandatory-script-verify-flag-failed (Script evaluated without error but finished with a false/empty top stack element)');
            await expect(cchw.spendWithSecret(txId, secretB, 1)).rejects.toThrow('mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)');
        }, 20000);
    });
    describe('spend', () => {
        it('Should work for a game of fools mate', async () => {
            const tx = await chessContractHelperW.makeTx();
            const txId = await chessContractHelperB.completeTx(tx);
            let isGameOver;
            const { res: chessContract } = await computerW.sync(txId);
            const gameId = chessContract._id;
            const [rev2] = await computerW.query({ ids: [gameId] });
            const chessContract2 = await computerW.sync(rev2);
            ({ isGameOver } = await chessContractHelperW.move(chessContract2, 'f2', 'f3'));
            expect(isGameOver).toEqual(false);
            const [rev3] = await computerB.query({ ids: [gameId] });
            const chessContract3 = await computerB.sync(rev3);
            ({ isGameOver } = await chessContractHelperB.move(chessContract3, 'e7', 'e5'));
            expect(isGameOver).toEqual(false);
            const [rev4] = await computerW.query({ ids: [gameId] });
            const chessContract4 = await computerW.sync(rev4);
            ({ isGameOver } = await chessContractHelperW.move(chessContract4, 'g2', 'g4'));
            expect(isGameOver).toEqual(false);
            const [rev5] = await computerB.query({ ids: [gameId] });
            const chessContract5 = await computerB.sync(rev5);
            const res = await chessContractHelperB.move(chessContract5, 'd8', 'h4');
            expect(await res.newChessContract.isGameOver()).toEqual(true);
            expect(res.isGameOver).toEqual(true);
        }, 20000);
        it('Should work for a game of fools mate', async () => {
            const tx = await chessContractHelperW.makeTx();
            const txId = await chessContractHelperB.completeTx(tx);
            const mod = chessContractHelperW.mod;
            let isGameOver;
            const { res: chessContract } = await computerW.sync(txId);
            const gameId = chessContract._id;
            const [rev2] = await computerW.query({ ids: [gameId] });
            const chessContract2 = await computerW.sync(rev2);
            const chessContractHelperW2 = ChessContractHelper.fromContract(computerW, chessContract2, mod);
            ({ isGameOver } = await chessContractHelperW2.move(chessContract2, 'f2', 'f3'));
            expect(isGameOver).toEqual(false);
            const [rev3] = await computerB.query({ ids: [gameId] });
            const chessContract3 = await computerB.sync(rev3);
            const chessContractHelperB3 = ChessContractHelper.fromContract(computerB, chessContract3, mod);
            ({ isGameOver } = await chessContractHelperB3.move(chessContract3, 'e7', 'e5'));
            expect(isGameOver).toEqual(false);
            const [rev4] = await computerW.query({ ids: [gameId] });
            const chessContract4 = await computerW.sync(rev4);
            const chessContractHelperW4 = ChessContractHelper.fromContract(computerW, chessContract4, mod);
            ({ isGameOver } = await chessContractHelperW4.move(chessContract4, 'g2', 'g4'));
            expect(isGameOver).toEqual(false);
            const [rev5] = await computerB.query({ ids: [gameId] });
            const chessContract5 = await computerB.sync(rev5);
            const chessContractHelperB5 = ChessContractHelper.fromContract(computerB, chessContract5, mod);
            const res = await chessContractHelperB5.move(chessContract5, 'd8', 'h4');
            expect(await res.newChessContract.isGameOver()).toEqual(true);
            expect(res.isGameOver).toEqual(true);
        }, 20000);
    });
});
