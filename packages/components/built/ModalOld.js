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
export var ModalOld = function (_a) {
    var customElement = _a.customElement, show = _a.show, setShow = _a.setShow, functionResult = _a.functionResult, functionCallSuccess = _a.functionCallSuccess;
    var navigate = useNavigate();
    var getType = function () { return functionResult && (functionResult === null || functionResult === void 0 ? void 0 : functionResult.type) ? functionResult.type : "objects"; };
    return (_jsx(_Fragment, { children: show && (_jsx("div", __assign({ "tab-index": "-1", "aria-hidden": "true", className: "flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full" }, { children: _jsx("div", __assign({ className: "relative p-4 w-full max-w-4xl max-h-full" }, { children: _jsxs("div", __assign({ className: "relative bg-white rounded-lg shadow dark:bg-gray-700" }, { children: [_jsxs("div", __assign({ className: "flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600" }, { children: [_jsx("h3", __assign({ className: "text-xl font-semibold text-gray-900 dark:text-white" }, { children: functionCallSuccess ? "Success!!" : "Error!" })), _jsxs("button", __assign({ type: "button", className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white", onClick: function () { return setShow(false); } }, { children: [_jsx("svg", __assign({ className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14" }, { children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" }) })), _jsx("span", __assign({ className: "sr-only" }, { children: "Close modal" }))] }))] })), _jsxs("div", __assign({ className: "p-4 md:p-5 space-y-4" }, { children: [(functionResult === null || functionResult === void 0 ? void 0 : functionResult.res) && (_jsxs(_Fragment, { children: [_jsx("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: "Data returned:" })), _jsx("pre", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: functionResult.res.toString() }))] })), typeof functionResult === "object" && functionResult && functionResult._rev && (_jsx("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: "Check the latest state of your smart object by clicking the link below" }))), typeof functionResult === "string" && (_jsx("p", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: functionResult }))), _jsx("pre", __assign({ className: "text-base leading-relaxed text-gray-500 dark:text-gray-400" }, { children: typeof functionResult === "object" &&
                                        !Array.isArray(functionResult) &&
                                        functionResult._rev && (_jsx(_Fragment, { children: _jsx(Link, __assign({ to: "/".concat(getType(), "/").concat(functionResult._rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", onClick: function () {
                                                navigate("/".concat(getType(), "/").concat(functionResult._rev));
                                                window.location.reload();
                                            } }, { children: functionResult._rev })) })) })), customElement ? customElement : _jsx(_Fragment, {})] }))] })) })) }))) }));
};
