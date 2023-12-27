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
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Computer } from "@bitcoin-computer/lib";
import { SnackBar } from "./SnackBar";
import { Modal } from "./Modal";
import { Modal as ModalClass } from "flowbite";
import { initFlowbite } from "flowbite";
export function isLoggedIn() {
    return (!!localStorage.getItem("BIP_39_KEY") && !!localStorage.getItem("CHAIN"));
}
export function logout() {
    localStorage.removeItem("BIP_39_KEY");
    localStorage.removeItem("CHAIN");
    localStorage.removeItem("NETWORK");
    localStorage.removeItem("PATH");
    localStorage.removeItem("URL");
    window.location.href = "/";
}
export function getCoinType(chain, network) {
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
export function getBip44Path(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.purpose, purpose = _c === void 0 ? 44 : _c, _d = _b.coinType, coinType = _d === void 0 ? 2 : _d, _e = _b.account, account = _e === void 0 ? 0 : _e;
    return "m/".concat(purpose.toString(), "'/").concat(coinType.toString(), "'/").concat(account.toString(), "'");
}
export function getPath(chain, network) {
    return getBip44Path({ coinType: getCoinType(chain, network) });
}
export function getUrl(chain, network) {
    if (chain !== "LTC")
        return "";
    return network === "testnet"
        ? "https://node.bitcoincomputer.io"
        : "http://127.0.0.1:1031";
}
export function getComputer() {
    return new Computer({
        mnemonic: localStorage.getItem("BIP_39_KEY") || "",
        chain: localStorage.getItem("CHAIN") || "",
        network: localStorage.getItem("NETWORK") || "",
        path: localStorage.getItem("PATH") || "",
        url: localStorage.getItem("URL") || "",
    });
}
export function LoginButton(_a) {
    var mnemonic = _a.mnemonic, chain = _a.chain, network = _a.network, path = _a.path, url = _a.url;
    var _b = useState(false), show = _b[0], setShow = _b[1];
    var _c = useState(false), success = _c[0], setSuccess = _c[1];
    var _d = useState(""), message = _d[0], setMessage = _d[1];
    var login = function () {
        if (!mnemonic) {
            setMessage("Please provide valid password");
            setSuccess(false);
            setShow(true);
            return;
        }
        localStorage.setItem("BIP_39_KEY", mnemonic);
        localStorage.setItem("CHAIN", chain);
        localStorage.setItem("NETWORK", network);
        localStorage.setItem("PATH", path);
        localStorage.setItem("URL", url);
        var $targetEl = document.getElementById("sign-in-modal");
        var instanceOptions = { id: "sign-in-modal", override: true };
        var modal = new ModalClass($targetEl, {}, instanceOptions);
        modal.hide();
        window.location.href = "/";
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", __assign({ onClick: login, type: "submit", className: "w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" }, { children: "Log In" })), show && (_jsx(SnackBar, { message: message, success: success, setShow: setShow }))] }));
}
export function LoginForm() {
    var _a = useState(""), mnemonic = _a[0], setMnemonic = _a[1];
    var _b = useState("LTC"), chain = _b[0], setChain = _b[1];
    var _c = useState("regtest"), network = _c[0], setNetwork = _c[1];
    var _d = useState(getPath(chain, network)), path = _d[0], setPath = _d[1];
    var _e = useState(getUrl(chain, network)), url = _e[0], setUrl = _e[1];
    useEffect(function () {
        initFlowbite();
    }, []);
    var generateMnemonic = function (e) {
        e.stopPropagation();
        e.preventDefault();
        setMnemonic(new Computer().getMnemonic());
    };
    var setDefaultPath = function (e) {
        console.log("setDefaultPath", chain, network);
        e.stopPropagation();
        e.preventDefault();
        setPath(getPath(chain, network));
    };
    var setDefaultUrl = function (e) {
        console.log("setDefaultPath", chain, network);
        e.stopPropagation();
        e.preventDefault();
        setUrl(getUrl(chain, network));
    };
    var body = function () { return (_jsx(_Fragment, { children: _jsx("form", __assign({ className: "space-y-6", action: "#" }, { children: _jsxs("div", { children: [_jsxs("div", __assign({ className: "flex justify-between" }, { children: [_jsx("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "BIP 39 Mnemonic" })), _jsx("button", __assign({ onClick: generateMnemonic, className: "mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: "Generate in Browser" }))] })), _jsx("input", { value: mnemonic, onChange: function (e) { return setMnemonic(e.target.value); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white", required: true }), _jsx("label", __assign({ className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Chain" })), _jsxs("fieldset", __assign({ className: "flex" }, { children: [_jsx("legend", __assign({ className: "sr-only" }, { children: "Chain" })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setChain("LTC"); }, checked: chain === "LTC", id: "chain-ltc", type: "radio", name: "chain", value: "LTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "chain-ltc", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "LTC" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setChain("BTC"); }, checked: chain === "BTC", id: "chain-btc", type: "radio", name: "chain", value: "BTC", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "chain-btc", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "BTC" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setChain("DOGE"); }, id: "chain-doge", type: "radio", name: "chain", value: "DOGE", className: "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600", disabled: true }), _jsx("label", __assign({ htmlFor: "chain-doge", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "DOGE" }))] }))] })), _jsx("label", __assign({ className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Network" })), _jsxs("fieldset", __assign({ className: "flex" }, { children: [_jsx("legend", __assign({ className: "sr-only" }, { children: "Network" })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setNetwork("mainnet"); }, checked: network === "mainnet", id: "network-mainnet", type: "radio", name: "network", value: "Mainnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "network-mainnet", className: "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "Mainnet" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setNetwork("testnet"); }, checked: network === "testnet", id: "network-testnet", type: "radio", name: "network", value: "Testnet", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "network-testnet", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "Testnet" }))] })), _jsxs("div", __assign({ className: "flex items-center mr-4" }, { children: [_jsx("input", { onChange: function () { return setNetwork("regtest"); }, checked: network === "regtest", id: "network-regtest", type: "radio", name: "network", value: "Regtest", className: "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600" }), _jsx("label", __assign({ htmlFor: "network-regtest", className: "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" }, { children: "Regtest" }))] }))] })), _jsxs("div", __assign({ className: "mt-4 flex justify-between" }, { children: [_jsx("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Path" })), _jsx("button", __assign({ onClick: setDefaultPath, className: "mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: "Update BIP 44 Path" }))] })), _jsx("input", { value: path, onChange: function (e) { return setPath(e.target.value); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" }), _jsxs("div", __assign({ className: "mt-4 flex justify-between" }, { children: [_jsx("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "Node Url" })), _jsx("button", __assign({ onClick: setDefaultUrl, className: "mb-2 text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: "Update Node Url" }))] })), _jsx("input", { value: url, onChange: function (e) { return setUrl(e.target.value); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" })] }) })) })); };
    var footer = function () { return (_jsx(LoginButton, { mnemonic: mnemonic, chain: chain, network: network, path: path, url: url })); };
    return (_jsxs(_Fragment, { children: [_jsx("div", __assign({ className: "p-4 md:p-5 space-y-4" }, { children: body() })), _jsx("div", __assign({ className: "flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600" }, { children: footer() }))] }));
}
export function LoginModal() {
    return _jsx(Modal, { title: "Sign in", content: LoginForm, id: "sign-in-modal" });
}