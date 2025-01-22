var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useContext, useEffect, useState } from 'react';
import { HiRefresh } from 'react-icons/hi';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { Auth } from './Auth';
import { Drawer } from './Drawer';
import { UtilsContext } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
import { getEnv } from './common/utils';
var Balance = function (_a) {
    var computer = _a.computer, modSpecs = _a.modSpecs;
    var _b = useState(0), balance = _b[0], setBalance = _b[1];
    var _c = useState(localStorage.getItem('CHAIN') || 'LTC'), setChain = _c[1];
    var _d = UtilsContext.useUtilsComponents(), showSnackBar = _d.showSnackBar, showLoader = _d.showLoader;
    var refreshBalance = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var publicKey_1, balances, amountsInPayments, walletBalance, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    showLoader(true);
                    publicKey_1 = computer.getPublicKey();
                    return [4 /*yield*/, Promise.all(modSpecs.map(function (mod) { return __awaiter(void 0, void 0, void 0, function () {
                            var paymentRevs, _a, payments;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!modSpecs) return [3 /*break*/, 2];
                                        return [4 /*yield*/, computer.query({ publicKey: publicKey_1, mod: mod })];
                                    case 1:
                                        _a = _b.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _a = [];
                                        _b.label = 3;
                                    case 3:
                                        paymentRevs = _a;
                                        return [4 /*yield*/, Promise.all(paymentRevs.map(function (rev) { return computer.sync(rev); }))];
                                    case 4:
                                        payments = (_b.sent());
                                        return [2 /*return*/, payments && payments.length
                                                ? payments.reduce(function (total, pay) { return total + (pay._amount - computer.getMinimumFees()); }, 0)
                                                : 0];
                                }
                            });
                        }); }))];
                case 1:
                    balances = _a.sent();
                    amountsInPayments = balances.reduce(function (acc, curr) { return acc + curr; }, 0);
                    return [4 /*yield*/, computer.getBalance()];
                case 2:
                    walletBalance = _a.sent();
                    setBalance(walletBalance.balance + amountsInPayments);
                    setChain(computer.getChain());
                    showLoader(false);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    showLoader(false);
                    showSnackBar('Error fetching wallet details', false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [computer]);
    var fund = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, computer.faucet(1e8)];
                case 1:
                    _b.sent();
                    _a = setBalance;
                    return [4 /*yield*/, computer.getBalance()];
                case 2:
                    _a.apply(void 0, [(_b.sent()).balance]);
                    return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        refreshBalance();
    }, []);
    return (_jsxs("div", { id: "dropdown-cta", className: "relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900", role: "alert", children: [_jsxs("div", { className: "text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400", children: [balance / 1e8, " ", computer.getChain(), ' ', _jsx(HiRefresh, { onClick: refreshBalance, className: "w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100" })] }), _jsx("div", { className: "text-center uppercase text-xs text-blue-800 dark:text-blue-400", children: computer.getNetwork() }), computer.getNetwork() === 'regtest' && (_jsx("button", { type: "button", onClick: fund, className: "absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800", children: "Fund" }))] }));
};
var Address = function (_a) {
    var computer = _a.computer;
    var _b = useState(false), copied = _b[0], setCopied = _b[1];
    var handleCopy = function () {
        navigator.clipboard.writeText(computer.getAddress());
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2000); // Reset icon color after 2 seconds
    };
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Address" }), _jsx("button", { onClick: handleCopy, className: "ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white", "aria-label": "Copy address", children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400", children: computer.getAddress() })] }));
};
var PublicKey = function (_a) {
    var computer = _a.computer;
    var _b = useState(false), copied = _b[0], setCopied = _b[1];
    var handleCopy = function () {
        navigator.clipboard.writeText(computer.getPublicKey());
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2000); // Reset icon color after 2 seconds
    };
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Public Key" }), _jsx("button", { onClick: handleCopy, className: "ml-1 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white", "aria-label": "Copy public key", children: copied ? (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 dark:text-green-400" })) : (_jsx(FiCopy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "mb-4 text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: computer.getPublicKey() })] }));
};
var Mnemonic = function (_a) {
    var computer = _a.computer;
    var _b = useState(false), mnemonicShown = _b[0], setMnemonicShown = _b[1];
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("h6", { className: "text-lg font-bold dark:text-white", children: ["Mnemonic\u00A0", _jsx("button", { onClick: function () { return setMnemonicShown(!mnemonicShown); }, className: "text-xs font-mono font-normal text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline", children: mnemonicShown ? 'hide' : 'show' })] }), _jsx("p", { className: "text-xs font-mono text-gray-500 dark:text-gray-400 break-words", children: mnemonicShown ? computer.getMnemonic() : '' })] }));
};
var Url = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Node Url" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getUrl() })] }));
};
var Chain = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Chain" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getChain() })] }));
};
var Network = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", { className: "mb-4", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Network" }), _jsx("p", { className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words", children: computer.getNetwork() })] }));
};
var LogOut = function () { return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6", children: [_jsx("h6", { className: "text-lg font-bold dark:text-white", children: "Log out" }), _jsx("p", { className: "mb-1 text-sm text-gray-500 dark:text-gray-400", children: "Logging out will delete your mnemonic. Make sure to write it down." })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: _jsx("button", { onClick: Auth.logout, className: "rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700", children: "Log out" }) })] })); };
export function Wallet(_a) {
    var modSpecs = _a.modSpecs;
    var computer = useContext(ComputerContext);
    var Content = function () { return (_jsxs(_Fragment, { children: [_jsx("h4", { className: "text-2xl font-bold dark:text-white", children: "Wallet" }), _jsx(Balance, { computer: computer, modSpecs: modSpecs || [] }), _jsx(Address, { computer: computer }), _jsx(PublicKey, { computer: computer }), _jsx(Mnemonic, { computer: computer }), !getEnv('CHAIN') && _jsx(Chain, { computer: computer }), !getEnv('NETWORK') && _jsx(Network, { computer: computer }), !getEnv('URL') && _jsx(Url, { computer: computer }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(LogOut, {})] })); };
    return _jsx(Drawer.Component, { Content: Content, id: "wallet-drawer" });
}
export var WalletComponents = {
    Balance: Balance,
    Address: Address,
    PublicKey: PublicKey,
    Mnemonic: Mnemonic,
    Chain: Chain,
    Network: Network,
    Url: Url,
    LogOut: LogOut,
};
