import { jsx as _jsx } from "react/jsx-runtime";
export function Card(_a) {
    var content = _a.content, id = _a.id;
    return (_jsx("div", { className: "block mt-4 mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700", children: _jsx("pre", { id: id !== null && id !== void 0 ? id : undefined, className: "font-normal text-gray-700 dark:text-gray-400 text-xs", children: content }) }));
}
