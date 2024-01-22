var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Computer } from "@bitcoin-computer/lib";
import { useUtilsComponents } from "./UtilsContext";
import { Modal } from "./Modal";
import { initFlowbite } from "flowbite";
function isLoggedIn() {
    return !!localStorage.getItem("BIP_39_KEY");
}
function logout() {
    localStorage.removeItem("BIP_39_KEY");
    localStorage.removeItem("CHAIN");
    localStorage.removeItem("NETWORK");
    localStorage.removeItem("PATH");
    localStorage.removeItem("URL");
    window.location.href = "/";
}
function getCoinType(chain, network) {
    if (["testnet", "regtest"].includes(network))
        return 1;
    if (chain === "BTC")
        return 0;
    if (chain === "LTC")
        return 2;
    if (chain === "DOGE")
        return 3;
    if (chain === "BCH")
        return 145;
    throw new Error("Unsupported chain ".concat(chain, " or network ").concat(network));
}
function getBip44Path(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.purpose, purpose = _c === void 0 ? 44 : _c, _d = _b.coinType, coinType = _d === void 0 ? 2 : _d, _e = _b.account, account = _e === void 0 ? 0 : _e;
    return "m/".concat(purpose.toString(), "'/").concat(coinType.toString(), "'/").concat(account.toString(), "'");
}
function getPath(chain, network) {
    return getBip44Path({ coinType: getCoinType(chain, network) });
}
function getUrl(chain, network) {
    var index = "REACT_APP_".concat(chain.toUpperCase(), "_").concat(network.toUpperCase(), "_URL");
    var url = process.env[index];
    if (typeof url === "undefined")
        throw new Error("Cannot find a url for ".concat(chain.toUpperCase(), " ").concat(network.toUpperCase(), ", please provide a variable \"REACT_APP_").concat(chain.toUpperCase(), "_").concat(network.toUpperCase(), "_URL\" in your .env file"));
    return url;
}
function defaultConfiguration() {
    var chain = (process.env["REACT_APP_CHAIN"] || localStorage.getItem("CHAIN") || "LTC");
    var network = (process.env["REACT_APP_NETWORK"] ||
        localStorage.getItem("NETWORK") ||
        "regtest");
    var url = getUrl(chain, network);
    return { chain: chain, network: network, url: url };
}
function browserConfiguration() {
    var keys = ["BIP_39_KEY", "CHAIN", "NETWORK", "PATH", "URL"];
    var someKeyIsUndefined = keys.some(function (key) { return typeof localStorage.getItem(key) === "undefined"; });
    if (someKeyIsUndefined)
        throw new Error("Something went wrong, please log out and log in again");
    return {
        mnemonic: localStorage.getItem("BIP_39_KEY"),
        chain: localStorage.getItem("CHAIN"),
        network: localStorage.getItem("NETWORK"),
        path: localStorage.getItem("PATH"),
        url: localStorage.getItem("URL"),
    };
}
function getComputer() {
    var configuration = isLoggedIn() ? browserConfiguration() : defaultConfiguration();
    return new Computer(configuration);
}
function MnemonicInput(_a) {
    var mnemonic = _a.mnemonic, setMnemonic = _a.setMnemonic;
    var generateMnemonic = function (e) {
        e.stopPropagation();
        e.preventDefault();
        setMnemonic(new Computer().getMnemonic());
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", __assign({ className: "flex justify-between" }, { children: [_jsx("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "BIP 39 Mnemonic" })), _jsx("button", __assign({ onClick: generateMnemonic, className: "mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: "Generate in Browser" }))] })), _jsx("input", { value: mnemonic, onChange: function (e) { return setMnemonic(e.target.value); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white", required: true })] }));
}
function ChainInput(_a) {
    var chain = _a.chain, setChain = _a.setChain;
    return (_jsxs(_Fragment, { children: [_jsx("label", __assign({ className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Chain" })), _jsxs("fieldset", __assign({ className: "flex" }, { children: [_jsx("legend", __assign({ className: "sr-only" }, { children: "Chain" })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setChain("LTC"); }, checked: chain === "LTC", id: "chain-ltc", type: "radio", name: "chain", value: "LTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "chain-ltc", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "LTC" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setChain("BTC"); }, checked: chain === "BTC", id: "chain-btc", type: "radio", name: "chain", value: "BTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "chain-btc", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "BTC" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setChain("DOGE"); }, id: "chain-doge", type: "radio", name: "chain", value: "DOGE", className: "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600", disabled: true }), _jsx("label", __assign({ htmlFor: "chain-doge", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "DOGE" }))] }))] }))] }));
}
function NetworkInput(_a) {
    var network = _a.network, setNetwork = _a.setNetwork;
    return (_jsxs(_Fragment, { children: [_jsx("label", __assign({ className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Network" })), _jsxs("fieldset", __assign({ className: "flex" }, { children: [_jsx("legend", __assign({ className: "sr-only" }, { children: "Network" })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setNetwork("mainnet"); }, checked: network === "mainnet", id: "network-mainnet", type: "radio", name: "network", value: "Mainnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "network-mainnet", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "Mainnet" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setNetwork("testnet"); }, checked: network === "testnet", id: "network-testnet", type: "radio", name: "network", value: "Testnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "network-testnet", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "Testnet" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setNetwork("regtest"); }, checked: network === "regtest", id: "network-regtest", type: "radio", name: "network", value: "Regtest", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "network-regtest", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "Regtest" }))] }))] }))] }));
}
function PathInput(_a) {
    var chain = _a.chain, network = _a.network, path = _a.path, setPath = _a.setPath;
    var setDefaultPath = function (e) {
        e.stopPropagation();
        e.preventDefault();
        setPath(getPath(chain, network));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", __assign({ className: "mt-4 flex justify-between" }, { children: [_jsx("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Path" })), _jsx("button", __assign({ onClick: setDefaultPath, className: "mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: "Update BIP 44 Path" }))] })), _jsx("input", { value: path, onChange: function (e) { return setPath(e.target.value); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" })] }));
}
function UrlInput(_a) {
    var chain = _a.chain, network = _a.network, url = _a.url, setUrl = _a.setUrl;
    var setDefaultUrl = function (e) {
        e.stopPropagation();
        e.preventDefault();
        setUrl(getUrl(chain, network));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", __assign({ className: "mt-4 flex justify-between" }, { children: [_jsx("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Node Url" })), _jsx("button", __assign({ onClick: setDefaultUrl, className: "mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: "Update Node Url" }))] })), _jsx("input", { value: url, onChange: function (e) { return setUrl(e.target.value); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" })] }));
}
function LoginButton(_a) {
    var mnemonic = _a.mnemonic, chain = _a.chain, network = _a.network, path = _a.path, url = _a.url;
    var showSnackBar = useUtilsComponents().showSnackBar;
    var login = function (e) {
        e.preventDefault();
        try {
            if (isLoggedIn())
                throw new Error("A user is already logged in, please log out first.");
            if (mnemonic.length === 0)
                throw new Error("Please don't use an empty mnemonic string.");
            new Computer({ mnemonic: mnemonic, chain: chain, network: network, path: path, url: url });
        }
        catch (error) {
            if (error instanceof Error) {
                showSnackBar(error.message, false);
            }
            return;
        }
        localStorage.setItem("BIP_39_KEY", mnemonic);
        localStorage.setItem("CHAIN", chain);
        localStorage.setItem("NETWORK", network);
        localStorage.setItem("PATH", path);
        localStorage.setItem("URL", url);
        window.location.href = "/";
    };
    return (_jsx(_Fragment, { children: _jsx("button", __assign({ onClick: login, type: "submit", className: "w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" }, { children: "Log In" })) }));
}
function LoginForm() {
    var _a = useState(""), mnemonic = _a[0], setMnemonic = _a[1];
    var _b = useState("LTC"), chain = _b[0], setChain = _b[1];
    var _c = useState("regtest"), network = _c[0], setNetwork = _c[1];
    var _d = useState(getPath(chain, network)), path = _d[0], setPath = _d[1];
    var _e = useState(getUrl(chain, network)), url = _e[0], setUrl = _e[1];
    useEffect(function () {
        initFlowbite();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", __assign({ className: "p-4 md:p-5 space-y-4" }, { children: _jsx("form", __assign({ className: "space-y-6" }, { children: _jsxs("div", { children: [_jsx(MnemonicInput, { mnemonic: mnemonic, setMnemonic: setMnemonic }), _jsx(ChainInput, { chain: chain, setChain: setChain }), _jsx(NetworkInput, { network: network, setNetwork: setNetwork }), _jsx(PathInput, { chain: chain, network: network, path: path, setPath: setPath }), _jsx(UrlInput, { chain: chain, network: network, url: url, setUrl: setUrl })] }) })) })), _jsx("div", __assign({ className: "flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600" }, { children: _jsx(LoginButton, { mnemonic: mnemonic, chain: chain, network: network, path: path, url: url }) }))] }));
}
function LoginModal() {
    return _jsx(Modal.Component, { title: "Sign in", content: LoginForm, id: "sign-in-modal" });
}
export var Auth = {
    isLoggedIn: isLoggedIn,
    logout: logout,
    getCoinType: getCoinType,
    getBip44Path: getBip44Path,
    getUrl: getUrl,
    defaultConfiguration: defaultConfiguration,
    browserConfiguration: browserConfiguration,
    getComputer: getComputer,
    LoginForm: LoginForm,
    LoginModal: LoginModal,
};
