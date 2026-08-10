import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
export function FunctionResultModalContent({ functionResult }) {
    const navigate = useNavigate();
    if (functionResult && typeof functionResult === 'object' && !Array.isArray(functionResult)) {
        const isModule = functionResult.type === 'modules';
        const path = isModule ? `/modules/${functionResult._rev}` : `/objects/${functionResult._rev}`;
        const label = isModule ? 'module' : 'on chain object';
        return (_jsx(_Fragment, { children: _jsxs("div", { id: "smart-call-execution-success", className: "p-4 md:p-5 dark:text-gray-400", children: ["You created ", isModule ? 'a' : 'an', "\u00A0", _jsx(Link, { id: "smart-call-execution-counter-link", to: path, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", onClick: () => {
                            navigate(path);
                            window.location.reload();
                        }, children: label }), "."] }) }));
    }
    if (functionResult._rev && functionResult.res.toString())
        return (_jsxs("p", { className: "text-base leading-relaxed text-gray-500 dark:text-gray-400", children: ["You created the value below at Revision ", functionResult._rev, _jsx("pre", { children: functionResult.res.toString() })] }));
    return (_jsx("p", { className: "text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2", children: functionResult }));
}
