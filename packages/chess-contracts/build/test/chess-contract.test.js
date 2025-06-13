import { Computer, Transaction } from '@bitcoin-computer/lib';
import { bufferUtils, networks, payments, script as bscript } from '@bitcoin-computer/nakamotojs';
import { ChessContractHelper } from '../src/chess-contract.js';
import { expect } from 'expect';
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoin-computer/secp256k1';
const url = 'http://localhost:1031';
const ECPair = ECPairFactory(ecc);
describe('Should create a deposit transaction for the Chess game with operator', () => {
    const betAmount = 100000n;
    const fees = 10000n;
    const aliceComputer = new Computer({ url });
    const bobComputer = new Computer({ url });
    const operatorComputer = new Computer({ url });
    const alicePublicKey = aliceComputer.wallet.publicKey;
    const bobPublicKey = bobComputer.wallet.publicKey;
    const operatorPublicKey = operatorComputer.wallet.publicKey;
    const aliceAddress = aliceComputer.getAddress();
    const bobAddress = bobComputer.getAddress();
    const chain = aliceComputer.getChain();
    const network = aliceComputer.getNetwork();
    const NETWORKOBJ = networks.getNetwork(chain, network);
    const n = { network: NETWORKOBJ };
    const alicePrivateKey = aliceComputer.wallet.privateKey;
    const bobPrivateKey = bobComputer.wallet.privateKey;
    const operatorPrivateKey = operatorComputer.wallet.privateKey;
    const aliceKeyPair = ECPair.fromPrivateKey(alicePrivateKey, n);
    const bobKeyPair = ECPair.fromPrivateKey(bobPrivateKey, n);
    const operatorKeyPair = ECPair.fromPrivateKey(operatorPrivateKey, n);
    const { output: aliceChangeOutput } = payments.p2pkh({ pubkey: alicePublicKey, ...n });
    const { output: bobChangeOutput } = payments.p2pkh({ pubkey: bobPublicKey, ...n });
    const outScript = `OP_2 ${alicePublicKey.toString('hex')} ${bobPublicKey.toString('hex')} ${operatorPublicKey.toString('hex')} OP_3 OP_CHECKMULTISIG`;
    const redeemScript = bscript.fromASM(outScript.trim().replace(/\s+/g, ' '));
    const { output } = payments.p2sh({ redeem: { output: redeemScript, ...n }, ...n });
    const validators = [
        { name: 'operator', keyPair: operatorKeyPair },
        { name: 'loser', keyPair: bobKeyPair },
    ];
    before('Before', async () => {
        await aliceComputer.faucet(10e8);
        await bobComputer.faucet(10e8);
        await operatorComputer.faucet(10e8);
    });
    // Helper functions remain unchanged
    const createCommitTx = async () => {
        await aliceComputer.faucet(10e8);
        await bobComputer.faucet(10e8);
        const [aliceUtxo] = await aliceComputer.wallet.restClient.getFormattedUtxos(aliceAddress);
        const { vout: vout1, satoshis: amountPayment1, txId: txId1 } = aliceUtxo;
        const aliceUtxoHash = bufferUtils.reverseBuffer(Buffer.from(txId1, 'hex'));
        const [bobUtxo] = await bobComputer.wallet.restClient.getFormattedUtxos(bobAddress);
        const { vout: vout2, satoshis: amountPayment2, txId: txId2 } = bobUtxo;
        const bobUtxoHash = bufferUtils.reverseBuffer(Buffer.from(txId2, 'hex'));
        const commitTx = new Transaction();
        commitTx.addOutput(output, 2n * betAmount);
        commitTx.addInput(aliceUtxoHash, vout1);
        commitTx.addInput(bobUtxoHash, vout2);
        const requiredFee = await aliceComputer.wallet.estimateFee(commitTx);
        commitTx.addOutput(aliceChangeOutput, amountPayment1 - betAmount);
        commitTx.addOutput(bobChangeOutput, amountPayment2 - betAmount - BigInt(requiredFee));
        await aliceComputer.sign(commitTx);
        await bobComputer.sign(commitTx);
        const commitTxId = await bobComputer.broadcast(commitTx);
        return commitTxId;
    };
    const createRedeemTx = (claimantKeyPair, commitTxId, outputScript, amount) => {
        if (!outputScript) {
            throw new Error('Invalid outputScript provided');
        }
        const redeemTx = new Transaction();
        redeemTx.addInput(Buffer.from(commitTxId, 'hex').reverse(), 0);
        redeemTx.addOutput(outputScript, amount);
        const sigHash = redeemTx.hashForSignature(0, redeemScript, Transaction.SIGHASH_ALL);
        const claimantSig = bscript.signature.encode(claimantKeyPair.sign(sigHash), Transaction.SIGHASH_ALL);
        const partialRedeemInput = bscript.compile([Buffer.alloc(0), claimantSig]);
        const partialScript = payments.p2sh({
            redeem: { input: partialRedeemInput, output: redeemScript },
        });
        redeemTx.setInputScript(0, partialScript.input);
        return redeemTx;
    };
    // Tests
    it('Should create the deposit transaction and redeem it', async () => {
        const commitTxId = await createCommitTx();
        const redeemTx = new Transaction();
        redeemTx.addInput(Buffer.from(commitTxId, 'hex').reverse(), 0);
        redeemTx.addOutput(aliceChangeOutput, 2n * betAmount - fees);
        const sigHash = redeemTx.hashForSignature(0, redeemScript, Transaction.SIGHASH_ALL);
        const inScript = [
            Buffer.alloc(0),
            bscript.signature.encode(aliceKeyPair.sign(sigHash), Transaction.SIGHASH_ALL),
            bscript.signature.encode(operatorKeyPair.sign(sigHash), Transaction.SIGHASH_ALL),
        ];
        const script = payments.p2sh({
            redeem: { input: bscript.compile(inScript), output: redeemScript },
        });
        redeemTx.setInputScript(0, script.input);
        await operatorComputer.broadcast(redeemTx);
    });
    validators.forEach((validator) => {
        it(`Should allow Alice (winner) to claim funds with ${validator.name}`, async () => {
            const commitTxId = await createCommitTx();
            const redeemTx = createRedeemTx(aliceKeyPair, commitTxId, aliceChangeOutput, 2n * betAmount - fees);
            expect(() => {
                ChessContractHelper.validateAndSignRedeemTx(redeemTx, alicePublicKey, validator.keyPair, redeemScript, n.network);
            }).not.toThrow();
        });
        it(`Should reject Bob (loser) claiming with ${validator.name}`, async () => {
            const commitTxId = await createCommitTx();
            const redeemTx = createRedeemTx(bobKeyPair, commitTxId, aliceChangeOutput, 2n * betAmount - fees);
            expect(() => {
                ChessContractHelper.validateAndSignRedeemTx(redeemTx, alicePublicKey, validator.keyPair, redeemScript, n.network);
            }).toThrow('Claimant’s signature is invalid');
        });
    });
    it('Should reject if output is not to winner’s address', async () => {
        const commitTxId = await createCommitTx();
        const winnerPublicKey = alicePublicKey;
        const redeemTx = createRedeemTx(aliceKeyPair, commitTxId, bobChangeOutput, 2n * betAmount - fees);
        expect(() => {
            ChessContractHelper.validateAndSignRedeemTx(redeemTx, winnerPublicKey, operatorKeyPair, redeemScript, n.network);
        }).toThrow('Output must go to winner’s address');
    });
    it('Should reject if transaction has multiple inputs', async () => {
        const commitTxId = await createCommitTx();
        const winnerPublicKey = alicePublicKey;
        const redeemTx = createRedeemTx(aliceKeyPair, commitTxId, aliceChangeOutput, 2n * betAmount - fees);
        redeemTx.addInput(Buffer.from('00'.repeat(32), 'hex'), 0);
        expect(() => {
            ChessContractHelper.validateAndSignRedeemTx(redeemTx, winnerPublicKey, operatorKeyPair, redeemScript, n.network);
        }).toThrow('Invalid transaction structure');
    });
    it('Should reject if scriptSig has invalid format', async () => {
        const commitTxId = await createCommitTx();
        const winnerPublicKey = alicePublicKey;
        const redeemTx = createRedeemTx(aliceKeyPair, commitTxId, aliceChangeOutput, 2n * betAmount - fees);
        const scriptSig = redeemTx.ins[0].script;
        const decompiled = bscript.decompile(scriptSig);
        const invalidScriptSig = bscript.compile([decompiled[0], decompiled[1]]); // Missing redeem script
        redeemTx.setInputScript(0, invalidScriptSig);
        expect(() => {
            ChessContractHelper.validateAndSignRedeemTx(redeemTx, winnerPublicKey, operatorKeyPair, redeemScript, n.network);
        }).toThrow('Invalid scriptSig format');
    });
    it('Should reject if provided redeem script is incorrect', async () => {
        const commitTxId = await createCommitTx();
        const winnerPublicKey = alicePublicKey;
        const wrongRedeemScript = bscript.fromASM('OP_1');
        const redeemTx = new Transaction();
        redeemTx.addInput(Buffer.from(commitTxId, 'hex').reverse(), 0);
        redeemTx.addOutput(aliceChangeOutput, BigInt(2n * betAmount) - fees);
        const sigHash = redeemTx.hashForSignature(0, redeemScript, Transaction.SIGHASH_ALL);
        const claimantSig = bscript.signature.encode(aliceKeyPair.sign(sigHash), Transaction.SIGHASH_ALL);
        const partialRedeemInput = bscript.compile([Buffer.alloc(0), claimantSig]);
        const partialScript = payments.p2sh({
            redeem: { input: partialRedeemInput, output: wrongRedeemScript },
        });
        redeemTx.setInputScript(0, partialScript.input);
        expect(() => {
            ChessContractHelper.validateAndSignRedeemTx(redeemTx, winnerPublicKey, operatorKeyPair, redeemScript, n.network);
        }).toThrow('Redeem script does not match expected script');
    });
    it('Should reject if claimant signature is invalid', async () => {
        const commitTxId = await createCommitTx();
        const winnerPublicKey = alicePublicKey;
        const redeemTx = createRedeemTx(aliceKeyPair, commitTxId, aliceChangeOutput, 2n * betAmount - fees);
        const scriptSig = redeemTx.ins[0].script;
        const decompiled = bscript.decompile(scriptSig);
        const corruptedSig = Buffer.from(decompiled[1]);
        // eslint-disable-next-line no-bitwise -- intentional bitwise corruption for test
        corruptedSig[10] ^= 0x01; // Corrupt the signature
        decompiled[1] = corruptedSig;
        const corruptedScriptSig = bscript.compile(decompiled);
        redeemTx.setInputScript(0, corruptedScriptSig);
        expect(() => {
            ChessContractHelper.validateAndSignRedeemTx(redeemTx, winnerPublicKey, operatorKeyPair, redeemScript, n.network);
        }).toThrow('Claimant’s signature is invalid');
    });
});
//# sourceMappingURL=chess-contract.test.js.map