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
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { Computer } from '@bitcoin-computer/lib';
import { Card } from './Card';
import { ComputerContext } from './ComputerContext';
function ExpressionCard(_a) {
    var content = _a.content, env = _a.env;
    var entries = Object.entries(env);
    var formattedContent = content;
    entries.forEach(function (entry) {
        var name = entry[0], rev = entry[1];
        var regExp = new RegExp("(".concat(name, ")"), 'g');
        var replacer = function (n, ind) { return (_jsx(Link, { to: "/objects/".concat(rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: n }, "".concat(rev, "|").concat(ind))); };
        formattedContent = reactStringReplace(formattedContent, regExp, replacer);
    });
    return _jsx(Card, { content: formattedContent });
}
function Component() {
    var _this = this;
    var location = useLocation();
    var params = useParams();
    var computer = useContext(ComputerContext);
    var _a = useState(params.txn), txn = _a[0], setTxn = _a[1];
    var _b = useState(null), txnData = _b[0], setTxnData = _b[1];
    var _c = useState(null), rpcTxnData = _c[0], setRPCTxnData = _c[1];
    var _d = useState(null), transition = _d[0], setTransition = _d[1];
    useEffect(function () {
        var fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var hex, tx, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setTxn(params.txn);
                        return [4 /*yield*/, computer.wallet.restClient.getRawTxs([params.txn])];
                    case 1:
                        hex = (_a.sent())[0];
                        tx = Computer.txFromHex({ hex: hex });
                        setTxnData(tx);
                        return [4 /*yield*/, computer.rpcCall('getrawtransaction', "".concat(params.txn, " 2"))];
                    case 2:
                        result = (_a.sent()).result;
                        setRPCTxnData(result);
                        return [2 /*return*/];
                }
            });
        }); };
        fetch();
    }, [computer, txn, location, params.txn]);
    useEffect(function () {
        var fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!txnData) return [3 /*break*/, 2];
                        _a = setTransition;
                        return [4 /*yield*/, computer.decode(txnData)];
                    case 1:
                        _a.apply(void 0, [_b.sent()]);
                        _b.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        if (err_1 instanceof Error) {
                            setTransition('');
                            // eslint-disable-next-line no-console
                            console.log('Error parsing transaction', err_1.message);
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetch();
    }, [computer, txnData, txn]);
    var envTable = function (env) { return (_jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 break-keep", children: "Output" })] }) }), _jsx("tbody", { children: Object.entries(env).map(function (_a) {
                    var name = _a[0], output = _a[1];
                    return (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: name }), _jsx("td", { className: "px-6 py-4", children: _jsx(Link, { to: "/objects/".concat(output), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: output }) })] }, output));
                }) })] })); };
    var transitionComponent = function () { return (_jsxs("div", { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Expression" }), _jsx(ExpressionCard, { content: transition.exp, env: transition.env }), _jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Environment" }), envTable(transition.env), transition.mod && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Module Specifier" }), _jsx(Card, { content: transition.mod })] }))] })); };
    var inputsComponent = function () {
        var _a;
        return (_jsxs("div", { className: "relative overflow-x-auto sm:rounded-lg", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Inputs" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Transaction Id" }), _jsx("th", { scope: "col", className: "px-6 py-3 break-keep", children: "Output Number" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script" })] }) }), _jsx("tbody", { children: (_a = rpcTxnData === null || rpcTxnData === void 0 ? void 0 : rpcTxnData.vin) === null || _a === void 0 ? void 0 : _a.map(function (input, ind) {
                                var _a;
                                return (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsx(Link, { to: "/transactions/".concat(input.txid), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: input.txid }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs(Link, { to: "/objects/".concat(input.txid, ":").concat(input.vout), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", input.vout] }) }), _jsx("td", { className: "px-6 py-4 break-all", children: (_a = input.scriptSig) === null || _a === void 0 ? void 0 : _a.asm })] }, "".concat(input.txid, "|").concat(ind)));
                            }) })] })] }));
    };
    var outputsComponent = function () {
        var _a;
        return (_jsxs("div", { className: "relative overflow-x-auto", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Objects" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Number" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Value" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Type" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script PubKey" })] }) }), _jsx("tbody", { children: (_a = rpcTxnData === null || rpcTxnData === void 0 ? void 0 : rpcTxnData.vout) === null || _a === void 0 ? void 0 : _a.map(function (output) { return (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsxs(Link, { to: "/objects/".concat(txn, ":").concat(output.n), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", output.n] }) }), _jsx("td", { className: "px-6 py-4", children: output.value }), _jsx("td", { className: "px-6 py-4", children: output.scriptPubKey.type }), _jsx("td", { className: "px-6 py-4 break-all", children: output.scriptPubKey.asm })] }, output.n)); }) })] })] }));
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "pt-8", children: [_jsx("h1", { className: "mb-2 text-5xl font-extrabold dark:text-white", children: "Transaction" }), _jsx("p", { className: "mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400", children: txn }), transition && transitionComponent(), (rpcTxnData === null || rpcTxnData === void 0 ? void 0 : rpcTxnData.vin) && inputsComponent(), (rpcTxnData === null || rpcTxnData === void 0 ? void 0 : rpcTxnData.vout) && outputsComponent()] }) }));
}
export var Transaction = { Component: Component };
