import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SmartObjectFunction, getParameterNames } from './SmartObjectFunction';
/** Built-in / prototype noise we never treat as smart-object methods */
const SKIP_METHOD_NAMES = new Set([
    'constructor',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf',
    'toJSON',
]);
/**
 * Collect callable methods from the object's prototype chain.
 */
export function methodNamesFrom(smartObject) {
    if (!smartObject || (typeof smartObject !== 'object' && typeof smartObject !== 'function')) {
        return [];
    }
    const names = [];
    const seen = new Set();
    try {
        let proto = Object.getPrototypeOf(smartObject);
        while (proto && proto !== Object.prototype) {
            let keys = [];
            try {
                keys = Object.getOwnPropertyNames(proto);
            }
            catch {
                keys = [];
            }
            for (const key of keys) {
                if (seen.has(key) || SKIP_METHOD_NAMES.has(key))
                    continue;
                try {
                    const desc = Object.getOwnPropertyDescriptor(proto, key);
                    const value = desc && 'value' in desc ? desc.value : proto[key];
                    if (typeof value === 'function') {
                        seen.add(key);
                        names.push(key);
                    }
                }
                catch {
                    // SES / revoked proxy — skip
                }
            }
            try {
                proto = Object.getPrototypeOf(proto);
            }
            catch {
                break;
            }
        }
    }
    catch {
        return names;
    }
    return names;
}
function getMethodFn(smartObject, name) {
    try {
        let proto = Object.getPrototypeOf(smartObject);
        while (proto && proto !== Object.prototype) {
            try {
                const desc = Object.getOwnPropertyDescriptor(proto, name);
                if (desc && 'value' in desc && typeof desc.value === 'function') {
                    return desc.value;
                }
                const v = proto[name];
                if (typeof v === 'function')
                    return v;
            }
            catch {
                // continue walking
            }
            try {
                proto = Object.getPrototypeOf(proto);
            }
            catch {
                break;
            }
        }
    }
    catch {
        return null;
    }
    return null;
}
function arityOf(smartObject, name) {
    try {
        const fn = getMethodFn(smartObject, name);
        if (!fn)
            return 0;
        return getParameterNames(fn).filter(Boolean).length;
    }
    catch {
        return 0;
    }
}
function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
export const SmartObjectFunctions = ({ smartObject, functionsExist, options, latestRev, }) => {
    const methods = useMemo(() => methodNamesFrom(smartObject), [smartObject]);
    const [selected, setSelected] = useState('');
    useEffect(() => {
        if (methods.length === 0) {
            setSelected('');
            return;
        }
        setSelected((prev) => (prev && methods.includes(prev) ? prev : methods[0]));
    }, [methods]);
    const hasMethods = methods.length > 0 || functionsExist;
    const isHistorical = Boolean(latestRev && smartObject?._rev && latestRev !== smartObject._rev);
    if (!hasMethods || methods.length === 0) {
        return (_jsxs("section", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden", "aria-label": "Methods", children: [_jsxs("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white", children: "Methods" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: "Callable functions on this smart object" })] }), _jsx("div", { className: "p-6 text-center", children: _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No public methods on this object." }) })] }));
    }
    // Always have a concrete selection when methods exist
    const activeMethod = selected && methods.includes(selected) ? selected : methods[0];
    const selectedParams = (() => {
        try {
            const fn = getMethodFn(smartObject, activeMethod);
            if (!fn)
                return [];
            return getParameterNames(fn).filter(Boolean);
        }
        catch {
            return [];
        }
    })();
    return (_jsxs("section", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden", "aria-label": "Methods", children: [_jsxs("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white", children: "Methods" }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: [methods.length, " method", methods.length === 1 ? '' : 's', " \u00B7 select one to call"] })] }), _jsx("span", { className: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 tabular-nums", children: methods.length })] }), isHistorical ? (_jsxs("div", { className: "px-4 py-2.5 border-b border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-sm text-amber-900 dark:text-amber-200", children: ["You are viewing a historical revision. Method calls that spend this object will fail.", ' ', _jsx(Link, { to: `/objects/${latestRev}`, className: "font-medium underline underline-offset-2 hover:opacity-90", children: "Go to latest revision \u2192" })] })) : null, _jsxs("div", { className: "flex flex-row items-stretch min-h-[14rem]", children: [_jsx("nav", { className: "shrink-0 w-44 sm:w-52 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60", "aria-label": "Method list", children: _jsx("ul", { className: "p-1.5 space-y-0.5 overflow-y-auto max-h-80", role: "listbox", "aria-label": "Available methods", children: methods.map((name) => {
                                const isActive = name === activeMethod;
                                const arity = arityOf(smartObject, name);
                                return (_jsx("li", { role: "option", "aria-selected": isActive, children: _jsxs("button", { type: "button", onClick: () => setSelected(name), className: `w-full text-left px-3 py-2.5 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 ${isActive
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700/80'}`, children: [_jsx("span", { className: "font-medium font-mono text-[13px] block truncate", title: name, children: name }), _jsx("span", { className: `text-[11px] ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`, children: arity === 0 ? 'no args' : `${arity} arg${arity === 1 ? '' : 's'}` })] }) }, name));
                            }) }) }), _jsxs("div", { className: "flex-1 min-w-0 p-4 sm:p-5 overflow-x-auto bg-white dark:bg-gray-900", children: [_jsxs("div", { className: "mb-4 pb-3 border-b border-gray-100 dark:border-gray-800", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Call method" }), _jsx("h3", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white font-mono", children: capitalizeFirstLetter(activeMethod) }), _jsxs("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono break-all", children: [activeMethod, "(", selectedParams.join(', '), ")"] })] }), _jsx(SmartObjectFunction, { funcName: activeMethod, smartObject: smartObject, functionsExist: true, options: options, latestRev: latestRev, embedded: true }, activeMethod)] })] })] }));
};
