import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useContext, useEffect, useState } from 'react';
import { HiRefresh } from 'react-icons/hi';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { Auth } from './Auth';
import { Drawer } from './Drawer';
import { UtilsContext } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
import { getEnv } from './common/utils';
const Balance = ({ computer, modSpecs }) => {
    const [balance, setBalance] = useState(0n);
    const [, setChain] = useState(localStorage.getItem('CHAIN') || 'LTC');
    const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents();
    const refreshBalance = useCallback(async () => {
        try {
            showLoader(true);
            const publicKey = computer.getPublicKey();
            const balances = await Promise.all(modSpecs.map(async (mod) => {
                const paymentRevs = modSpecs ? await computer.query({ publicKey, mod }) : [];
                const payments = (await Promise.all(paymentRevs.map((rev) => computer.sync(rev))));
                return payments && payments.length
                    ? payments.reduce((total, pay) => total + (pay._amount - BigInt(computer.getMinimumFees())), 0n)
                    : 0;
            }));
            const amountsInPayments = balances.reduce((acc, curr) => acc + BigInt(curr), 0n);
            const walletBalance = await computer.getBalance();
            setBalance(walletBalance.balance + amountsInPayments);
            setChain(computer.getChain());
            showLoader(false);
        }
        catch (err) {
            showLoader(false);
            showSnackBar('Error fetching wallet details', false);
        }
    }, [computer]);
    const fund = async () => {
        await computer.faucet(1e8);
        setBalance((await computer.getBalance()).balance);
    };
    useEffect(() => {
        refreshBalance();
    }, []);
    return (_jsxs("div", { id: "dropdown-cta", className: "relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900", role: "alert", children: [_jsxs("div", { className: "text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400", children: [Number(balance) / 1e8, " ", computer.getChain(), ' ', _jsx(HiRefresh, { onClick: refreshBalance, className: "w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100" })] }), _jsx("div", { className: "text-center uppercase text-xs text-blue-800 dark:text-blue-400", children: computer.getNetwork() }), computer.getNetwork() === 'regtest' && (_jsx("button", { id: "fund-wallet", type: "button", onClick: fund, className: "absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800", children: "Fund" }))] }));
};
const Address = ({ computer }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(computer.getAddress());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset icon color after 2 seconds
    };
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Address" }), _jsx("button", { onClick: handleCopy, className: `ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`, "aria-label": "Copy address", children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400", children: computer.getAddress() })] }));
};
const PublicKey = ({ computer }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(computer.getPublicKey());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset icon color after 2 seconds
    };
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Public Key" }), _jsx("button", { onClick: handleCopy, className: `ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white`, "aria-label": "Copy public key", children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "mb-4 text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: computer.getPublicKey() })] }));
};
const Mnemonic = ({ computer }) => {
    const [mnemonicShown, setMnemonicShown] = useState(false);
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("h6", { className: "text-lg font-bold dark:text-white", children: ["Mnemonic\u00A0", _jsx("button", { onClick: () => setMnemonicShown(!mnemonicShown), className: "text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline", children: mnemonicShown ? 'hide' : 'show' })] }), _jsx("p", { className: "text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: mnemonicShown ? computer.getMnemonic() : '' })] }));
};
const Url = ({ computer }) => (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Node Url" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getUrl() })] }));
const Chain = ({ computer }) => (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Chain" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getChain() })] }));
const Network = ({ computer }) => (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Network" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getNetwork() })] }));
const LogOut = () => (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Log out" }), _jsx("p", { className: "mb-1 text-sm text-gray-500 dark:text-gray-400", children: "Logging out will delete your mnemonic. Make sure to write it down." })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: _jsx("button", { onClick: Auth.logout, className: "rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700", children: "Log out" }) })] }));
export function Wallet({ modSpecs }) {
    const computer = useContext(ComputerContext);
    const Content = () => (_jsxs(_Fragment, { children: [_jsx("h4", { className: "text-2xl font-bold dark:text-white", children: "Wallet" }), _jsx(Balance, { computer: computer, modSpecs: modSpecs || [] }), _jsx(Address, { computer: computer }), _jsx(PublicKey, { computer: computer }), _jsx(Mnemonic, { computer: computer }), !getEnv('CHAIN') && _jsx(Chain, { computer: computer }), !getEnv('NETWORK') && _jsx(Network, { computer: computer }), !getEnv('URL') && _jsx(Url, { computer: computer }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(LogOut, {})] }));
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
