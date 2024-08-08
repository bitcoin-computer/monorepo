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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
import { initFlowbite } from "flowbite";
import { useCallback, useContext, useEffect, useState } from "react";
import { HiRefresh } from "react-icons/hi";
import { Auth } from "./Auth";
import { Drawer } from "./Drawer";
import { useUtilsComponents, UtilsContext } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";
var Balance = function (_a) {
    var computer = _a.computer, paymentModSpec = _a.paymentModSpec;
    var _b = useState(0), balance = _b[0], setBalance = _b[1];
    var _c = useState(localStorage.getItem("CHAIN") || "LTC"), _ = _c[0], setChain = _c[1];
    var _d = UtilsContext.useUtilsComponents(), showSnackBar = _d.showSnackBar, showLoader = _d.showLoader;
    var refreshBalance = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var paymentRevs, _a, payments, amountsInPaymentToken_1, availableWalletBalance, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    showLoader(true);
                    if (!computer) return [3 /*break*/, 6];
                    if (!paymentModSpec) return [3 /*break*/, 2];
                    return [4 /*yield*/, computer.query({
                            publicKey: computer.getPublicKey(),
                            mod: paymentModSpec
                        })];
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
                    amountsInPaymentToken_1 = 0;
                    if (payments && payments.length) {
                        payments.forEach(function (pay) {
                            amountsInPaymentToken_1 += pay._amount - computer.getMinimumFees();
                        });
                    }
                    return [4 /*yield*/, computer.getBalance()];
                case 5:
                    availableWalletBalance = _b.sent();
                    setBalance(availableWalletBalance + amountsInPaymentToken_1);
                    setChain(computer.getChain());
                    _b.label = 6;
                case 6:
                    showLoader(false);
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _b.sent();
                    showLoader(false);
                    showSnackBar("Error fetching wallet details", false);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
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
                    _a.apply(void 0, [_b.sent()]);
                    return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        refreshBalance();
    }, []);
    return (_jsxs("div", __assign({ id: "dropdown-cta", className: "relative flex flex-col p-6 my-4 rounded-lg bg-blue-50 dark:bg-blue-900", role: "alert" }, { children: [_jsxs("div", __assign({ className: "text-center mb-1 text-2xl font-bold text-blue-800 dark:text-blue-400" }, { children: [balance / 1e8, " ", computer.getChain(), " ", _jsx(HiRefresh, { onClick: refreshBalance, className: "w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100" })] })), _jsx("div", __assign({ className: "text-center uppercase text-xs text-blue-800 dark:text-blue-400" }, { children: computer.getNetwork() })), _jsx("button", __assign({ type: "button", onClick: fund, className: "absolute bottom-2 right-2 px-1 py-1 text-center text-xs font-medium text-center text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800" }, { children: "Fund" }))] })));
};
var Address = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Address" })), _jsx("p", __assign({ className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400" }, { children: computer.getAddress() }))] })));
};
var PublicKey = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Public Key" })), _jsx("p", __assign({ className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words" }, { children: computer.getPublicKey() }))] })));
};
var Mnemonic = function (_a) {
    var computer = _a.computer;
    var _b = useState(false), showMnemonic = _b[0], setShowMnemonic = _b[1];
    var Heading = function () { return _jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Mnemonic" })); };
    if (showMnemonic)
        return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx(Heading, {}), _jsx("p", __assign({ className: "mb-1 font-mono text-xs text-gray-500 dark:text-gray-400 break-words" }, { children: computer.getMnemonic() })), _jsx("button", __assign({ onClick: function () { return setShowMnemonic(false); }, className: "text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline" }, { children: "Hide" }))] })));
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx(Heading, {}), _jsx("button", __assign({ onClick: function () { return setShowMnemonic(true); }, className: "text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 underline" }, { children: "Show" })), _jsx("br", {})] })));
};
var Path = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Path" })), _jsx("p", __assign({ className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words" }, { children: computer.getPath() }))] })));
};
var Url = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Node Url" })), _jsx("p", __assign({ className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words" }, { children: computer.getUrl() }))] })));
};
var Chain = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Chain" })), _jsx("p", __assign({ className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words" }, { children: computer.getChain() }))] })));
};
var Network = function (_a) {
    var computer = _a.computer;
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Network" })), _jsx("p", __assign({ className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400 break-words" }, { children: computer.getNetwork() }))] })));
};
var LogOut = function () { return (_jsxs(_Fragment, { children: [_jsxs("div", __assign({ className: "mb-6" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Log out" })), _jsx("p", __assign({ className: "mb-1 text-sm text-gray-500 dark:text-gray-400" }, { children: "Logging out will delete your mnemonic. Make sure to write it down." }))] })), _jsx("div", __assign({ className: "grid grid-cols-2 gap-4" }, { children: _jsx("button", __assign({ onClick: Auth.logout, className: "rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" }, { children: "Log out" })) }))] })); };
function AmountInput(_a) {
    var chain = _a.chain, amount = _a.amount, setAmount = _a.setAmount;
    return (_jsxs(_Fragment, { children: [_jsx("div", __assign({ className: "mt-4 flex justify-between" }, { children: _jsxs("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: ["Amount (", chain, ")"] })) })), _jsx("input", { value: amount, onChange: function (e) { return setAmount(e.target.value); }, placeholder: "1 ".concat(chain), className: "block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" })] }));
}
function AddressInput(_a) {
    var address = _a.address, setAddress = _a.setAddress;
    return (_jsxs(_Fragment, { children: [_jsx("div", __assign({ className: "mt-4 flex justify-between" }, { children: _jsx("label", __assign({ className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: "User Address" })) })), _jsx("input", { value: address, placeholder: "Address", onChange: function (e) { return setAddress(e.target.value); }, className: "block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" })] }));
}
function SendMoneyButton(_a) {
    var _this = this;
    var computer = _a.computer, amount = _a.amount, address = _a.address, setAmount = _a.setAmount, setAddress = _a.setAddress, paymentModSpec = _a.paymentModSpec;
    var _b = useUtilsComponents(), showSnackBar = _b.showSnackBar, showLoader = _b.showLoader;
    var send = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var TRANSACTION_FEE, floatAmount, availableWalletBalance, requiredAmountToBeTransferred, paymentRevs, _a, payments, amountsInPaymentToken_2, sortedPayments, paymentsToBeWithdraw, newAvailableAmount, i, pay, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    TRANSACTION_FEE = computer.getMinimumFees();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 12, , 13]);
                    if (!Auth.isLoggedIn())
                        throw new Error("Please log in first.");
                    if (!address) {
                        showSnackBar("Please enter a valid address", false);
                        return [2 /*return*/];
                    }
                    floatAmount = Math.round(Number(amount));
                    if (!floatAmount) {
                        showSnackBar("Please enter a valid amount", false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, computer.getBalance()];
                case 2:
                    availableWalletBalance = _b.sent();
                    requiredAmountToBeTransferred = floatAmount * 1e8;
                    if (!(requiredAmountToBeTransferred + TRANSACTION_FEE < availableWalletBalance)) return [3 /*break*/, 4];
                    return [4 /*yield*/, computer.send(requiredAmountToBeTransferred, address)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 4:
                    if (!paymentModSpec) return [3 /*break*/, 6];
                    return [4 /*yield*/, computer.query({
                            publicKey: computer.getPublicKey(),
                            mod: paymentModSpec
                        })];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = [];
                    _b.label = 7;
                case 7:
                    paymentRevs = _a;
                    return [4 /*yield*/, Promise.all(paymentRevs.map(function (rev) { return computer.sync(rev); }))];
                case 8:
                    payments = (_b.sent()) // should import payment class
                    ;
                    amountsInPaymentToken_2 = 0;
                    if (payments && payments.length) {
                        payments.forEach(function (pay) {
                            amountsInPaymentToken_2 += pay._amount - TRANSACTION_FEE;
                        });
                    }
                    if (requiredAmountToBeTransferred + TRANSACTION_FEE >
                        availableWalletBalance + amountsInPaymentToken_2) {
                        showSnackBar("Insufficient Balance.", false);
                        setAmount("");
                        setAddress("");
                        return [2 /*return*/];
                    }
                    sortedPayments = payments.slice().sort(function (a, b) { return b._amount - a._amount; });
                    paymentsToBeWithdraw = [];
                    newAvailableAmount = 0;
                    for (i = 0; i < sortedPayments.length; i++) {
                        pay = sortedPayments[i];
                        newAvailableAmount += pay._amount - TRANSACTION_FEE;
                        paymentsToBeWithdraw.push(pay.setAmount(TRANSACTION_FEE));
                        if (requiredAmountToBeTransferred + TRANSACTION_FEE <
                            availableWalletBalance + newAvailableAmount) {
                            break;
                        }
                    }
                    return [4 /*yield*/, Promise.all(paymentsToBeWithdraw)];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, computer.send(requiredAmountToBeTransferred, address)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11:
                    showSnackBar("".concat(amount, " ").concat(computer.getChain(), " trasferred successfully."), true);
                    setAmount("");
                    setAddress("");
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _b.sent();
                    if (error_1 instanceof Error) {
                        showSnackBar(error_1.message, false);
                    }
                    return [2 /*return*/];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    return (_jsx(_Fragment, { children: _jsx("button", __assign({ onClick: function (e) { return __awaiter(_this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            showLoader(true);
                            return [4 /*yield*/, send(e)];
                        case 1:
                            _a.sent();
                            showLoader(false);
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            showLoader(false);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); }, type: "submit", className: "px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" }, { children: "Send (To Address)" })) }));
}
function SendMoneyForm(_a) {
    var computer = _a.computer, paymentModSpec = _a.paymentModSpec;
    var _b = useState(""), address = _b[0], setAddress = _b[1];
    var _c = useState(""), amount = _c[0], setAmount = _c[1];
    useEffect(function () {
        initFlowbite();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Transfer" })), _jsx("div", __assign({ className: "space-y-4" }, { children: _jsx("form", __assign({ className: "space-y-6" }, { children: _jsxs("div", { children: [_jsx(AddressInput, { address: address, setAddress: setAddress }), _jsx(AmountInput, { chain: computer.getChain(), amount: amount, setAmount: setAmount })] }) })) })), _jsx("div", __assign({ className: "flex items-center pt-4 rounded-b dark:border-gray-600" }, { children: _jsx(SendMoneyButton, { address: address, amount: amount, computer: computer, paymentModSpec: paymentModSpec, setAddress: setAddress, setAmount: setAmount }) }))] }));
}
export function Wallet(_a) {
    var paymentModSpec = _a.paymentModSpec;
    var computer = useContext(ComputerContext);
    var Content = function () { return (_jsxs(_Fragment, { children: [_jsx("h4", __assign({ className: "mb-8 text-2xl font-bold dark:text-white" }, { children: "Wallet" })), _jsx(Balance, { computer: computer, paymentModSpec: paymentModSpec }), _jsx(Address, { computer: computer }), _jsx(PublicKey, { computer: computer }), _jsx(Path, { computer: computer }), _jsx(Mnemonic, { computer: computer }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(Chain, { computer: computer }), _jsx(Network, { computer: computer }), _jsx(Url, { computer: computer }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(SendMoneyForm, { computer: computer, paymentModSpec: paymentModSpec }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(LogOut, {})] })); };
    return _jsx(Drawer.Component, { Content: Content, id: "wallet-drawer" });
}
export var WalletComponents = {
    Balance: Balance,
    Address: Address,
    PublicKey: PublicKey,
    Path: Path,
    Mnemonic: Mnemonic,
    Chain: Chain,
    Network: Network,
    Url: Url,
    SendMoneyForm: SendMoneyForm,
    LogOut: LogOut
};
