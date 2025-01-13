import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
export function FunctionResultModalContent(_a) {
    var functionResult = _a.functionResult;
    var navigate = useNavigate();
    if (functionResult && typeof functionResult === 'object' && !Array.isArray(functionResult))
        return (_jsx(_Fragment, { children: _jsxs("div", { className: "p-4 md:p-5 dark:text-gray-400", children: ["You created a\u00A0", _jsx(Link, { to: "/objects/".concat(functionResult._rev), className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", onClick: function () {
                            navigate("/objects/".concat(functionResult._rev));
                            window.location.reload();
                        }, children: "smart object" }), "."] }) }));
    if (functionResult._rev && functionResult.res.toString())
        return (_jsxs("p", { className: "text-base leading-relaxed text-gray-500 dark:text-gray-400", children: ["You created the value below at Revision ", functionResult._rev, _jsx("pre", { children: functionResult.res.toString() })] }));
    return (_jsx("p", { className: "text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2", children: functionResult }));
}
