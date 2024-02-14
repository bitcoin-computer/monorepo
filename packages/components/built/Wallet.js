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
        while (_) try {
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
import { useCallback, useEffect, useState } from "react";
import { HiRefresh } from "react-icons/hi";
import { Auth } from "./Auth";
import { Drawer } from "./Drawer";
import { UtilsContext } from "./UtilsContext";
var Balance = function (_a) {
    var computer = _a.computer;
    var _b = useState(0), balance = _b[0], setBalance = _b[1];
    var _c = useState(localStorage.getItem("CHAIN") || "LTC"), chain = _c[0], setChain = _c[1];
    var showSnackBar = UtilsContext.useUtilsComponents().showSnackBar;
    var refreshBalance = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    if (!computer) return [3 /*break*/, 2];
                    _a = setBalance;
                    return [4 /*yield*/, computer.getBalance()];
                case 1:
                    _a.apply(void 0, [_b.sent()]);
                    setChain(computer.getChain());
                    _b.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    showSnackBar("Error fetching wallet details", false);
                    console.log("Error fetching wallet details", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [computer]);
    useEffect(function () {
        refreshBalance();
    }, []);
    return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsxs("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: ["Balance", _jsx(HiRefresh, { onClick: refreshBalance, className: "w-4 h-4 ml-1 inline cursor-pointer text-gray-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-100" })] })), _jsxs("p", __assign({ className: "mb-4 font-mono text-xs text-gray-500 dark:text-gray-400" }, { children: [balance / 1e8, " ", chain, " "] }))] })));
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
    else
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
var LogOut = function () {
    return (_jsxs(_Fragment, { children: [_jsxs("div", __assign({ className: "mb-6" }, { children: [_jsx("h6", __assign({ className: "text-lg font-bold dark:text-white" }, { children: "Log out" })), _jsx("p", __assign({ className: "mb-1 text-sm text-gray-500 dark:text-gray-400" }, { children: "Logging out will delete your mnemonic. Make sure to write it down." }))] })), _jsx("div", __assign({ className: "grid grid-cols-2 gap-4" }, { children: _jsx("button", __assign({ onClick: Auth.logout, className: "rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700" }, { children: "Log out" })) }))] }));
};
export function Wallet() {
    var computer = useState(Auth.getComputer())[0];
    var Content = function () { return (_jsxs(_Fragment, { children: [_jsx("h4", __assign({ className: "mb-8 text-2xl font-bold dark:text-white" }, { children: "Wallet" })), _jsx(Balance, { computer: computer }), _jsx(Address, { computer: computer }), _jsx(PublicKey, { computer: computer }), _jsx(Path, { computer: computer }), _jsx(Mnemonic, { computer: computer }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(Chain, { computer: computer }), _jsx(Network, { computer: computer }), _jsx(Url, { computer: computer }), _jsx("hr", { className: "h-px my-6 bg-gray-200 border-0 dark:bg-gray-700" }), _jsx(LogOut, {})] })); };
    return _jsx(Drawer.Component, { Content: Content, id: "wallet-drawer" });
}
