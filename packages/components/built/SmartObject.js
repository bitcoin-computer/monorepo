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
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { HiOutlineClipboard } from 'react-icons/hi';
import { capitalizeFirstLetter, toObject } from './common/utils';
import { Card } from './Card';
import { Modal } from './Modal';
import { FunctionResultModalContent } from './common/SmartCallExecutionResult';
import { SmartObjectFunctions } from './SmartObjectFunctions';
import { ComputerContext } from './ComputerContext';
var keywords = ['_id', '_rev', '_owners', '_root', '_amount'];
var modalId = 'smart-object-info-modal';
export var getFnParamNames = function (fn) {
    var match = fn.toString().match(/\(.*?\)/);
    return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : [];
};
function Copy(_a) {
    var text = _a.text;
    return (_jsx("button", { onClick: function () { return navigator.clipboard.writeText(text); }, className: "cursor-pointer pl-2 text-gray-600 hover:text-gray-800 focus:outline-none", "aria-label": "Copy Transaction ID", children: _jsx(HiOutlineClipboard, {}) }));
}
function ObjectValueCard(_a) {
    var content = _a.content, id = _a.id;
    var isRev = /([0-9a-fA-F]{64}:[0-9]+)/g;
    var revLink = function (rev, i) { return (_jsx(Link, { to: "/objects/".concat(rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: rev }, i)); };
    var formattedContent = reactStringReplace(content, isRev, revLink);
    return _jsx(Card, { content: formattedContent, id: "property-".concat(id, "-value") });
}
var SmartObjectValues = function (_a) {
    var smartObject = _a.smartObject;
    if (!smartObject)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: Object.entries(smartObject)
            .filter(function (_a) {
            var k = _a[0];
            return !keywords.includes(k);
        })
            .map(function (_a, i) {
            var key = _a[0], value = _a[1];
            return (_jsxs("div", { children: [_jsx("h3", { className: "mt-2 text-xl font-bold dark:text-white", children: capitalizeFirstLetter(key) }), _jsx(ObjectValueCard, { id: key, content: toObject(value) })] }, i));
        }) }));
};
function MetaData(_a) {
    var smartObject = _a.smartObject, prev = _a.prev, next = _a.next;
    var _b = useState(false), isVisible = _b[0], setIsVisible = _b[1];
    var toggleVisibility = function () {
        setIsVisible(!isVisible);
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "pt-6 pb-6 space-y-4 border-t border-gray-300 dark:border-gray-700", children: _jsxs("div", { className: "flex", children: [_jsx("a", { href: prev ? "/objects/".concat(prev) : undefined, className: "flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition \n      ".concat(prev
                                ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'), "aria-disabled": !prev, children: "Previous" }), _jsx("a", { href: next ? "/objects/".concat(next) : undefined, className: "flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition \n      ".concat(next
                                ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'), "aria-disabled": !next, children: "Next" }), _jsx("button", { onClick: toggleVisibility, className: "flex items-center justify-center px-4 h-10 ms-3 text-sm font-medium border rounded-lg transition \n      bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700", children: isVisible ? 'Hide Metadata' : 'Show Metadata' })] }) }), isVisible && (_jsxs("table", { className: "w-full mt-4 mb-8 text-[12px] text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-4 py-2", children: "Key" }), _jsx("th", { scope: "col", className: "px-4 py-2", children: "Short" }), _jsx("th", { scope: "col", className: "px-4 py-2", children: "Value" })] }) }), _jsxs("tbody", { children: [_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Identity" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_id" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: "/objects/".concat(smartObject === null || smartObject === void 0 ? void 0 : smartObject._id), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._id }), _jsx(Copy, { text: smartObject === null || smartObject === void 0 ? void 0 : smartObject._id })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Revision" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_rev" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: "/objects/".concat(smartObject === null || smartObject === void 0 ? void 0 : smartObject._rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._rev }), _jsx(Copy, { text: smartObject === null || smartObject === void 0 ? void 0 : smartObject._rev })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Root" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_root" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: "/objects/".concat(smartObject === null || smartObject === void 0 ? void 0 : smartObject._root), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._root }), _jsx(Copy, { text: smartObject === null || smartObject === void 0 ? void 0 : smartObject._root })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Owners" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_owners" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._owners }), _jsx(Copy, { text: JSON.stringify(smartObject === null || smartObject === void 0 ? void 0 : smartObject._owners) })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Amount" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_amount" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsxs("span", { className: "font-medium text-gray-900 dark:text-white", children: [smartObject === null || smartObject === void 0 ? void 0 : smartObject._amount, " Satoshi"] }), _jsx(Copy, { text: smartObject === null || smartObject === void 0 ? void 0 : smartObject._amount })] })] })] })] }))] }));
}
function Component(_a) {
    var _this = this;
    var title = _a.title;
    var location = useLocation();
    var params = useParams();
    var navigate = useNavigate();
    var rev = useState(params.rev || '')[0];
    var computer = useContext(ComputerContext);
    var _b = useState(null), smartObject = _b[0], setSmartObject = _b[1];
    var _c = useState(undefined), next = _c[0], setNext = _c[1];
    var _d = useState(undefined), prev = _d[0], setPrev = _d[1];
    var _e = useState(false), functionsExist = _e[0], setFunctionsExist = _e[1];
    var _f = useState({}), functionResult = _f[0], setFunctionResult = _f[1];
    var options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol'];
    var _g = useState(''), modalTitle = _g[0], setModalTitle = _g[1];
    var setShow = function (flag) {
        if (flag) {
            Modal.get(modalId).show();
        }
        else {
            Modal.get(modalId).hide();
        }
    };
    useEffect(function () {
        var fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var synced, error_1, txId_1, _a, _b, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, computer.sync(rev)];
                    case 1:
                        synced = _c.sent();
                        setSmartObject(synced);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        txId_1 = rev.split(':')[0];
                        navigate("/transactions/".concat(txId_1));
                        return [3 /*break*/, 3];
                    case 3:
                        _c.trys.push([3, 6, , 7]);
                        _a = setPrev;
                        return [4 /*yield*/, computer.prev(rev)];
                    case 4:
                        _a.apply(void 0, [_c.sent()]);
                        _b = setNext;
                        return [4 /*yield*/, computer.next(rev)];
                    case 5:
                        _b.apply(void 0, [_c.sent()]);
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _c.sent();
                        console.log({ error: error_2 });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        fetch();
    }, [computer, rev, location, navigate]);
    useEffect(function () {
        var funcExist = false;
        if (smartObject) {
            var filteredSmartObject = Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject)).filter(function (key) {
                return key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function';
            });
            Object.keys(filteredSmartObject).forEach(function (key) {
                if (key) {
                    funcExist = true;
                }
            });
        }
        setFunctionsExist(funcExist);
    }, [smartObject]);
    var _h = rev.split(':'), txId = _h[0], outNum = _h[1];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "max-w-screen-md mx-auto", children: [_jsx("h1", { className: "mb-2 text-5xl font-extrabold dark:text-white", children: title || 'Object' }), _jsxs("div", { className: "mb-8", children: [_jsx(Link, { to: "/transactions/".concat(txId), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: txId }), _jsxs("span", { children: [":", outNum] }), _jsx(Copy, { text: "".concat(txId, ":").concat(outNum) })] }), _jsx(SmartObjectValues, { smartObject: smartObject }), _jsx(SmartObjectFunctions, { smartObject: smartObject, functionsExist: functionsExist, options: options, setFunctionResult: setFunctionResult, setShow: setShow, setModalTitle: setModalTitle }), _jsx(MetaData, { smartObject: smartObject, prev: prev, next: next })] }), _jsx(Modal.Component, { title: modalTitle, content: FunctionResultModalContent, contentData: { functionResult: functionResult }, id: modalId })] }));
}
export var SmartObject = {
    Component: Component,
};
