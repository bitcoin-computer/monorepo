import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ content, id }) {
    return (_jsx("div", { className: "block mt-1.5 mb-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-x-auto", children: _jsx("pre", { id: id ?? undefined, className: "font-normal text-gray-700 dark:text-gray-300 text-xs whitespace-pre-wrap break-words leading-relaxed", children: content }) }));
}
