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
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext } from "react";
var balanceContext = createContext(undefined);
export var BalanceProvider = function (_a) {
    var children = _a.children;
    var _b = useState(0), balance = _b[0], setBalance = _b[1];
    return (_jsx(balanceContext.Provider, __assign({ value: { balance: balance, setBalance: setBalance } }, { children: children })));
};
export var useBalance = function () {
    var context = useContext(balanceContext);
    if (!context) {
        throw new Error("useBalance must be used within a BalanceProvider");
    }
    return context;
};
export var BalanceContext = {
    BalanceProvider: BalanceProvider,
    useBalance: useBalance
};
