import { Transaction } from '@bitcoin-computer/lib';
import { address as bAddress, networks } from '@bitcoin-computer/nakamotojs';
async function listSpendableUtxos(computer, modSpecs) {
    const utxos = await computer.getUTXOs({
        address: computer.getAddress(),
        verbosity: 1,
        isObject: false,
    });
    const modUtxosArrays = await Promise.all(modSpecs.map((mod) => computer.getUTXOs({
        publicKey: computer.getPublicKey(),
        mod,
        verbosity: 1,
    })));
    const allModUtxos = modUtxosArrays.flat();
    const totalSatoshis = utxos.reduce((acc, u) => acc + u.satoshis, 0n) +
        allModUtxos.reduce((acc, u) => acc + u.satoshis, 0n);
    return { utxos, allModUtxos, totalSatoshis };
}
/** Sum of satoshis in wallet address UTXOs plus mod UTXOs (same set used by {@link signAndBroadcastSpendUtxos}). */
export async function getSpendableUtxosTotalSatoshis(computer, modSpecs) {
    const { totalSatoshis } = await listSpendableUtxos(computer, modSpecs);
    return totalSatoshis;
}
// BIP141 witness program: OP_0 or OP_1..OP_16, then a 2..40 byte push.
function isWitnessProgram(script) {
    if (script.length < 4 || script.length > 42)
        return false;
    const version = script[0];
    const programLength = script[1];
    if (programLength !== script.length - 2 || programLength < 2 || programLength > 40)
        return false;
    return version === 0x00 || (version >= 0x51 && version <= 0x60);
}
/**
 * Builds a transaction from wallet + mod UTXOs, signs, and broadcasts.
 * If `toAddress` is empty/omitted, consolidates everything into one output to this wallet (minus the fee).
 * `estimateFee` appends one output before it measures, so the fee is read while that output is still absent.
 * @returns Broadcast transaction id when available.
 */
export async function signAndBroadcastSpendUtxos(options) {
    const { computer, modSpecs } = options;
    const trimmedTo = options.toAddress?.trim() ?? '';
    const hasRecipient = trimmedTo.length > 0;
    const sendMax = Boolean(options.sendMax);
    if (hasRecipient && !sendMax) {
        if (options.amountSatoshis === undefined || options.amountSatoshis <= 0n) {
            throw new Error('amountSatoshis is required and must be positive when sending to an address');
        }
    }
    if (sendMax && !hasRecipient) {
        throw new Error('toAddress is required when sendMax is true');
    }
    const { utxos, allModUtxos, totalSatoshis: totalInput, } = await listSpendableUtxos(computer, modSpecs);
    const tx = new Transaction();
    utxos.forEach((utxo) => {
        const prevHash = Buffer.from(utxo.rev.split(':')[0], 'hex').reverse();
        tx.addInput(prevHash, Number(utxo.rev.split(':')[1]));
    });
    allModUtxos.forEach((utxo) => {
        const prevHash = Buffer.from(utxo.rev.split(':')[0], 'hex').reverse();
        tx.addInput(prevHash, Number(utxo.rev.split(':')[1]));
    });
    if (totalInput <= 0n) {
        throw new Error('No spendable UTXOs to include in the transaction.');
    }
    const networkObj = networks.getNetwork(computer.getChain(), computer.getNetwork());
    const changeScript = bAddress.toOutputScript(computer.getAddress().toString(), networkObj);
    const satPerByte = BigInt(computer.db.wallet.restClient.satPerByte);
    // getDustThreshold's flag selects the spend size. It does not inspect the script.
    const dustLimit = (script) => BigInt(computer.db.wallet.getDustThreshold(isWitnessProgram(script), script));
    // The appended output pays this wallet. Output script bytes are not discounted,
    // so a different script changes the fee by its length difference times satPerByte.
    const feeFor = async (script) => {
        const estimated = BigInt(await computer.db.wallet.estimateFee(tx));
        return estimated + BigInt(script.length - changeScript.length) * satPerByte;
    };
    if (!hasRecipient) {
        const outValue = totalInput - (await feeFor(changeScript));
        if (outValue < dustLimit(changeScript)) {
            throw new Error('Balance is too low to cover network fees and the minimum output size after consolidation.');
        }
        tx.addOutput(changeScript, outValue);
    }
    else {
        let recipientScript;
        try {
            recipientScript = bAddress.toOutputScript(trimmedTo, networkObj);
        }
        catch {
            throw new Error('Invalid recipient address for this network.');
        }
        if (sendMax) {
            const outValue = totalInput - (await feeFor(recipientScript));
            if (outValue < dustLimit(recipientScript)) {
                throw new Error(`Balance is too low to cover network fees when sending max (${computer.getChain()}).`);
            }
            tx.addOutput(recipientScript, outValue);
        }
        else {
            const amountSatoshis = options.amountSatoshis;
            const recipientDust = dustLimit(recipientScript);
            if (amountSatoshis < recipientDust) {
                throw new Error(`Amount is below the minimum output size of ${recipientDust} satoshis (${computer.getChain()}).`);
            }
            tx.addOutput(recipientScript, amountSatoshis);
            const changeAmount = totalInput - (await feeFor(changeScript)) - amountSatoshis;
            if (changeAmount >= dustLimit(changeScript)) {
                tx.addOutput(changeScript, changeAmount);
            }
            else {
                // No change output. Drop the recipient so the fee's extra output stands in for it.
                tx.outs.pop();
                if (totalInput - amountSatoshis < (await feeFor(recipientScript))) {
                    throw new Error(`Insufficient balance after fees to send this amount (${computer.getChain()}).`);
                }
                tx.addOutput(recipientScript, amountSatoshis);
            }
        }
    }
    await computer.sign(tx);
    const txId = await computer.broadcast(tx);
    return typeof txId === 'string' ? txId : undefined;
}
/** Validate that `address` is a valid output script for the computer's chain/network. */
export function isValidAddressForComputer(computer, address) {
    const trimmed = address.trim();
    if (!trimmed)
        return false;
    try {
        const networkObj = networks.getNetwork(computer.getChain(), computer.getNetwork());
        bAddress.toOutputScript(trimmed, networkObj);
        return true;
    }
    catch {
        return false;
    }
}
