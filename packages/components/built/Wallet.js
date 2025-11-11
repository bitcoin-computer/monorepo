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
const Loader = () => (_jsxs("span", { role: "status", children: [_jsxs("svg", { "aria-hidden": "true", className: "inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentFill" })] }), _jsx("span", { className: "sr-only", children: "Loading..." })] }));
const BalanceDisplay = ({ balance, chain, network, isRegtest, isRefreshing, onRefresh, onFund, }) => (_jsxs("div", { id: "dropdown-cta", className: "relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900", role: "alert", children: [_jsxs("div", { className: "text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400", children: [bigIntToStr(balance), " ", chain, ' ', _jsx(HiRefresh, { onClick: onRefresh, className: `w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100 ${isRefreshing ? 'animate-spin' : ''}` })] }), _jsx("div", { className: "text-center uppercase text-xs text-blue-800 dark:text-blue-400", children: network }), isRegtest && (_jsx("button", { id: "fund-wallet", type: "button", onClick: onFund, className: "absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800", children: "Fund" }))] }));
const Withdraw = ({ computer, paymentsWrapper: payments, onSuccess, }) => {
    const { showSnackBar } = UtilsContext.useUtilsComponents();
    const [address, setAddress] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const handleWithdraw = async () => {
        try {
            setWithdrawing(true);
            if (!address || !address.trim()) {
                showSnackBar('Please input valid address', false);
                return;
            }
            const revs = payments.map((p) => p._rev);
            await computer.delete(revs);
            const { balance } = await computer.getBalance();
            const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')));
            await computer.send(balance - minDust, address);
            setAddress('');
            if (onSuccess)
                await onSuccess();
        }
        catch (err) {
            if (err instanceof Error)
                showSnackBar(`Something went wrong, ${err.message}`, false);
        }
        finally {
            setWithdrawing(false);
        }
    };
    return (_jsxs("div", { className: "my-2", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Withdraw to Address" }), _jsxs("div", { className: "flex items-center space-x-2 my-2", children: [_jsx("input", { type: "text", value: address, onChange: (e) => setAddress(e.target.value), className: "block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500", placeholder: "Recipient Address" }), _jsx("button", { type: "button", onClick: handleWithdraw, disabled: withdrawing, className: "px-3 py-1.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", children: withdrawing ? _jsx(Loader, {}) : _jsx(_Fragment, { children: "Withdraw" }) })] })] }));
};
const Balance = ({ computer, modSpecs, isOpen, }) => {
    const [balance, setBalance] = useState(0n);
    const [paymentsWrapper, setPaymentsWrapper] = useState([]);
    const { showSnackBar } = UtilsContext.useUtilsComponents();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshBalance = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const publicKey = computer.getPublicKey();
            const allPayments = [];
            const balances = await Promise.all(modSpecs.map(async (mod) => {
                const paymentRevs = await computer.getOUTXOs({ publicKey, mod });
                const payments = (await Promise.all(paymentRevs.map((rev) => computer.sync(rev))));
                allPayments.push(...payments);
                const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')));
                return payments && payments.length
                    ? payments.reduce((total, pay) => total + (pay._satoshis - minDust), 0n)
                    : 0n;
            }));
            const amountsInPayments = balances.reduce((acc, curr) => acc + curr, 0n);
            const walletBalance = await computer.getBalance();
            setBalance(walletBalance.balance + amountsInPayments);
            setPaymentsWrapper(allPayments);
        }
        catch {
            showSnackBar('Error fetching wallet details', false);
        }
        finally {
            setIsRefreshing(false);
        }
    }, [computer, modSpecs, showSnackBar]);
    const fund = async () => {
        setIsRefreshing(true);
        try {
            const amount = computer.getChain() === 'PEPE' ? 10e8 : 1e8;
            await computer.faucet(amount);
            await refreshBalance();
        }
        catch (err) {
            if (err instanceof Error) {
                showSnackBar(`Error funding wallet: ${err.message}`, false);
            }
        }
        finally {
            setIsRefreshing(false);
        }
    };
    useEffect(() => {
        if (isOpen)
            refreshBalance();
    }, [isOpen, refreshBalance]);
    return (_jsxs(_Fragment, { children: [_jsx(BalanceDisplay, { balance: balance, chain: computer.getChain(), network: computer.getNetwork(), isRegtest: computer.getNetwork() === 'regtest', isRefreshing: isRefreshing, onRefresh: refreshBalance, onFund: fund }), _jsx(Address, { computer: computer }), !!VITE_WITHDRAW_MOD_SPEC && (_jsx(Withdraw, { computer: computer, paymentsWrapper: paymentsWrapper, onSuccess: refreshBalance }))] }));
};
const CopyableField = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsxs("div", { className: "my-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: label }), _jsx("button", { onClick: handleCopy, className: "ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white", "aria-label": `Copy ${label.toLowerCase()}`, children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "my-2 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: value })] }));
};
const Address = ({ computer }) => (_jsx(CopyableField, { label: "Deposit Address", value: computer.getAddress() }));
const PublicKey = ({ computer }) => (_jsx(CopyableField, { label: "Public Key", value: computer.getPublicKey() }));
const RevealableField = ({ label, getValue }) => {
    const [shown, setShown] = useState(false);
    return (_jsxs("div", { className: "my-2", children: [_jsxs("h6", { className: "text-lg font-bold dark:text-white", children: [label, ' ', _jsx("button", { onClick: () => setShown(!shown), className: "text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline", children: shown ? 'hide' : 'show' })] }), _jsx("p", { className: "text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: shown ? getValue() : '' })] }));
};
const Mnemonic = ({ computer }) => (_jsx(RevealableField, { label: "Mnemonic", getValue: computer.getMnemonic }));
const SimpleField = ({ label, value }) => (_jsxs("div", { className: "my-2", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: label }), _jsx("p", { className: "my-2 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: value })] }));
const Url = ({ computer }) => (_jsx(SimpleField, { label: "Node Url", value: computer.getUrl() }));
const Chain = ({ computer }) => (_jsx(SimpleField, { label: "Chain", value: computer.getChain() }));
const Network = ({ computer }) => (_jsx(SimpleField, { label: "Network", value: computer.getNetwork() }));
const Path = ({ computer }) => (_jsx(SimpleField, { label: "Path", value: computer.getPath() }));
const LogOut = () => (_jsxs(_Fragment, { children: [_jsxs("div", { className: "my-2", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Log Out" }), _jsx("p", { className: "mb-1 text-sm text-gray-500 dark:text-gray-400", children: "Logging out will delete your mnemonic. Make sure to write it down." })] }), _jsx("button", { type: "button", onClick: Auth.logout, className: "px-3 py-1.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", children: "Log Out" })] }));
export function Wallet({ modSpecs }) {
    const computer = useContext(ComputerContext);
    const Content = ({ isOpen }) => (_jsxs(_Fragment, { children: [_jsx("h4", { className: "text-2xl font-bold dark:text-white", children: "Wallet" }), _jsx(Balance, { computer: computer, modSpecs: modSpecs || [], isOpen: isOpen }), _jsx(PublicKey, { computer: computer }), _jsx(Mnemonic, { computer: computer }), !getEnv('CHAIN') && _jsx(Chain, { computer: computer }), !getEnv('NETWORK') && _jsx(Network, { computer: computer }), !getEnv('URL') && _jsx(Url, { computer: computer }), !getEnv('PATH') && _jsx(Path, { computer: computer }), _jsx("hr", { className: "h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(LogOut, {})] }));
    return _jsx(Drawer.Component, { Content: Content, id: "wallet-drawer" });
}
