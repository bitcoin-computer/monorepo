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
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
export function FunctionResultModalContent(_a) {
    var functionResult = _a.functionResult;
    var navigate = useNavigate();
    var getType = function () {
        return functionResult && (functionResult === null || functionResult === void 0 ? void 0 : functionResult.type) ? functionResult.type : "objects";
    };
    return (_jsx("div", { children: _jsxs("div", __assign({ className: "p-4 md:p-5 space-y-4" }, { children: [(functionResult === null || functionResult === void 0 ? void 0 : functionResult.res) && (_jsxs(_Fragment, { children: [_jsx("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: "Data returned:" })), _jsx("pre", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: functionResult.res.toString() }))] })), typeof functionResult === "object" && functionResult && functionResult._rev && (_jsx("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: "Check the latest state of your smart object by clicking the link below" }))), typeof functionResult === "string" && (_jsx("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: functionResult }))), _jsx("pre", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: typeof functionResult === "object" &&
                        !Array.isArray(functionResult) &&
                        functionResult._rev && (_jsx(_Fragment, { children: _jsx(Link, __assign({ to: "/".concat(getType(), "/").concat(functionResult._rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", onClick: function () {
                                navigate("/".concat(getType(), "/").concat(functionResult._rev));
                                window.location.reload();
                            } }, { children: "smart object" })) })) }))] })) }));
}
