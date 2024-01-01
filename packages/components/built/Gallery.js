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
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { jsonMap, strip, toObject } from "./common/utils";
import { Auth } from './Auth';
import { initFlowbite } from "flowbite";
import { Loader } from "./common/Components";
function HomePageCard(_a) {
    var content = _a.content;
    return (_jsx("div", __assign({ className: "block w-80 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" }, { children: _jsx("pre", __assign({ className: "font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs" }, { children: content() })) })));
}
function ValueComponent(_a) {
    var _this = this;
    var rev = _a.rev, computer = _a.computer;
    var _b = useState("loading..."), value = _b[0], setValue = _b[1];
    var _c = useState(""), errorMsg = _c[0], setMsgError = _c[1];
    var _d = useState(true), loading = _d[0], setLoading = _d[1];
    useEffect(function () {
        var fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var synced, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, computer.sync(rev)];
                    case 1:
                        synced = _a.sent();
                        setValue(toObject(jsonMap(strip)(synced)));
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        if (err_1 instanceof Error)
                            setMsgError("Error: ".concat(err_1.message));
                        return [3 /*break*/, 3];
                    case 3:
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        fetch();
    }, [computer, rev]);
    var loadingContent = function () { return _jsxs(_Fragment, { children: [_jsxs("svg", __assign({ "aria-hidden": "true", role: "status", className: "inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, { children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "#1C64F2" })] })), "Loading..."] }); };
    return loading
        ? _jsx(HomePageCard, { content: loadingContent })
        : _jsx(HomePageCard, { content: function () { return errorMsg || value; } });
}
function FromRevs(_a) {
    var revs = _a.revs, computer = _a.computer;
    return (_jsx("div", __assign({ className: "flex flex-wrap gap-4 mb-4 mt-4" }, { children: revs.map(function (rev) { return (_jsx("div", { children: _jsx(Link, __assign({ to: "/objects/".concat(rev), className: "block font-medium text-blue-600 dark:text-blue-500" }, { children: _jsx(ValueComponent, { rev: rev, computer: computer }) })) }, rev)); }) })));
}
function Pagination(_a) {
    var isPrevAvailable = _a.isPrevAvailable, handlePrev = _a.handlePrev, isNextAvailable = _a.isNextAvailable, handleNext = _a.handleNext;
    return (_jsx("nav", __assign({ className: "flex items-center justify-between", "aria-label": "Table navigation" }, { children: _jsxs("ul", __assign({ className: "inline-flex items-center -space-x-px" }, { children: [_jsx("li", { children: _jsxs("button", __assign({ disabled: !isPrevAvailable, onClick: handlePrev, className: "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" }, { children: [_jsx("span", __assign({ className: "sr-only" }, { children: "Previous" })), _jsx("svg", __assign({ className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10" }, { children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 1 1 5l4 4" }) }))] })) }), _jsx("li", { children: _jsxs("button", __assign({ disabled: !isNextAvailable, onClick: handleNext, className: "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" }, { children: [_jsx("span", __assign({ className: "sr-only" }, { children: "Next" })), _jsx("svg", __assign({ className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10" }, { children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 9 4-4-4-4" }) }))] })) })] })) })));
}
export default function WithPagination(_a) {
    var _this = this;
    var publicKey = _a.publicKey;
    var contractsPerPage = 12;
    var computer = useState(Auth.getComputer())[0];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(0), pageNum = _c[0], setPageNum = _c[1];
    var _d = useState(true), isNextAvailable = _d[0], setIsNextAvailable = _d[1];
    var _e = useState(pageNum > 0), isPrevAvailable = _e[0], setIsPrevAvailable = _e[1];
    var _f = useState([]), revs = _f[0], setRevs = _f[1];
    var location = useLocation();
    var pubKey = publicKey || new URLSearchParams(location.search).get("public-key");
    useEffect(function () {
        initFlowbite();
    }, []);
    useEffect(function () {
        var fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var queryParms, queryRevs, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        queryParms = {};
                        queryParms['offset'] = contractsPerPage * pageNum;
                        queryParms['limit'] = contractsPerPage + 1;
                        if (pubKey)
                            queryParms['publicKey'] = pubKey;
                        return [4 /*yield*/, computer.query(queryParms)];
                    case 1:
                        queryRevs = _a.sent();
                        setIsNextAvailable(queryRevs.length > contractsPerPage);
                        setRevs(queryRevs);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        // todo: forward to error page here
                        console.log("Error loading revisions", error_1);
                        return [3 /*break*/, 3];
                    case 3:
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        fetch();
    }, [computer, pageNum, publicKey]);
    var handleNext = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsPrevAvailable(true);
            setPageNum(pageNum + 1);
            return [2 /*return*/];
        });
    }); };
    var handlePrev = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsNextAvailable(true);
            if (pageNum - 1 === 0)
                setIsPrevAvailable(false);
            setPageNum(pageNum - 1);
            return [2 /*return*/];
        });
    }); };
    return (_jsxs("div", __assign({ className: "relative sm:rounded-lg pt-4" }, { children: [_jsx(FromRevs, { revs: revs, computer: computer }), !(pageNum === 0 && revs && revs.length === 0) && (_jsx(Pagination, { revs: revs, isPrevAvailable: isPrevAvailable, handlePrev: handlePrev, isNextAvailable: isNextAvailable, handleNext: handleNext })), isLoading && _jsx(Loader, {})] })));
}
export var Gallery = {
    FromRevs: FromRevs,
    WithPagination: WithPagination
};
