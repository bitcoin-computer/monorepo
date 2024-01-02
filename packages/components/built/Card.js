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
export function Card(_a) {
    var content = _a.content;
    return (_jsx("div", __assign({ className: "block mt-4 mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700" }, { children: _jsx("pre", __assign({ className: "font-normal text-gray-700 dark:text-gray-400 text-xs" }, { children: content })) })));
}
