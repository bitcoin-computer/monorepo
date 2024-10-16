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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
export function FunctionResultModalContent(_a) {
    var functionResult = _a.functionResult;
    var navigate = useNavigate();
    if (functionResult && typeof functionResult === "object" && !Array.isArray(functionResult))
        return (_jsx(_Fragment, { children: _jsxs("div", __assign({ className: "p-4 md:p-5 dark:text-gray-400" }, { children: ["You created a\u00A0", _jsx(Link, __assign({ to: "/objects/".concat(functionResult._rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", onClick: function () {
                            navigate("/objects/".concat(functionResult._rev));
                            window.location.reload();
                        } }, { children: "smart object" })), "."] })) }));
    if (functionResult._rev && functionResult.res.toString())
        return (_jsxs("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: ["You created the value below at Revision ", functionResult._rev, _jsx("pre", { children: functionResult.res.toString() })] })));
    return (_jsx("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2" }, { children: functionResult })));
}
