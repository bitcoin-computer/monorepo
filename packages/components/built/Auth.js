import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Computer } from '@bitcoin-computer/lib';
import { initFlowbite } from 'flowbite';
import { HiRefresh } from 'react-icons/hi';
import { useUtilsComponents } from './UtilsContext';
import { Modal } from './Modal';
import { getEnv } from './common/utils';
function isLoggedIn() {
    return !!localStorage.getItem('BIP_39_KEY');
}
function logout() {
    localStorage.removeItem('BIP_39_KEY');
    localStorage.removeItem('CHAIN');
    localStorage.removeItem('NETWORK');
    localStorage.removeItem('PATH');
    localStorage.removeItem('URL');
    window.location.href = '/';
}
function getCoinType(chain, network) {
    if (['testnet', 'regtest'].includes(network))
        return 1;
    if (chain === 'BTC')
        return 0;
    if (chain === 'LTC')
        return 2;
    if (chain === 'DOGE')
        return 3;
    if (chain === 'PEPE')
        return 3434;
    if (chain === 'BCH')
        return 145;
    throw new Error(`Unsupported chain ${chain} or network ${network}`);
}
function getBip44Path({ purpose = 44, coinType = 2, account = 0 } = {}) {
    return `m/${purpose.toString()}'/${coinType.toString()}'/${account.toString()}'`;
}
function loggedOutConfiguration() {
    return {
        chain: getEnv('CHAIN'),
        network: getEnv('NETWORK'),
        url: getEnv('URL'),
        moduleStorageType: getEnv('MODULE_STORAGE_TYPE'),
        path: getEnv('PATH'),
    };
}
function loggedInConfiguration() {
    return {
        mnemonic: localStorage.getItem('BIP_39_KEY'),
        chain: (localStorage.getItem('CHAIN') || getEnv('CHAIN')),
        network: (localStorage.getItem('NETWORK') || getEnv('NETWORK')),
        url: localStorage.getItem('URL') || getEnv('URL'),
        moduleStorageType: getEnv('MODULE_STORAGE_TYPE'),
        path: localStorage.getItem('PATH') || getEnv('PATH') || getBip44Path(),
    };
}
function getComputer(options = {}) {
    const defaultConfiguration = isLoggedIn() ? loggedInConfiguration() : loggedOutConfiguration();
    return new Computer({ ...defaultConfiguration, ...options });
}
function MnemonicInput({ mnemonic, setMnemonic, }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("label", { className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "BIP 39 Mnemonic" }), _jsx(HiRefresh, { onClick: () => setMnemonic(new Computer().getMnemonic()), className: "w-4 h-4 ml-2 text-sm font-medium text-gray-900 dark:text-white inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100" })] }), _jsx("input", { value: mnemonic, onChange: (e) => setMnemonic(e.target.value), className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white", required: true })] }));
}
function ChainInput({ chain, setChain }) {
    return (_jsxs(_Fragment, { children: [_jsx("label", { className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Chain" }), _jsxs("fieldset", { className: "flex", children: [_jsx("legend", { className: "sr-only", children: "Chain" }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('LTC'), checked: chain === 'LTC', id: "chain-ltc", type: "radio", name: "chain", value: "LTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "chain-ltc", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300", children: "LTC" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('BTC'), checked: chain === 'BTC', id: "chain-btc", type: "radio", name: "chain", value: "BTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "chain-btc", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "BTC" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('PEPE'), id: "chain-pepe", type: "radio", name: "chain", value: "PEPE", className: "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "chain-pepe", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "PEPE" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setChain('DOGE'), id: "chain-doge", type: "radio", name: "chain", value: "DOGE", className: "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600", disabled: true }), _jsx("label", { htmlFor: "chain-doge", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "DOGE" })] })] })] }));
}
function NetworkInput({ network, setNetwork, }) {
    return (_jsxs(_Fragment, { children: [_jsx("label", { className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Network" }), _jsxs("fieldset", { className: "flex", children: [_jsx("legend", { className: "sr-only", children: "Network" }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setNetwork('mainnet'), checked: network === 'mainnet', id: "network-mainnet", type: "radio", name: "network", value: "Mainnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "network-mainnet", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300", children: "Mainnet" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setNetwork('testnet'), checked: network === 'testnet', id: "network-testnet", type: "radio", name: "network", value: "Testnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "network-testnet", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "Testnet" })] }), _jsxs("div", { className: "flex items-center mr-4", children: [_jsx("input", { onChange: () => setNetwork('regtest'), checked: network === 'regtest', id: "network-regtest", type: "radio", name: "network", value: "Regtest", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", { htmlFor: "network-regtest", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300", children: "Regtest" })] })] })] }));
}
function UrlInput({ urlInputRef }) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "mt-4 flex justify-between", children: _jsx("label", { className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Node Url" }) }), _jsx("input", { ref: urlInputRef, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" })] }));
}
function LoginButton({ mnemonic, chain, network, path, url, urlInputRef }) {
    const { showSnackBar } = useUtilsComponents();
    const login = (e) => {
        e.preventDefault();
        if (isLoggedIn())
            showSnackBar('A user is already logged in, please log out first.', false);
        if (mnemonic.length === 0)
            showSnackBar("Please don't use an empty mnemonic string.", false);
        localStorage.setItem('BIP_39_KEY', mnemonic);
        localStorage.setItem('CHAIN', chain);
        localStorage.setItem('NETWORK', network);
        localStorage.setItem('PATH', path);
        localStorage.setItem('URL', urlInputRef.current?.value || url);
        window.location.href = '/';
    };
    return (_jsx(_Fragment, { children: _jsx("button", { onClick: login, type: "submit", className: "w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800", children: "Log In" }) }));
}
function LoginForm() {
    const [mnemonic, setMnemonic] = useState(new Computer().getMnemonic());
    const [chain, setChain] = useState(getEnv('CHAIN'));
    const [network, setNetwork] = useState(getEnv('NETWORK'));
    const [url] = useState(getEnv('URL'));
    const urlInputRef = useRef(null);
    const [path] = useState(getEnv('PATH') || getBip44Path());
    useEffect(() => {
        initFlowbite();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "max-w-sm mx-auto p-4 md:p-5 space-y-4", children: _jsx("form", { className: "space-y-6", children: _jsxs("div", { children: [_jsx(MnemonicInput, { mnemonic: mnemonic, setMnemonic: setMnemonic }), !chain && _jsx(ChainInput, { chain: chain, setChain: setChain }), !network && _jsx(NetworkInput, { network: network, setNetwork: setNetwork }), !url && _jsx(UrlInput, { urlInputRef: urlInputRef })] }) }) }), _jsx("div", { className: "max-w-sm mx-auto flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600", children: _jsx(LoginButton, { mnemonic: mnemonic, chain: chain, network: network, url: url, path: path, urlInputRef: urlInputRef }) })] }));
}
function LoginModal() {
    return _jsx(Modal.Component, { title: "Sign in", content: LoginForm, id: "sign-in-modal", hideClose: true });
}
export const Auth = {
    isLoggedIn,
    logout,
    getCoinType,
    getBip44Path,
    defaultConfiguration: loggedOutConfiguration,
    browserConfiguration: loggedInConfiguration,
    getComputer,
    LoginForm,
    LoginModal,
};
