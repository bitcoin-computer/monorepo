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
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useMemo, useState } from 'react';
import { TypeSelectionDropdown } from './common/TypeSelectionDropdown';
import { isValidRev, sleep } from './common/utils';
import { UtilsContext } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
export var getErrorMessage = function (error) {
    var _a, _b, _c, _d, _e, _f;
    if (((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) ===
        'mandatory-script-verify-flag-failed (Operation not valid with the current stack size)')
        return 'You are not authorized to make changes to this smart object';
    if ((_d = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error)
        return (_f = (_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error;
    return error.message ? error.message : 'Error occurred';
};
var getValueForType = function (type, stringValue) {
    switch (type) {
        case 'number':
            return Number(stringValue);
        case 'string':
            return stringValue;
        case 'boolean':
            return stringValue === 'true';
        case 'undefined':
            return undefined;
        case 'null':
            return null;
        case 'object':
            return stringValue;
        default:
            return Number(stringValue);
    }
};
export var getParameterNames = function (fn) {
    var match = fn.toString().match(/\(.*?\)/);
    return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : [];
};
var getParameters = function (params, fnName, formState) {
    return params.map(function (param) {
        var key = "".concat(fnName, "-").concat(param);
        var paramValue = getValueForType(formState["".concat(key, "--types")], formState[key]);
        if (isValidRev(paramValue))
            return param;
        if (typeof paramValue === 'string')
            return "'".concat(paramValue, "'");
        return paramValue;
    });
};
export var SmartObjectFunction = function (_a) {
    var smartObject = _a.smartObject, functionsExist = _a.functionsExist, options = _a.options, setFunctionResult = _a.setFunctionResult, setShow = _a.setShow, setModalTitle = _a.setModalTitle, funcName = _a.funcName;
    var parameterList = getParameterNames(Object.getPrototypeOf(smartObject)[funcName]).filter(function (val) { return val; });
    var _b = useState(Object.fromEntries(parameterList.flatMap(function (key) { return [
        ["".concat(funcName, "-").concat(key), ''],
        ["".concat(funcName, "-").concat(key, "--types"), ''],
    ]; }))), formState = _b[0], setFormState = _b[1];
    var showLoader = UtilsContext.useUtilsComponents().showLoader;
    var computer = useContext(ComputerContext);
    var handleMethodCall = function (event, smartObj, fnName, params) { return __awaiter(void 0, void 0, void 0, function () {
        var revMap_1, tx, rev, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    showLoader(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    revMap_1 = {};
                    // Create Rev Map to pass smart objects as params
                    params.forEach(function (param) {
                        var key = "".concat(fnName, "-").concat(param);
                        var paramValue = getValueForType(formState["".concat(key, "--types")], formState[key]);
                        if (isValidRev(paramValue)) {
                            revMap_1[param] = paramValue;
                        }
                    });
                    return [4 /*yield*/, computer.encode({
                            exp: "smartObject.".concat(fnName, "(").concat(getParameters(params, fnName, formState), ")"),
                            env: __assign({ smartObject: smartObj._rev }, revMap_1),
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
                    rev = (_a.sent())[0];
                    setFunctionResult({ _rev: rev });
                    setModalTitle('Success');
                    setShow(true);
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    setFunctionResult(getErrorMessage(error_1));
                    setModalTitle('Error!');
                    setShow(true);
                    return [3 /*break*/, 8];
                case 7:
                    showLoader(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var updateForm = function (e, key) {
        e.preventDefault();
        var value = __assign({}, formState);
        value[key] = e.target.value;
        setFormState(value);
    };
    var updateTypes = function (option, key) {
        var value = __assign({}, formState);
        value["".concat(key, "--types")] = option;
        setFormState(value);
    };
    var capitalizeFirstLetter = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    var isDisabled = useMemo(function () {
        return Object.keys(formState).length > 0 && Object.values(formState).some(function (value) { return value === ''; });
    }, [formState]);
    if (!functionsExist)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "mt-6 mb-6", id: "function-".concat(funcName), children: [_jsx("h3", { className: "my-2 text-xl font-bold dark:text-white", children: capitalizeFirstLetter(funcName) }), _jsxs("form", { children: [parameterList.map(function (paramName, paramIndex) { return (_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("input", { type: "text", id: "".concat(funcName, "-").concat(paramName), value: formState["".concat(funcName, "-").concat(paramName)] || '', onChange: function (e) { return updateForm(e, "".concat(funcName, "-").concat(paramName)); }, className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500", placeholder: paramName, required: true }), _jsx(TypeSelectionDropdown, { id: "".concat(funcName).concat(paramName), dropdownList: options, onSelectMethod: function (option) {
                                            return updateTypes(option, "".concat(funcName, "-").concat(paramName));
                                        } })] }) }, paramIndex)); }), _jsx("button", { id: "".concat(funcName, "-call-function-button"), disabled: isDisabled, className: "text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:ring-4 focus:outline-none\n              ".concat(isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800', "\n            "), onClick: function (evt) { return handleMethodCall(evt, smartObject, funcName, parameterList); }, children: "Call Function" })] })] }) }));
};
