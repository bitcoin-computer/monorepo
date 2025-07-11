import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useContext, useEffect, useState } from 'react';
import { HiRefresh } from 'react-icons/hi';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { Auth } from './Auth';
import { Drawer } from './Drawer';
import { UtilsContext } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
import { getEnv, bigIntToStr } from './common/utils';
import { VITE_WITHDRAW_MOD_SPEC } from './common/modSpecs';
import { bufferUtils, payments as paymentsUtils } from '@bitcoin-computer/nakamotojs';
const Balance = ({ computer, modSpecs, isOpen, }) => {
    const [balance, setBalance] = useState(0n);
    const [paymentsWrapper, setPaymentsWrapper] = useState([]);
    const [, setChain] = useState(localStorage.getItem('CHAIN') || 'LTC');
    const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents();
    const [address, setAddress] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const handleWithdraw = async () => {
        try {
            setWithdrawing(true);
            showLoader(true);
            if (!address || !address.trim()) {
                showSnackBar('Please input valid address', false);
                return;
            }
            const expParams = paymentsWrapper.map((_, i) => `p${i}`).join(', ');
            const envParams = Object.fromEntries(paymentsWrapper.map((payment, i) => [`p${i}`, payment._rev]));
            const { tx } = await computer.encode({
                exp: `Withdraw.exec([${expParams}])`,
                env: envParams,
                fund: false,
                mod: VITE_WITHDRAW_MOD_SPEC,
            });
            const utxos = await computer.db.wallet.restClient.getFormattedUtxos(computer.getAddress());
            utxos.forEach((utxo) => {
                tx.addInput(bufferUtils.reverseBuffer(Buffer.from(utxo.txId, 'hex')), utxo.vout);
            });
            await computer.fund(tx);
            const changeOutputIndex = tx.outs.length - 1;
            const p2pkh = paymentsUtils.p2pkh({
                address: computer.getAddress(),
                network: computer.db.wallet.restClient.networkObj,
            });
            tx.updateOutput(changeOutputIndex, { scriptPubKey: p2pkh.output });
            await computer.sign(tx);
            await computer.broadcast(tx);
            showSnackBar('Congratulations! Balance withdrawn to address.', true);
        }
        catch (err) {
            if (err instanceof Error) {
                showSnackBar(`Something went wrong, ${err.message}`, true);
            }
        }
        finally {
            setWithdrawing(false);
            showLoader(false);
        }
    };
    const refreshBalance = useCallback(async () => {
        try {
            showLoader(true);
            const publicKey = computer.getPublicKey();
            const allPayments = [];
            const balances = await Promise.all(modSpecs.map(async (mod) => {
                const paymentRevs = modSpecs ? await computer.query({ publicKey, mod }) : [];
                const payments = (await Promise.all(paymentRevs.map((rev) => computer.sync(rev))));
                allPayments.push(...payments); // Accumulate payments
                return payments && payments.length
                    ? payments.reduce((total, pay) => total + (pay._satoshis - BigInt(computer.getMinimumFees())), 0n)
                    : 0n;
            }));
            const amountsInPayments = balances.reduce((acc, curr) => acc + BigInt(curr), 0n);
            const walletBalance = await computer.getBalance();
            setBalance(walletBalance.balance + amountsInPayments);
            setPaymentsWrapper(allPayments);
            setChain(computer.getChain());
            showLoader(false);
        }
        catch (err) {
            showLoader(false);
            showSnackBar('Error fetching wallet details', false);
        }
    }, [computer, modSpecs]);
    const fund = async () => {
        await computer.faucet(1e8);
        setBalance((await computer.getBalance()).balance);
    };
    useEffect(() => {
        if (isOpen)
            refreshBalance();
    }, [isOpen, refreshBalance]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { id: "dropdown-cta", className: "relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900", role: "alert", children: [_jsxs("div", { className: "text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400", children: [bigIntToStr(balance), " ", computer.getChain(), ' ', _jsx(HiRefresh, { onClick: refreshBalance, className: "w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100" })] }), _jsx("div", { className: "text-center uppercase text-xs text-blue-800 dark:text-blue-400", children: computer.getNetwork() }), computer.getNetwork() === 'regtest' && (_jsx("button", { id: "fund-wallet", type: "button", onClick: fund, className: "absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800", children: "Fund" }))] }), _jsx(Address, { computer: computer }), _jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white mb-1", children: "Withdraw to Address" }), _jsx("p", { className: "mb-1 font-mono text-xs text-gray-500 dark:text-gray-400", children: "Complete balance will be withdrawn, Some of your balance might be locked in the tokens. Use withdraw to unlock." }), _jsx("input", { type: "text", value: address, onChange: (e) => setAddress(e.target.value), className: "block w-full px-3 py-2 mb-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500", placeholder: "Enter recipient address" }), _jsx("button", { onClick: handleWithdraw, disabled: withdrawing, className: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-400", children: "Withdraw" })] })] }));
};
const Address = ({ computer }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(computer.getAddress());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Deposit Address" }), _jsx("button", { onClick: handleCopy, className: `ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`, "aria-label": "Copy address", children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400", children: computer.getAddress() })] }));
};
const PublicKey = ({ computer }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(computer.getPublicKey());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Public Key" }), _jsx("button", { onClick: handleCopy, className: `ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`, "aria-label": "Copy public key", children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "mb-4 text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: computer.getPublicKey() })] }));
};
const Mnemonic = ({ computer }) => {
    const [mnemonicShown, setMnemonicShown] = useState(false);
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("h6", { className: "text-lg font-bold dark:text-white", children: ["Mnemonic", ' ', _jsx("button", { onClick: () => setMnemonicShown(!mnemonicShown), className: "text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline", children: mnemonicShown ? 'hide' : 'show' })] }), _jsx("p", { className: "text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: mnemonicShown ? computer.getMnemonic() : '' })] }));
};
const Url = ({ computer }) => (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Node Url" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getUrl() })] }));
const Chain = ({ computer }) => (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Chain" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getChain() })] }));
const Network = ({ computer }) => (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Network" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getNetwork() })] }));
const Path = ({ computer }) => (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Path" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getPath() })] }));
const LogOut = () => (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Log out" }), _jsx("p", { className: "mb-1 text-sm text-gray-500 dark:text-gray-400", children: "Logging out will delete your mnemonic. Make sure to write it down." })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: _jsx("button", { onClick: Auth.logout, className: "rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700", children: "Log out" }) })] }));
export function Wallet({ modSpecs }) {
    const computer = useContext(ComputerContext);
    const Content = ({ isOpen }) => (_jsxs(_Fragment, { children: [_jsx("h4", { className: "text-2xl font-bold dark:text-white", children: "Wallet" }), _jsx(Balance, { computer: computer, modSpecs: modSpecs || [], isOpen: isOpen }), _jsx(PublicKey, { computer: computer }), _jsx(Mnemonic, { computer: computer }), !getEnv('CHAIN') && _jsx(Chain, { computer: computer }), !getEnv('NETWORK') && _jsx(Network, { computer: computer }), !getEnv('URL') && _jsx(Url, { computer: computer }), !getEnv('PATH') && _jsx(Path, { computer: computer }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(LogOut, {})] }));
    return _jsx(Drawer.Component, { Content: Content, id: "wallet-drawer" });
}
export const WalletComponents = {
    Balance,
    Address,
    PublicKey,
    Mnemonic,
    Chain,
    Network,
    Url,
    LogOut,
};
