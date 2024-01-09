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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
export function SnackBar(props) {
    var message = props.message, success = props.success, hideSnackBar = props.hideSnackBar;
    var closeMessage = function (evt) {
        evt.preventDefault();
        hideSnackBar();
    };
    useEffect(function () {
        var timer = setTimeout(function () {
            hideSnackBar();
        }, 3000);
        return function () {
            clearTimeout(timer);
        };
    }, [hideSnackBar]);
    return (_jsxs("div", __assign({ className: success
            ? "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed bottom-2 right-2"
            : "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-2 right-2", role: "alert" }, { children: [_jsx("strong", __assign({ className: "font-bold pr-6" }, { children: message })), _jsx("span", __assign({ className: "absolute top-0 bottom-0 right-0 px-4 py-3", onClick: closeMessage }, { children: _jsxs("svg", __assign({ className: success ? "fill-current h-6 w-6 text-green-500" : "fill-current h-6 w-6 text-red-500", role: "button", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" }, { children: [_jsx("title", { children: "Close" }), _jsx("path", { d: "M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" })] })) }))] })));
}
