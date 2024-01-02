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
import { Dropdown, initFlowbite } from "flowbite";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { capitalizeFirstLetter, isValidRev, sleep, toObject } from "./common/utils";
import reactStringReplace from "react-string-replace";
import { ModalOld } from "./ModalOld";
import { Auth } from "./Auth";
import { Card } from "./Card";
var keywords = ["_id", "_rev", "_owners", "_root", "_amount"];
export var getErrorMessage = function (error) {
    var _a, _b, _c, _d, _e, _f;
    if (((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) ===
        "mandatory-script-verify-flag-failed (Operation not valid with the current stack size)") {
        return "You are not authorized to make changes to this smart object";
    }
    else if ((_d = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) {
        return (_f = (_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error;
    }
    else {
        return error.message ? error.message : "Error occurred";
    }
};
export var getFnParamNames = function (fn) {
    var match = fn.toString().match(/\(.*?\)/);
    return match ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",") : [];
};
export var getValueForType = function (type, stringValue) {
    switch (type) {
        case "number":
            return Number(stringValue);
        case "string":
            return stringValue;
        case "boolean":
            return true; // make this dynamic
        case "undefined":
            return undefined;
        case "null":
            return null;
        case "object":
            return stringValue;
        default:
            return Number(stringValue);
    }
};
export var TypeSelectionDropdown = function (_a) {
    var id = _a.id, onSelectMethod = _a.onSelectMethod, dropdownList = _a.dropdownList, selectedType = _a.selectedType;
    var _b = useState(), dropDown = _b[0], setDropdown = _b[1];
    var _c = useState(selectedType ? selectedType : "Type"), type = _c[0], setType = _c[1];
    var dropdownSelectionList = useState(dropdownList)[0];
    useEffect(function () {
        initFlowbite();
        var $targetEl = document.getElementById("dropdownMenu".concat(id));
        var $triggerEl = document.getElementById("dropdownButton".concat(id));
        var options = {
            placement: "bottom",
            triggerType: "click",
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
        };
        var instanceOptions = {
            id: "dropdownMenu".concat(id),
            override: true,
        };
        setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions));
    }, [id]);
    var handleClick = function (type) {
        setType(type);
        onSelectMethod(type);
        if (dropDown)
            dropDown.hide();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", __assign({ id: "dropdownButton".concat(id), "data-dropdown-toggle": "dropdownMenu".concat(id), className: "flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", type: "button" }, { children: [type, _jsx("svg", __assign({ className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 10 6" }, { children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 4 4 4-4" }) }))] })), _jsx("div", __assign({ id: "dropdownMenu".concat(id), className: "z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700" }, { children: _jsx("ul", __assign({ className: "py-2 text-sm text-gray-700 dark:text-gray-200", "aria-labelledby": "dropdownButton".concat(id) }, { children: dropdownSelectionList.map(function (option, index) { return (_jsx("li", { children: _jsx("span", __assign({ onClick: function () {
                                handleClick(option);
                            }, className: "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" }, { children: option })) }, index)); }) })) }))] }));
};
function ObjectValueCard(_a) {
    var content = _a.content;
    var isRev = /([0-9a-fA-F]{64}:[0-9]+)/g;
    var revLink = function (rev, i) { return (_jsx(Link, __assign({ to: "/objects/".concat(rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: rev }), i)); };
    var formattedContent = reactStringReplace(content, isRev, revLink);
    return _jsx(Card, { content: formattedContent });
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
            return (_jsxs("div", { children: [_jsx("h3", __assign({ className: "mt-2 text-xl font-bold dark:text-white" }, { children: capitalizeFirstLetter(key) })), _jsx(ObjectValueCard, { content: toObject(value) })] }, i));
        }) }));
};
var Functions = function (_a) {
    var smartObject = _a.smartObject, functionsExist = _a.functionsExist, formState = _a.formState, updateFormValue = _a.updateFormValue, updateTypes = _a.updateTypes, handleSmartObjectMethod = _a.handleSmartObjectMethod, options = _a.options;
    if (!functionsExist)
        return _jsx(_Fragment, {});
    return (_jsxs(_Fragment, { children: [_jsx("h2", __assign({ className: "mb-2 text-4xl font-bold dark:text-white" }, { children: "Functions" })), Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject))
                .filter(function (key) {
                return key !== "constructor" && typeof Object.getPrototypeOf(smartObject)[key] === "function";
            })
                .map(function (key, fnIndex) {
                var paramList = getFnParamNames(Object.getPrototypeOf(smartObject)[key]);
                return (_jsxs("div", __assign({ className: "mt-6 mb-6" }, { children: [_jsx("h3", __assign({ className: "mt-2 text-xl font-bold dark:text-white" }, { children: key })), _jsxs("form", __assign({ id: "fn-index-".concat(fnIndex) }, { children: [paramList.map(function (paramName, paramIndex) { return (_jsxs("div", __assign({ className: "mb-4" }, { children: [_jsx("div", __assign({ className: "mb-2" }, { children: _jsx("label", __assign({ htmlFor: "".concat(key, "-").concat(paramName), className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" }, { children: paramName })) })), _jsxs("div", __assign({ className: "flex items-center space-x-4" }, { children: [_jsx("input", { type: "text", id: "".concat(key, "-").concat(paramName), value: formState["".concat(key, "-").concat(paramName)], onChange: function (e) { return updateFormValue(e, "".concat(key, "-").concat(paramName)); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500", placeholder: "Value", required: true }), _jsx(TypeSelectionDropdown, { id: "".concat(key).concat(paramName), dropdownList: options, onSelectMethod: function (option) {
                                                        return updateTypes(option, "".concat(key, "-").concat(paramName));
                                                    } })] }))] }), paramIndex)); }), _jsx("button", __assign({ className: "mr-8 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800", onClick: function (evt) { return handleSmartObjectMethod(evt, smartObject, key, paramList); } }, { children: "Call Function" }))] }))] }), fnIndex));
            })] }));
};
var revToId = function (rev) { return rev === null || rev === void 0 ? void 0 : rev.split(":")[0]; };
var MetaData = function (_a) {
    var smartObject = _a.smartObject;
    return (_jsxs(_Fragment, { children: [_jsx("h2", __assign({ className: "mb-2 text-4xl font-bold dark:text-white" }, { children: "Meta Data" })), _jsxs("table", __assign({ className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400" }, { children: [_jsx("thead", __assign({ className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" }, { children: _jsxs("tr", { children: [_jsx("th", __assign({ scope: "col", className: "px-6 py-3" }, { children: "Key" })), _jsx("th", __assign({ scope: "col", className: "px-6 py-3" }, { children: "Short" })), _jsx("th", __assign({ scope: "col", className: "px-6 py-3" }, { children: "Value" }))] }) })), _jsxs("tbody", { children: [_jsxs("tr", __assign({ className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700" }, { children: [_jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: "Identity" })), _jsx("td", __assign({ className: "px-6 py-4 break-all text-sm" }, { children: _jsx("pre", { children: "_id" }) })), _jsx("td", __assign({ className: "px-6 py-4" }, { children: _jsx(Link, __assign({ to: "/objects/".concat(smartObject === null || smartObject === void 0 ? void 0 : smartObject._id), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._id })) }))] })), _jsxs("tr", __assign({ className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700" }, { children: [_jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: "Revision" })), _jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: _jsx("pre", { children: "_rev" }) })), _jsx("td", __assign({ className: "px-6 py-4" }, { children: _jsx(Link, __assign({ to: "/objects/".concat(smartObject === null || smartObject === void 0 ? void 0 : smartObject._rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._rev })) }))] })), _jsxs("tr", __assign({ className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700" }, { children: [_jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: "Root" })), _jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: _jsx("pre", { children: "_root" }) })), _jsx("td", __assign({ className: "px-6 py-4" }, { children: _jsx(Link, __assign({ to: "/objects/".concat(smartObject === null || smartObject === void 0 ? void 0 : smartObject._root), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._root })) }))] })), _jsxs("tr", __assign({ className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700" }, { children: [_jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: "Owners" })), _jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: _jsx("pre", { children: "_owners" }) })), _jsx("td", __assign({ className: "px-6 py-4" }, { children: _jsx("span", __assign({ className: "font-medium text-gray-900 dark:text-white" }, { children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._owners })) }))] })), _jsxs("tr", __assign({ className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700" }, { children: [_jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: "Amount" })), _jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: _jsx("pre", { children: "_amount" }) })), _jsx("td", __assign({ className: "px-6 py-4" }, { children: _jsx("span", __assign({ className: "font-medium text-gray-900 dark:text-white" }, { children: smartObject === null || smartObject === void 0 ? void 0 : smartObject._amount })) }))] })), _jsxs("tr", __assign({ className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700" }, { children: [_jsx("td", __assign({ className: "px-6 py-4 break-all" }, { children: "Transaction" })), _jsx("td", { className: "px-6 py-4 break-all" }), _jsx("td", __assign({ className: "px-6 py-4" }, { children: _jsx(Link, __assign({ to: "/transactions/".concat(revToId(smartObject === null || smartObject === void 0 ? void 0 : smartObject._rev)), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: revToId(smartObject === null || smartObject === void 0 ? void 0 : smartObject._rev) })) }))] }))] })] }))] }));
};
function Component() {
    var _this = this;
    var location = useLocation();
    var params = useParams();
    var navigate = useNavigate();
    var rev = useState(params.rev || "")[0];
    var computer = useState(Auth.getComputer())[0];
    var _a = useState(null), smartObject = _a[0], setSmartObject = _a[1];
    var _b = useState({}), formState = _b[0], setFormState = _b[1];
    var _c = useState(false), functionsExist = _c[0], setFunctionsExist = _c[1];
    var _d = useState(false), show = _d[0], setShow = _d[1];
    var _e = useState({}), functionResult = _e[0], setFunctionResult = _e[1];
    var _f = useState(false), functionCallSuccess = _f[0], setFunctionCallSuccess = _f[1];
    var options = ["object", "string", "number", "bigint", "boolean", "undefined", "symbol"];
    useEffect(function () {
        var fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var synced, error_1, txId_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, computer.sync(rev)];
                    case 1:
                        synced = _a.sent();
                        console.log('synced.constructor.name', synced.constructor.name);
                        setSmartObject(synced);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        txId_1 = rev.split(':')[0];
                        navigate("/transactions/".concat(txId_1));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetch();
    }, [computer, rev, location, navigate]);
    useEffect(function () {
        var funcExist = false;
        if (smartObject) {
            var filteredSmartObject = Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject)).filter(function (key) {
                return key !== "constructor" && typeof Object.getPrototypeOf(smartObject)[key] === "function";
            });
            for (var key in filteredSmartObject) {
                if (key) {
                    funcExist = true;
                }
            }
        }
        setFunctionsExist(funcExist);
    }, [smartObject]);
    var handleSmartObjectMethod = function (event, smartObject, fnName, params) { return __awaiter(_this, void 0, void 0, function () {
        var revMap_1, tx, res, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    revMap_1 = {};
                    params.forEach(function (param) {
                        var key = "".concat(fnName, "-").concat(param);
                        var paramValue = getValueForType(formState["".concat(key, "--types")], formState[key]);
                        if (isValidRev(paramValue)) {
                            revMap_1[param] = paramValue;
                        }
                    });
                    return [4 /*yield*/, computer.encode({
                            exp: "smartObject.".concat(fnName, "(").concat(params.map(function (param) {
                                var key = "".concat(fnName, "-").concat(param);
                                var paramValue = getValueForType(formState["".concat(key, "--types")], formState[key]);
                                return isValidRev(paramValue)
                                    ? param
                                    : typeof paramValue === "string"
                                        ? "'".concat(paramValue, "'")
                                        : paramValue;
                            }), ")"),
                            env: __assign({ smartObject: smartObject._rev }, revMap_1),
                            // @ts-ignore
                            fund: true,
                            sign: true,
                        })];
                case 2:
                    tx = (_a.sent()).tx;
                    return [4 /*yield*/, computer.broadcast(tx)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, sleep(1000)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, computer.query({ ids: [smartObject._id] })];
                case 5:
                    res = _a.sent();
                    setFunctionResult({ _rev: res[0] });
                    setFunctionCallSuccess(true);
                    setShow(true);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    setFunctionResult(getErrorMessage(error_2));
                    setFunctionCallSuccess(false);
                    setShow(true);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var updateFormValue = function (e, key) {
        e.preventDefault();
        console.log(e, key);
        var value = __assign({}, formState);
        value[key] = e.target.value;
        setFormState(value);
    };
    var updateTypes = function (option, key) {
        var value = __assign({}, formState);
        value["".concat(key, "--types")] = option;
        setFormState(value);
    };
    var _g = rev.split(':'), txId = _g[0], outNum = _g[1];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h1", __assign({ className: "mb-2 text-5xl font-extrabold dark:text-white" }, { children: "Output" })), _jsxs("p", __assign({ className: "mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400" }, { children: [_jsx(Link, __assign({ to: "/transactions/".concat(txId), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline" }, { children: txId })), ":", outNum] })), _jsx("h2", __assign({ className: "mb-2 text-4xl font-bold dark:text-white" }, { children: "Data" })), _jsx(SmartObjectValues, { smartObject: smartObject }), _jsx(Functions, { smartObject: smartObject, functionsExist: functionsExist, formState: formState, updateFormValue: updateFormValue, updateTypes: updateTypes, handleSmartObjectMethod: handleSmartObjectMethod, options: options }), _jsx(MetaData, { smartObject: smartObject })] }), _jsx(ModalOld, { show: show, setShow: setShow, functionResult: functionResult, functionCallSuccess: functionCallSuccess })] }));
}
export var SmartObject = {
    Component: Component
};
