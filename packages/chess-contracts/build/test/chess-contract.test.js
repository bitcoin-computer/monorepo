import { Computer } from '@bitcoin-computer/lib';
import { EscrowAuditor, TBC20, TBC777 } from '@bitcoin-computer/TBC777';
import { ChessContract, ChessContractHelper } from '../src/chess-contract.js';
import { ChessChallengeTxWrapper } from '../src/chess-challenge.js';
import { User, UserHelper } from '../src/user.js';
import { expect } from 'expect';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { deploy as deployChessModule } from '../scripts/lib.js';
// `scripts/lib.ts` reads `${path}/src/chess.js`; `tsc` emits that file under `build/src/`. Deploy uses
// the same base (`build/scripts` → `..` = `build/`). From compiled `build/test/*.js`, one `..` is `build/`.
const chessDeployRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPaths = [
    path.resolve(process.cwd(), './packages/node/.env'),
    path.resolve(process.cwd(), '../../node/.env'),
    '../node/.env',
];
for (const envPath of envPaths) {
    dotenv.config({ path: envPath });
}
const url = process.env.BCN_URL ?? 'http://localhost:1031';
const chain = process.env.BCN_CHAIN ?? 'LTC';
const network = process.env.BCN_NETWORK ?? 'regtest';
/** Keeps deployed module size down when inlining TBC777 + EscrowAuditor. */
function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');
}
async function deployTbc777Mod(deployer) {
    return deployer.deploy(`
    export ${stripComments(TBC20.toString())}
    export ${stripComments(EscrowAuditor.toString())}
    export ${stripComments(TBC777.toString())}
  `);
}
async function ensureFunds(c, minSats = 10e8) {
    try {
        const { balance } = await c.getBalance();
        if (balance < minSats)
            await c.faucet(minSats);
    }
    catch {
        await c.faucet(minSats);
    }
}
async function withdrawFromChess(player, tokenId, chessId, tbc777Mod) {
    const latestTokenRev = await player.latest(tokenId);
    const chessRev = await player.latest(chessId);
    const { tx, effect } = await player.encode({
        exp: `token.withdraw('${chessRev}')`,
        env: { token: latestTokenRev },
        mod: tbc777Mod,
    });
    await player.broadcast(tx);
    return effect.env.token;
}
/** Fund a chess game: mint, split tokens, both deposits. Returns game state. */
async function fundChessGame(opts) {
    const { minter, white, black, tbc777Mod, chessMod, wager, timeLimit } = opts;
    const mintAmount = opts.mintAmount ?? 30n;
    const to = minter.getPublicKey();
    const token = await minter.new(TBC777, [{ to, amount: mintAmount, name: 'chess-e2e', symbol: 'CHS' }], tbc777Mod);
    await minter.faucet(1e8);
    const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
    await minter.faucet(1e8);
    const blackTokenUtxo = await token.transfer(black.getPublicKey(), 10n);
    await minter.faucet(1e8);
    if (!whiteTokenUtxo || !blackTokenUtxo)
        throw new Error('expected player token UTXOs');
    const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod);
    const whiteToken = await white.sync(whiteTokenUtxo._rev);
    const { tx: whiteDepositTx, effect: whiteDepositEffect } = await white.encode({
        exp: `chess.acceptDeposit(whiteToken, ${wager}n, 'White', '${black.getPublicKey()}')`,
        env: { chess: chess._rev, whiteToken: whiteToken._rev },
        mod: chessMod,
    });
    await white.broadcast(whiteDepositTx);
    await minter.faucet(1e8);
    const chessAfterWhiteDeposit = whiteDepositEffect.env.chess;
    const blackToken = await black.sync(blackTokenUtxo._rev);
    const chessHeadForBlack = await white.latest(chessAfterWhiteDeposit._id);
    const { tx: tx1, effect: effect1 } = await black.encode({
        exp: `chess.acceptDeposit(blackToken, ${wager}n, 'Black', '${white.getPublicKey()}')`,
        env: { chess: chessHeadForBlack, blackToken: blackToken._rev },
        mod: chessMod,
    });
    await black.broadcast(tx1);
    await minter.faucet(1e8);
    const chessFunded = effect1.env.chess;
    return {
        token,
        whiteTokenUtxo,
        blackTokenUtxo,
        blackToken,
        chess: chessAfterWhiteDeposit,
        chessFunded,
    };
}
describe('ChessContract', () => {
    describe('ChessContractHelper', () => {
        it('Should instantiate with required options', () => {
            const computer = new Computer({ url });
            const helper = new ChessContractHelper({
                computer,
                mod: 'test-mod',
                userMod: 'test-user-mod',
                tokenMod: 'test-token-mod',
            });
            expect(helper.computer).toBe(computer);
            expect(helper.mod).toBe('test-mod');
            expect(helper.userMod).toBe('test-user-mod');
            expect(helper.tokenMod).toBe('test-token-mod');
        });
        it('Should create via fromModSpecs static method', () => {
            const computer = new Computer({ url });
            const helper = ChessContractHelper.fromModSpecs(computer, 'mod', 'userMod', 'tokenMod');
            expect(helper).toBeInstanceOf(ChessContractHelper);
            expect(helper.mod).toBe('mod');
            expect(helper.tokenMod).toBe('tokenMod');
        });
    });
    describe('ChessChallengeTxWrapper', () => {
        it('Should have the correct fields', () => {
            const wrapper = new ChessChallengeTxWrapper('rev123', 5n, 'root456', 'pubKeyW', 'pubKeyB');
            expect(wrapper.chessRev).toBe('rev123');
            expect(wrapper.wagerAmount).toBe(5n);
            expect(wrapper.tokenRoot).toBe('root456');
            expect(wrapper.publicKeyW).toBe('pubKeyW');
            expect(wrapper.accepted).toBe(false);
            expect(wrapper.canceledSeen).toBe(false);
        });
    });
    describe('User', () => {
        it('Should create a user with name and empty games', () => {
            const user = new User('Alice');
            expect(user.name).toBe('Alice');
            expect(user.games).toEqual([]);
        });
        it('Should add games', () => {
            const user = new User('Bob');
            user.addGame('game1');
            user.addGame('game2');
            expect(user.games).toEqual(['game1', 'game2']);
        });
    });
    /**
     * Deploy chess + TBC777 token mods once; reuse spec strings across tests.
     */
    describe('Chain integration (local BCN)', () => {
        const TOKEN_SYMBOL = 'CHS';
        let tbc777Mod;
        let chessMod;
        before(async () => {
            const deployer = new Computer({ url, chain, network });
            await deployer.faucet(20e8);
            tbc777Mod = await deployTbc777Mod(deployer);
            await deployer.faucet(20e8);
            chessMod = await deployChessModule(deployer, chessDeployRoot);
        });
        describe('On-chain escrow flow', () => {
            const computer = new Computer({ url, chain, network });
            before(async () => {
                await computer.faucet(10e8);
            });
            it('Should create a ChessContract with correct initial state', async () => {
                const timeLimit = 60n * 10n;
                const chess = await computer.new(ChessContract, ['root123', 5n, timeLimit], chessMod);
                expect(chess.root).toBe('root123');
                expect(chess.wagerAmount).toBe(5n);
                expect(chess.nameW).toBe('');
                expect(chess.nameB).toBe('');
                expect(chess.publicKeyW).toBe('');
                expect(chess.publicKeyB).toBe('');
                expect(chess.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                expect(chess.sans).toEqual([]);
                expect(chess.deposits).toEqual([]);
                expect(chess.withdraws).toEqual([]);
                expect(chess.finalWithdraws).toEqual([]);
                expect(chess.tokenIdW).toBe('');
                expect(chess.tokenIdB).toBe('');
                expect(chess.canceledSeen).toBe(false);
            });
            it('Should reject moves when game is not fully funded', async () => {
                const timeLimit = 60n * 10n;
                const chess = await computer.new(ChessContract, ['root123', 5n, timeLimit], chessMod);
                await expect(async () => {
                    const { tx } = await computer.encodeCall({
                        target: chess,
                        property: 'move',
                        args: ['e2', 'e4', 'q'],
                        mod: chessMod,
                    });
                    await computer.broadcast(tx);
                }).rejects.toThrow('Game not yet fully funded');
            });
            it('Should reject resign when game is not fully funded', async () => {
                await computer.faucet(1e8);
                const timeLimit = 60n * 10n;
                const chess = await computer.new(ChessContract, ['root123', 5n, timeLimit], chessMod);
                await expect(async () => {
                    const { tx } = await computer.encodeCall({
                        target: chess,
                        property: 'resign',
                        args: [],
                        mod: chessMod,
                    });
                    await computer.broadcast(tx);
                }).rejects.toThrow('Game not yet started');
            });
        });
        describe('E2E TBC777 escrow + ChessContract', () => {
            let minter;
            let white;
            let black;
            beforeEach(async () => {
                minter = new Computer({ url, chain, network });
                white = new Computer({ url, chain, network });
                black = new Computer({ url, chain, network });
                await Promise.all([white.faucet(10e8), black.faucet(10e8), minter.faucet(10e8)]);
                await ensureFunds(minter);
            });
            it('Should reject acceptDeposit when amount does not match wager', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                if (!whiteTokenUtxo)
                    throw new Error('expected white token UTXO');
                const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod);
                const whiteToken = await white.sync(whiteTokenUtxo._rev);
                await expect(async () => {
                    const { tx } = await white.encode({
                        exp: `chess.acceptDeposit(whiteToken, 3n, 'W', '${black.getPublicKey()}')`,
                        env: { chess: chess._rev, whiteToken: whiteToken._rev },
                        mod: chessMod,
                    });
                    await white.broadcast(tx);
                }).rejects.toThrow();
            });
            it('Should let the creator cancel a pending game and recover their wager', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                if (!whiteTokenUtxo)
                    throw new Error('expected white token UTXO');
                const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod);
                const whiteToken = await white.sync(whiteTokenUtxo._rev);
                const { tx: depositTx, effect: depositEffect } = await white.encode({
                    exp: `chess.acceptDeposit(whiteToken, ${wager}n, 'White', '${black.getPublicKey()}')`,
                    env: { chess: chess._rev, whiteToken: whiteToken._rev },
                    mod: chessMod,
                });
                await white.broadcast(depositTx);
                await minter.faucet(1e8);
                const chessPending = depositEffect.env.chess;
                expect(chessPending.creatorPublicKey).toBe(white.getPublicKey());
                expect(chessPending.publicKeyW).toBe('');
                expect(chessPending.deposits.length).toBe(1);
                expect(chessPending._owners).toEqual([white.getPublicKey(), black.getPublicKey()]);
                expect(chessPending.withdraws).toEqual([]);
                expect(chessPending.finalWithdraws).toEqual([]);
                const helper = ChessContractHelper.fromModSpecs(white, chessMod, undefined, tbc777Mod);
                expect(helper.canCancel(chessPending)).toBe(true);
                expect(helper.isCreator(chessPending)).toBe(true);
                await black.db.wallet.restClient.mine(1);
                const chess2 = await helper.cancelGame(chessPending._id);
                await black.db.wallet.restClient.mine(1);
                await helper.withdrawTokens(chess2.tokenIdW, chessPending._id);
                await minter.faucet(1e8);
                const whiteTokenFinal = await white.sync(await white.latest(whiteToken._id));
                expect(whiteTokenFinal.amount).toBe(10n);
            });
            it('Should reject acceptDeposit after the creator cancels', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                const blackTokenUtxo = await token.transfer(black.getPublicKey(), 10n);
                if (!whiteTokenUtxo || !blackTokenUtxo)
                    throw new Error('expected player token UTXOs');
                const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod);
                const whiteToken = await white.sync(whiteTokenUtxo._rev);
                const { tx: depositTx, effect: depositEffect } = await white.encode({
                    exp: `chess.acceptDeposit(whiteToken, ${wager}n, 'White', '${black.getPublicKey()}')`,
                    env: { chess: chess._rev, whiteToken: whiteToken._rev },
                    mod: chessMod,
                });
                await white.broadcast(depositTx);
                await minter.faucet(1e8);
                const chessPending = depositEffect.env.chess;
                const helper = ChessContractHelper.fromModSpecs(white, chessMod, undefined, tbc777Mod);
                await helper.cancelGame(chessPending._id);
                await minter.faucet(1e8);
                const latestChessRev = await black.latest(chessPending._id);
                const blackToken = await black.sync(blackTokenUtxo._rev);
                await expect(async () => {
                    const { tx } = await black.encode({
                        exp: `chess.acceptDeposit(blackToken, ${wager}n, 'Black', '${white.getPublicKey()}')`,
                        env: { chess: latestChessRev, blackToken: blackToken._rev },
                        mod: chessMod,
                    });
                    await black.broadcast(tx);
                }).rejects.toThrow('Game was canceled');
            });
            it('Should reject cancel from the invited opponent', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                if (!whiteTokenUtxo)
                    throw new Error('expected white token UTXO');
                const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod);
                const whiteToken = await white.sync(whiteTokenUtxo._rev);
                const { tx: depositTx, effect: depositEffect } = await white.encode({
                    exp: `chess.acceptDeposit(whiteToken, ${wager}n, 'White', '${black.getPublicKey()}')`,
                    env: { chess: chess._rev, whiteToken: whiteToken._rev },
                    mod: chessMod,
                });
                await white.broadcast(depositTx);
                await minter.faucet(1e8);
                const chessPending = depositEffect.env.chess;
                const blackHelper = ChessContractHelper.fromModSpecs(black, chessMod, undefined, tbc777Mod);
                await expect(blackHelper.cancelGameAndWithdraw(chessPending._id)).rejects.toThrow('Cannot cancel');
            });
            it('Should reject second deposit from the creator using their own token', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                if (!whiteTokenUtxo)
                    throw new Error('expected white token UTXO');
                const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod);
                const whiteToken = await white.sync(whiteTokenUtxo._rev);
                // Direct call == encode+broadcast (multi-object update). Proxies advance immediately.
                await chess.acceptDeposit(whiteToken, wager, 'White', black.getPublicKey());
                // latest() needs the deposit confirmed; otherwise it can return pre-deposit revs
                // and the next encode hits txn-mempool-conflict instead of the contract error.
                await minter.faucet(1e8);
                const chessHead = await white.latest(chess._id);
                const whiteTokenAfterDeposit = await white.sync(await white.latest(whiteToken._id));
                await expect(async () => {
                    const { tx } = await white.encode({
                        exp: `chess.acceptDeposit(whiteTokenAfterDeposit, ${wager}n, 'FakeBlack', '${white.getPublicKey()}')`,
                        env: { chess: chessHead, whiteTokenAfterDeposit: whiteTokenAfterDeposit._rev },
                        mod: chessMod,
                    });
                    await white.broadcast(tx);
                }).rejects.toThrow('Only the invited opponent can accept the game');
            });
            it('Should reject cancel after the game has started', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const { chess, chessFunded } = await fundChessGame({
                    minter,
                    white,
                    black,
                    tbc777Mod,
                    chessMod,
                    wager,
                    timeLimit,
                });
                expect(chessFunded.publicKeyW).toBe(white.getPublicKey());
                const chessHead = await white.latest(chess._id);
                const chessStarted = await white.sync(chessHead);
                await expect(async () => {
                    const { tx } = await white.encodeCall({
                        target: chessStarted,
                        property: 'cancel',
                        args: [],
                        mod: chessMod,
                    });
                    await white.broadcast(tx);
                }).rejects.toThrow('Game started use resign to forfeit');
            });
            it('Should reject resign on a pending game via helper', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                if (!whiteTokenUtxo)
                    throw new Error('expected white token UTXO');
                const chess = await white.new(ChessContract, [token._root, wager, timeLimit], chessMod);
                const whiteToken = await white.sync(whiteTokenUtxo._rev);
                await chess.acceptDeposit(whiteToken, wager, 'White', black.getPublicKey());
                // helper.resign uses latest(); confirm so it loads the pending (post-deposit) state.
                await minter.faucet(1e8);
                const helper = ChessContractHelper.fromModSpecs(white, chessMod, undefined, tbc777Mod);
                await expect(helper.resign(chess._id)).rejects.toThrow('Game not yet started');
            });
            it('Should settle on resign and credit winner balance on withdraw', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const { token, whiteTokenUtxo, blackTokenUtxo, blackToken, chess, chessFunded } = await fundChessGame({
                    minter,
                    white,
                    black,
                    tbc777Mod,
                    chessMod,
                    wager,
                    timeLimit,
                });
                expect(chessFunded.deposits).toEqual([
                    [token._root, whiteTokenUtxo._rev],
                    [token._root, blackTokenUtxo._rev],
                ]);
                expect(chessFunded.withdraws).toEqual([]);
                expect(chessFunded.finalWithdraws).toEqual([]);
                // After both deposits it is white’s turn.
                expect(chessFunded._owners).toEqual([white.getPublicKey()]);
                const chessHead = await white.latest(chess._id);
                const chessToResign = await white.sync(chessHead);
                const { tx: resignTx, effect: resignEffect } = await white.encodeCall({
                    target: chessToResign,
                    property: 'resign',
                    args: [],
                    mod: chessMod,
                });
                await white.broadcast(resignTx);
                const chessFinal = resignEffect.env
                    .__bc__;
                const totalPot = wager * 2n;
                expect(chessFinal.withdraws).toEqual([[token._root, blackToken._id, totalPot]]);
                expect((await black.sync(await black.latest(blackToken._id))).amount).toBe(5n);
                await black.db.wallet.restClient.mine(1);
                const blackTokenFinal = await withdrawFromChess(black, blackToken._id, chess._id, tbc777Mod);
                expect(blackTokenFinal.amount).toBe(15n);
            });
            it('Should run fool mate and credit winner balance on withdraw', async () => {
                await minter.faucet(1e8);
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const { token, whiteTokenUtxo, blackTokenUtxo, blackToken, chess, chessFunded } = await fundChessGame({
                    minter,
                    white,
                    black,
                    tbc777Mod,
                    chessMod,
                    wager,
                    timeLimit,
                });
                expect(chessFunded.deposits).toEqual([
                    [token._root, whiteTokenUtxo._rev],
                    [token._root, blackTokenUtxo._rev],
                ]);
                // Fool’s mate (black wins): 1.f3 e5 2.g4 Qh4#
                const moves = [
                    { from: 'f2', to: 'f3', promotion: '', player: white },
                    { from: 'e7', to: 'e5', promotion: '', player: black },
                    { from: 'g2', to: 'g4', promotion: '', player: white },
                    { from: 'd8', to: 'h4', promotion: '', player: black },
                ];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let currentChess = chessFunded;
                for (const m of moves) {
                    const latest = await m.player.latest(currentChess._id);
                    const synced = await m.player.sync(latest);
                    const { tx, effect } = await m.player.encodeCall({
                        target: synced,
                        property: 'move',
                        args: [m.from, m.to, m.promotion],
                        mod: chessMod,
                    });
                    await m.player.broadcast(tx);
                    await minter.faucet(1e8);
                    currentChess = effect.env.__bc__;
                }
                const chessFinal = currentChess;
                const totalPot = wager * 2n;
                expect(chessFinal.withdraws).toEqual([[token._root, blackToken._id, totalPot]]);
                const blackTokenFinal = await withdrawFromChess(black, blackToken._id, chess._id, tbc777Mod);
                expect(blackTokenFinal.amount).toBe(15n);
            });
        });
        describe('User.games on deposit', () => {
            let minter;
            let white;
            let black;
            let userMod;
            before(async () => {
                const deployer = new Computer({ url, chain, network });
                await deployer.faucet(20e8);
                userMod = await deployer.deploy(`export ${User}`);
            });
            beforeEach(async () => {
                minter = new Computer({ url, chain, network });
                white = new Computer({ url, chain, network });
                black = new Computer({ url, chain, network });
                await Promise.all([white.faucet(10e8), black.faucet(10e8), minter.faucet(10e8)]);
                await ensureFunds(minter);
                const whiteUserHelper = new UserHelper({ computer: white, mod: userMod });
                const blackUserHelper = new UserHelper({ computer: black, mod: userMod });
                await whiteUserHelper.createUser('White');
                await blackUserHelper.createUser('Black');
                await minter.faucet(1e8);
            });
            async function syncUser(player) {
                const [userRev] = await player.getOUTXOs({
                    mod: userMod,
                    publicKey: player.getPublicKey(),
                });
                if (!userRev)
                    throw new Error('expected user account');
                return player.sync(userRev);
            }
            it('Should add the game to white user on first deposit', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                if (!whiteTokenUtxo)
                    throw new Error('expected white token UTXO');
                const helper = ChessContractHelper.fromModSpecs(white, chessMod, userMod, tbc777Mod);
                const chess = await helper.createGame(token._root, wager, timeLimit);
                await helper.depositTokens(chess._rev, whiteTokenUtxo._rev, wager, 'White', black.getPublicKey());
                await minter.faucet(1e8);
                const whiteUser = await syncUser(white);
                expect(whiteUser.games).toEqual([chess._id]);
            });
            it('Should add the game to both users after both deposits', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                await minter.faucet(1e8);
                const blackTokenUtxo = await token.transfer(black.getPublicKey(), 10n);
                await minter.faucet(1e8);
                if (!whiteTokenUtxo || !blackTokenUtxo)
                    throw new Error('expected player token UTXOs');
                const whiteHelper = ChessContractHelper.fromModSpecs(white, chessMod, userMod, tbc777Mod);
                const blackHelper = ChessContractHelper.fromModSpecs(black, chessMod, userMod, tbc777Mod);
                const chess = await whiteHelper.createGame(token._root, wager, timeLimit);
                const chessAfterWhite = await whiteHelper.depositTokens(chess._rev, whiteTokenUtxo._rev, wager, 'White', black.getPublicKey());
                await minter.faucet(1e8);
                const whiteUserAfterDeposit = await syncUser(white);
                expect(whiteUserAfterDeposit.games).toEqual([chess._id]);
                const blackToken = await black.sync(blackTokenUtxo._rev);
                const chessHeadForBlack = await white.latest(chessAfterWhite._id);
                await blackHelper.depositTokens(chessHeadForBlack, blackToken._rev, wager, 'Black', white.getPublicKey());
                await minter.faucet(1e8);
                const whiteUser = await syncUser(white);
                const blackUser = await syncUser(black);
                expect(whiteUser.games).toEqual([chess._id]);
                expect(blackUser.games).toEqual([chess._id]);
            });
            it('Should not duplicate game ids when addGameToUserIfNeeded is called twice', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                if (!whiteTokenUtxo)
                    throw new Error('expected white token UTXO');
                const helper = ChessContractHelper.fromModSpecs(white, chessMod, userMod, tbc777Mod);
                const chess = await helper.createGame(token._root, wager, timeLimit);
                await helper.depositTokens(chess._rev, whiteTokenUtxo._rev, wager, 'White', black.getPublicKey());
                await minter.faucet(1e8);
                await helper.addGameToUserIfNeeded(chess._id);
                await minter.faucet(1e8);
                const whiteUser = await syncUser(white);
                expect(whiteUser.games).toEqual([chess._id]);
            });
            it('Should not duplicate game ids when move runs after deposit', async () => {
                const wager = 5n;
                const timeLimit = 60n * 10n;
                const to = minter.getPublicKey();
                const token = await minter.new(TBC777, [{ to, amount: 20n, name: 'chess', symbol: TOKEN_SYMBOL }], tbc777Mod);
                await minter.faucet(1e8);
                const whiteTokenUtxo = await token.transfer(white.getPublicKey(), 10n);
                await minter.faucet(1e8);
                const blackTokenUtxo = await token.transfer(black.getPublicKey(), 10n);
                await minter.faucet(1e8);
                if (!whiteTokenUtxo || !blackTokenUtxo)
                    throw new Error('expected player token UTXOs');
                const whiteHelper = ChessContractHelper.fromModSpecs(white, chessMod, userMod, tbc777Mod);
                const blackHelper = ChessContractHelper.fromModSpecs(black, chessMod, userMod, tbc777Mod);
                const chess = await whiteHelper.createGame(token._root, wager, timeLimit);
                const chessAfterWhite = await whiteHelper.depositTokens(chess._rev, whiteTokenUtxo._rev, wager, 'White', black.getPublicKey());
                await minter.faucet(1e8);
                const blackToken = await black.sync(blackTokenUtxo._rev);
                const chessHeadForBlack = await white.latest(chessAfterWhite._id);
                const chessFunded = await blackHelper.depositTokens(chessHeadForBlack, blackToken._rev, wager, 'Black', white.getPublicKey());
                await minter.faucet(1e8);
                await whiteHelper.move(chessFunded, 'e2', 'e4', 'q');
                await minter.faucet(1e8);
                const whiteUser = await syncUser(white);
                expect(whiteUser.games).toEqual([chess._id]);
            });
        });
    });
});
//# sourceMappingURL=chess-contract.test.js.map