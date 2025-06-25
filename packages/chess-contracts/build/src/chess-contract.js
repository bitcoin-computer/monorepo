import { Transaction } from '@bitcoin-computer/lib';
import { address, bufferUtils, networks, payments, script as bscript, } from '@bitcoin-computer/nakamotojs';
import { sleep } from '@bitcoin-computer/components';
import { Buffer } from 'buffer';
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoin-computer/secp256k1';
const ECPair = ECPairFactory(ecc);
export const NotEnoughFundError = 'Not enough funds to create chess game.';
if (typeof global !== 'undefined')
    global.Buffer = Buffer;
export class Payment extends Contract {
    constructor({ satoshis, publicKeyW, publicKeyB }) {
        super({
            _satoshis: satoshis,
            _owners: `OP_2 ${publicKeyW} ${publicKeyB} OP_2 OP_CHECKMULTISIG`.replace(/\s+/g, ' '),
        });
    }
}
export class WinnerTxWrapper extends Contract {
    constructor({ publicKeyW, publicKeyB }) {
        super({
            _owners: [publicKeyW, publicKeyB],
            redeemTxHex: '',
        });
    }
    setRedeemHex(txHex) {
        this.redeemTxHex = txHex;
    }
}
export class ChessContract extends Contract {
    constructor(satoshis, nameW, nameB, publicKeyW, publicKeyB) {
        super({
            satoshis,
            nameW,
            nameB,
            publicKeyW,
            publicKeyB,
            sans: [],
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            payment: new Payment({ satoshis, publicKeyW, publicKeyB }),
            winnerTxWrapper: new WinnerTxWrapper({ publicKeyW, publicKeyB }),
        });
    }
    setRedeemHex(txHex) {
        this.winnerTxWrapper.setRedeemHex(txHex);
    }
    move(from, to, promotion) {
        // @ts-expect-error type error
        const chessLib = new Chess(this.fen);
        const { san } = chessLib.move({ from, to, promotion });
        this.sans.push(san);
        this.fen = chessLib.fen();
        if (!chessLib.isGameOver()) {
            if (this._owners[0] === this.publicKeyW) {
                this._owners = [this.publicKeyB];
            }
            else {
                this._owners = [this.publicKeyW];
            }
        }
        return chessLib.isGameOver();
    }
    isGameOver() {
        // @ts-expect-error type error
        return new Chess(this.fen).isGameOver();
    }
}
export class ChessContractHelper {
    constructor({ computer, satoshis, nameW, nameB, publicKeyW, publicKeyB, mod, userMod, }) {
        this.computer = computer;
        this.satoshis = satoshis;
        this.nameW = nameW;
        this.nameB = nameB;
        this.publicKeyW = publicKeyW;
        this.publicKeyB = publicKeyB;
        this.mod = mod;
        this.userMod = userMod;
    }
    isInitialized() {
        return Object.values(this).every((element) => element !== undefined);
    }
    static fromContract(computer, game, mod, userMod) {
        const { satoshis, nameW, nameB, publicKeyW, publicKeyB } = game;
        return new this({
            computer,
            satoshis,
            nameW,
            nameB,
            publicKeyW,
            publicKeyB,
            mod,
            userMod,
        });
    }
    // can we fetch the public key from the server
    getASM() {
        return `OP_2 ${this.publicKeyW} ${this.publicKeyB} OP_2 OP_CHECKMULTISIG`.replace(/\s+/g, ' ');
    }
    async validateUser() {
        const [userRev] = await this.computer.query({
            mod: this.userMod,
            publicKey: this.computer.getPublicKey(),
        });
        if (!userRev) {
            throw new Error('Please create your account to start playing');
        }
    }
    async makeTx() {
        if (!this.isInitialized())
            throw new Error('Chess helper is not initialized');
        await this.validateUser();
        // Create output with non-standard script
        const { tx } = await this.computer.encode({
            exp: `new ChessContract(
        ${this.satoshis}n,
        "${this.nameW}",
        "${this.nameB}",
        "${this.publicKeyW}",
        "${this.publicKeyB}"
      )`,
            mod: this.mod,
            fund: false,
            sign: false,
        });
        // Fund with this.satoshis / 2
        const chain = this.computer.getChain();
        const network = this.computer.getNetwork();
        const n = networks.getNetwork(chain, network);
        const addy = address.fromPublicKey(this.computer.wallet.publicKey, 'p2pkh', n);
        const utxos = await this.computer.wallet.restClient.getFormattedUtxos(addy);
        let paid = 0n;
        while (paid < Number(this.satoshis) / 2 && utxos.length > 0) {
            const { txId, vout, satoshis } = utxos.pop();
            const txHash = bufferUtils.reverseBuffer(Buffer.from(txId, 'hex'));
            tx.addInput(txHash, vout);
            paid += satoshis;
        }
        if (paid < this.satoshis)
            throw new Error(NotEnoughFundError);
        // Add change
        const fee = await this.computer.wallet.estimateFee(tx);
        const publicKeyBuffer = this.computer.wallet.publicKey;
        const { output } = payments.p2pkh({ pubkey: publicKeyBuffer, network: n });
        const changeSatoshis = Number(paid) - Number(this.satoshis) / 2 - 5 * fee; // todo: optimize the fee
        tx.addOutput(output, BigInt(Math.round(changeSatoshis)));
        // Sign
        const { SIGHASH_ALL, SIGHASH_ANYONECANPAY } = Transaction;
        await this.computer.sign(tx, { sighashType: SIGHASH_ALL | SIGHASH_ANYONECANPAY });
        return tx;
    }
    async completeTx(tx) {
        await this.validateUser();
        const decoded = await this.computer.decode(tx);
        const { effect } = await this.computer.encode(decoded);
        const { res: chessContract } = effect;
        this.satoshis = chessContract.payment._satoshis;
        this.nameW = chessContract.nameW;
        this.nameB = chessContract.nameB;
        this.publicKeyW = chessContract.publicKeyW;
        this.publicKeyB = chessContract.publicKeyB;
        // Fund
        const fee = await this.computer.wallet.estimateFee(tx);
        const txId = await this.computer.send(this.satoshis / 2n + 5n * BigInt(fee), this.computer.getAddress());
        const txHash = bufferUtils.reverseBuffer(Buffer.from(txId, 'hex'));
        tx.addInput(txHash, 0);
        // Sign and broadcast
        await this.computer.sign(tx);
        console.log({ inputs: tx.inputs, ins: tx.ins });
        await sleep(1000);
        return this.computer.broadcast(tx);
    }
    async move(chessContract, from, to, promotion) {
        if (chessContract && chessContract.sans.length < 2) {
            const [userRev] = await this.computer.query({
                mod: this.userMod,
                publicKey: this.computer.getPublicKey(),
            });
            if (userRev) {
                const userObj = (await this.computer.sync(userRev));
                const gameId = chessContract._id;
                if (!userObj.games.includes(gameId)) {
                    await userObj.addGame(gameId);
                }
            }
        }
        const { tx, effect } = (await this.computer.encodeCall({
            target: chessContract,
            property: 'move',
            args: [from, to, promotion],
            mod: this.mod,
        }));
        await this.computer.broadcast(tx);
        const { res: isGameOver, env } = effect;
        const { __bc__: newChessContract } = env;
        if (isGameOver) {
            await this.spend(newChessContract);
            console.log('You won!');
        }
        return { newChessContract, isGameOver };
    }
    async spend(chessContract, fee = 10000n) {
        const txId = chessContract._id.split(':')[0];
        return this.spendWithConfirmation(txId, chessContract, fee);
    }
    async spendWithConfirmation(txId, chessContract, fee = 10000n) {
        if (!this.isInitialized())
            throw new Error('Chess helper is not initialized');
        const chain = this.computer.getChain();
        const network = this.computer.getNetwork();
        const n = networks.getNetwork(chain, network);
        const { hdPrivateKey } = this.computer.wallet;
        // Create redeem tx
        const redeemTx = new Transaction();
        redeemTx.addInput(Buffer.from(txId, 'hex').reverse(), 1);
        const { output } = payments.p2pkh({ pubkey: hdPrivateKey.publicKey, ...n });
        redeemTx.addOutput(output, BigInt(this.satoshis) - fee);
        const scriptASM = this.getASM();
        const redeemScript = bscript.fromASM(scriptASM);
        const sigHash = redeemTx.hashForSignature(0, redeemScript, Transaction.SIGHASH_ALL);
        const winnerSig = bscript.signature.encode(hdPrivateKey.sign(sigHash), Transaction.SIGHASH_ALL);
        // Create partial scriptSig with OP_0 (dummy) and winner's signature
        const partialRedeemInput = bscript.compile([Buffer.alloc(0), winnerSig]);
        const partialScript = payments.p2sh({
            redeem: { input: partialRedeemInput, output: redeemScript },
        });
        redeemTx.setInputScript(0, partialScript.input);
        const redeemTxHex = redeemTx.toHex();
        await chessContract.setRedeemHex(redeemTxHex);
        return;
    }
    static validateAndSignRedeemTx(redeemTx, winnerPublicKey, validatorKeyPair, expectedRedeemScript, network, playerWIsTheValidator = false) {
        // Verify transaction structure
        if (redeemTx.ins.length !== 1 || redeemTx.outs.length !== 1) {
            throw new Error('Invalid transaction structure');
        }
        // Decompile scriptSig
        const scriptSig = redeemTx.ins[0].script;
        const decompiled = bscript.decompile(scriptSig);
        if (!decompiled || decompiled.length !== 3) {
            throw new Error('Invalid scriptSig format');
        }
        const [dummy, winnerSig, providedRedeemScript] = decompiled;
        // Verify dummy element
        if (dummy !== 0) {
            throw new Error('Dummy element must be OP_0');
        }
        // Verify redeem script
        if (!Buffer.isBuffer(providedRedeemScript) ||
            !providedRedeemScript.equals(expectedRedeemScript)) {
            throw new Error('Redeem script does not match expected script');
        }
        // Verify winner's signature
        const sigHash = redeemTx.hashForSignature(0, expectedRedeemScript, Transaction.SIGHASH_ALL);
        const winnerSigDecoded = bscript.signature.decode(winnerSig);
        const winnerKeyPair = ECPair.fromPublicKey(winnerPublicKey, { network });
        if (!winnerKeyPair.verify(sigHash, winnerSigDecoded.signature)) {
            throw new Error('Claimant’s signature is invalid');
        }
        // Verify output goes to winner's address
        const outputScript = redeemTx.outs[0].script;
        const winnerAddressScript = payments.p2pkh({ pubkey: winnerPublicKey, network }).output;
        if (!outputScript.equals(winnerAddressScript)) {
            throw new Error('Output must go to winner’s address');
        }
        // Validator signs the transaction
        const validatorSig = bscript.signature.encode(validatorKeyPair.sign(sigHash), Transaction.SIGHASH_ALL);
        // Update scriptSig with both signatures
        // Order of public keys in script should be similar to the order of signatures
        const finalRedeemInput = bscript.compile([
            Buffer.alloc(0),
            playerWIsTheValidator ? validatorSig : winnerSig,
            playerWIsTheValidator ? winnerSig : validatorSig,
        ]);
        const finalScript = payments.p2sh({
            redeem: { input: finalRedeemInput, output: expectedRedeemScript },
            network,
        });
        redeemTx.setInputScript(0, finalScript.input);
        // Return the fully signed transaction
        return redeemTx;
    }
}
export const signRedeemTx = async (computer, chessContract, txWrapper) => {
    const winnerPublicKey = chessContract._owners[0];
    const network = computer.getNetwork();
    const chain = computer.getChain();
    const NETWORKOBJ = networks.getNetwork(chain, network);
    const { privateKey: currentPlayerPrivateKey } = computer.wallet;
    const currentPlayerKeyPair = ECPair.fromPrivateKey(currentPlayerPrivateKey, {
        network: NETWORKOBJ,
    });
    const redeemTx = Transaction.fromHex(txWrapper.redeemTxHex);
    const expectedRedeemScript = bscript.fromASM(`OP_2 ${chessContract.publicKeyW} ${chessContract.publicKeyB} OP_2 OP_CHECKMULTISIG`);
    const playerWIsTheValidator = computer.getPublicKey() === chessContract.publicKeyW;
    // Validate and sign the transaction
    const signedRedeemTx = ChessContractHelper.validateAndSignRedeemTx(redeemTx, Buffer.from(winnerPublicKey, 'hex'), currentPlayerKeyPair, expectedRedeemScript, NETWORKOBJ, playerWIsTheValidator);
    return signedRedeemTx;
};
//# sourceMappingURL=chess-contract.js.map