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
import { createContext, useContext, useEffect, useState } from 'react';
import { SnackBar } from './SnackBar';
import { Loader } from './Loader';
import { checkGeoLocation } from './utils/geolocation';
import { Modal } from './Modal';
var errorGeolocationModal = 'error-geolocation';
function ErrorContent(msg) {
    return (_jsx(_Fragment, { children: _jsx("div", { className: "p-4 md:p-5 dark:text-gray-400", children: _jsxs("div", { children: ["The app is not accessible from your location.", _jsx("br", {}), _jsx("br", {}), msg] }) }) }));
}
var utilsContext = createContext(undefined);
export var useUtilsComponents = function () {
    var context = useContext(utilsContext);
    if (!context) {
        throw new Error('useUtilsComponents must be used within a UtilsProvider');
    }
    return context;
};
// GeoLocationWrapper Component
function GeoLocationWrapper(_a) {
    var _this = this;
    var children = _a.children;
    var _b = useState(null), isValidLocation = _b[0], setIsValidLocation = _b[1];
    var showLoader = useUtilsComponents().showLoader;
    var isEnabled = import.meta.env.VITE_ENABLE_GEOLOCATION === 'true';
    useEffect(function () {
        var checkLocation = function () { return __awaiter(_this, void 0, void 0, function () {
            var isValid, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isEnabled) {
                            setIsValidLocation(true);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        showLoader(true);
                        return [4 /*yield*/, checkGeoLocation()];
                    case 2:
                        isValid = _a.sent();
                        setIsValidLocation(isValid);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        setIsValidLocation(false);
                        return [3 /*break*/, 5];
                    case 4:
                        showLoader(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        checkLocation();
    }, []);
    if (isEnabled && isValidLocation === null) {
        return null;
    }
    if (isEnabled && isValidLocation === false) {
        Modal.showModal(errorGeolocationModal);
        return null;
    }
    return _jsx(_Fragment, { children: children });
}
export var UtilsProvider = function (_a) {
    var children = _a.children;
    var _b = useState(null), snackBar = _b[0], setSnackBar = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var showSnackBar = function (message, success) {
        setSnackBar({ message: message, success: success });
    };
    var showLoader = function (show) {
        setIsLoading(show);
    };
    var hideSnackBar = function () {
        setSnackBar(null);
    };
    return (_jsxs(utilsContext.Provider, { value: { showSnackBar: showSnackBar, hideSnackBar: hideSnackBar, showLoader: showLoader }, children: [_jsx(GeoLocationWrapper, { children: children }), snackBar && (_jsx(SnackBar, { message: snackBar.message, success: snackBar.success, hideSnackBar: hideSnackBar })), isLoading && _jsx(Loader, {}), _jsx(Modal.Component, { title: 'Access Denied', content: ErrorContent, id: errorGeolocationModal })] }));
};
export var UtilsContext = {
    UtilsProvider: UtilsProvider,
    useUtilsComponents: useUtilsComponents,
};
