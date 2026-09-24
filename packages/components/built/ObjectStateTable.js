import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { capitalizeFirstLetter, isValidRevString } from './common/utils';
const SYSTEM_KEYS = new Set(['_id', '_rev', '_owners', '_root', '_satoshis']);
const ROW_HEIGHT_PX = 32;
export const DEFAULT_MAX_VISIBLE_ROWS = 3;
function truncateRev(rev, head = 8, tail = 6) {
    if (!rev)
        return '';
    const [txId, vout] = rev.split(':');
    if (!txId || txId.length <= head + tail)
        return rev;
    return `${txId.slice(0, head)}…${txId.slice(-tail)}:${vout ?? '0'}`;
}
function TypeBadge({ type }) {
    return (_jsx("span", { className: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 shrink-0", children: type }));
}
function formatStatePreview(value) {
    if (value === null) {
        return { type: 'null', preview: _jsx("span", { className: "text-gray-400 italic", children: "null" }) };
    }
    if (value === undefined) {
        return {
            type: 'undefined',
            preview: _jsx("span", { className: "text-gray-400 italic", children: "undefined" }),
        };
    }
    if (typeof value === 'boolean') {
        return {
            type: 'boolean',
            preview: (_jsx("span", { className: value ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300', children: String(value) })),
        };
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
        return {
            type: typeof value,
            preview: (_jsx("span", { className: "tabular-nums font-medium text-gray-900 dark:text-white", children: value.toString() })),
        };
    }
    if (typeof value === 'string') {
        if (isValidRevString(value)) {
            return {
                type: 'rev',
                preview: _jsx("span", { className: "font-mono text-xs", children: truncateRev(value) }),
            };
        }
        const short = value.length > 80 ? `${value.slice(0, 80)}…` : value;
        return {
            type: 'string',
            preview: (_jsx("span", { className: "text-gray-900 dark:text-gray-100", children: value === '' ? _jsx("span", { className: "text-gray-400 italic", children: "empty" }) : short })),
        };
    }
    if (Array.isArray(value)) {
        return {
            type: `array[${value.length}]`,
            preview: (_jsxs("span", { className: "text-gray-600 dark:text-gray-300 text-xs", children: [value.length, " item", value.length === 1 ? '' : 's'] })),
        };
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        return {
            type: 'object',
            preview: (_jsxs("span", { className: "text-gray-600 dark:text-gray-300 text-xs", children: [keys.length, " key", keys.length === 1 ? '' : 's', keys.length > 0 ? `: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '…' : ''}` : ''] })),
        };
    }
    return {
        type: typeof value,
        preview: _jsx("span", { children: String(value) }),
    };
}
function publicEntries(smartObject) {
    if (smartObject == null || typeof smartObject !== 'object')
        return [];
    return Object.entries(smartObject).filter(([key, value]) => !SYSTEM_KEYS.has(key) && typeof value !== 'function');
}
function StateRow({ name, value }) {
    const { type, preview } = formatStatePreview(value);
    return (_jsx("div", { className: "border-b border-gray-100 dark:border-gray-800 last:border-0", style: { height: ROW_HEIGHT_PX }, children: _jsxs("div", { className: "h-full px-0.5 flex items-center gap-1.5 min-h-0", children: [_jsx("div", { className: "shrink-0 w-[4.5rem] min-w-0", children: _jsx("span", { className: "block text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap truncate", title: name, children: capitalizeFirstLetter(name) }) }), _jsx(TypeBadge, { type: type }), _jsx("div", { className: "min-w-0 flex-1 text-xs text-gray-700 dark:text-gray-300 truncate", children: preview })] }) }));
}
export function ObjectStateTable({ smartObject, maxVisibleRows = DEFAULT_MAX_VISIBLE_ROWS, }) {
    const entries = publicEntries(smartObject);
    if (entries.length === 0) {
        return _jsx("p", { className: "text-[11px] text-gray-500 dark:text-gray-400", children: "No public properties" });
    }
    const scroll = entries.length > maxVisibleRows;
    return (_jsx("div", { className: scroll ? 'overflow-y-auto overscroll-contain' : undefined, style: scroll ? { maxHeight: maxVisibleRows * ROW_HEIGHT_PX } : undefined, children: entries.map(([key, value]) => (_jsx(StateRow, { name: key, value: value }, key))) }));
}
