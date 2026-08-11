import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { HiOutlineClipboard } from 'react-icons/hi';
import { capitalizeFirstLetter, toObject } from './common/utils';
import { Card } from './Card';
import { Modal } from './Modal';
import { FunctionResultModalContent } from './common/SmartCallExecutionResult';
import { SmartObjectFunctions } from './SmartObjectFunctions';
import { ComputerContext } from './ComputerContext';
const keywords = ['_id', '_rev', '_owners', '_root', '_satoshis'];
const modalId = 'smart-object-info-modal';
export const getFnParamNames = (fn) => {
    const match = fn.toString().match(/\(.*?\)/);
    return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : [];
};
function Copy({ text }) {
    return (_jsx("button", { onClick: () => navigator.clipboard.writeText(text), className: "cursor-pointer pl-2 text-gray-600 hover:text-gray-800 focus:outline-none", "aria-label": "Copy Transaction ID", children: _jsx(HiOutlineClipboard, {}) }));
}
function ObjectValueCard({ content, id }) {
    const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g;
    const revLink = (rev, i) => (_jsx(Link, { to: `/objects/${rev}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: rev }, i));
    const formattedContent = reactStringReplace(content, isRev, revLink);
    return _jsx(Card, { content: formattedContent, id: `property-${id}-value` });
}
const SmartObjectValues = ({ smartObject }) => {
    if (!smartObject)
        return _jsx(_Fragment, {});
    return (_jsx(_Fragment, { children: Object.entries(smartObject)
            .filter(([k]) => !keywords.includes(k))
            .map(([key, value], i) => (_jsxs("div", { children: [_jsx("h3", { className: "mt-1 text-base font-semibold dark:text-white", children: capitalizeFirstLetter(key) }), _jsx(ObjectValueCard, { id: key, content: toObject(value) })] }, i))) }));
};
function MetaData({ smartObject, prev, next }) {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "pt-6 pb-2 space-y-4 border-t border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("a", { href: prev ? `/objects/${prev}` : undefined, className: `flex items-center justify-center px-4 h-10 text-sm font-medium border rounded-lg transition 
      ${prev
                                ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 pointer-events-none'}`, "aria-disabled": !prev, children: "Previous" }), _jsx("a", { href: next ? `/objects/${next}` : undefined, className: `flex items-center justify-center px-4 h-10 text-sm font-medium border rounded-lg transition 
      ${next
                                ? 'bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 pointer-events-none'}`, "aria-disabled": !next, children: "Next" }), _jsx("button", { type: "button", onClick: toggleVisibility, className: "flex items-center justify-center px-4 h-10 text-sm font-medium border rounded-lg transition bg-white text-black border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700", children: isVisible ? 'Hide metadata' : 'Show metadata' })] }) }), isVisible && (_jsx("div", { className: "relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mt-4 mb-8", children: _jsxs("table", { className: "w-full text-[12px] text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-4 py-2", children: "Key" }), _jsx("th", { scope: "col", className: "px-4 py-2", children: "Short" }), _jsx("th", { scope: "col", className: "px-4 py-2", children: "Value" })] }) }), _jsxs("tbody", { children: [_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Identity" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_id" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: `/objects/${smartObject?._id}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject?._id }), _jsx(Copy, { text: smartObject?._id })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Revision" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_rev" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: `/objects/${smartObject?._rev}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject?._rev }), _jsx(Copy, { text: smartObject?._rev })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Root" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_root" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx(Link, { to: `/objects/${smartObject?._root}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: smartObject?._root }), _jsx(Copy, { text: smartObject?._root })] })] }), _jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-2", children: "Owners" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_owners" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: smartObject?._owners }), _jsx(Copy, { text: JSON.stringify(smartObject?._owners) })] })] }), _jsxs("tr", { className: "bg-white dark:bg-gray-800", children: [_jsx("td", { className: "px-4 py-2", children: "Amount" }), _jsx("td", { className: "px-4 py-2", children: _jsx("pre", { children: "_satoshis" }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: smartObject?._satoshis?.toString?.() ?? String(smartObject?._satoshis) }), _jsx(Copy, { text: String(smartObject?._satoshis ?? '') })] })] })] })] }) }))] }));
}
function Component({ title }) {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const rev = params.rev || '';
    const computer = useContext(ComputerContext);
    const [smartObject, setSmartObject] = useState(null);
    const [next, setNext] = useState(undefined);
    const [prev, setPrev] = useState(undefined);
    const [functionsExist, setFunctionsExist] = useState(false);
    const [functionResult, setFunctionResult] = useState({});
    const options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol'];
    const [modalTitle, setModalTitle] = useState('');
    const setShow = (flag) => {
        if (flag) {
            Modal.get(modalId).show();
        }
        else {
            Modal.get(modalId).hide();
        }
    };
    useEffect(() => {
        if (!rev)
            return;
        let cancelled = false;
        setSmartObject(null);
        setPrev(undefined);
        setNext(undefined);
        const fetch = async () => {
            try {
                const [o, p, n] = await Promise.all([
                    computer.sync(rev),
                    computer.prev(rev),
                    computer.next(rev),
                ]);
                if (cancelled)
                    return;
                setSmartObject(o);
                setPrev(p);
                setNext(n);
            }
            catch (err) {
                if (cancelled)
                    return;
                if (err instanceof Error)
                    console.log('Error syncing to object:', err.message);
                const [txId] = rev.split(':');
                navigate(`/transactions/${txId}`);
            }
        };
        fetch();
        return () => {
            cancelled = true;
        };
    }, [computer, rev, location, navigate]);
    useEffect(() => {
        let funcExist = false;
        if (smartObject) {
            const filteredSmartObject = Object.getOwnPropertyNames(Object.getPrototypeOf(smartObject)).filter((key) => key !== 'constructor' && typeof Object.getPrototypeOf(smartObject)[key] === 'function');
            Object.keys(filteredSmartObject).forEach((key) => {
                if (key) {
                    funcExist = true;
                }
            });
        }
        setFunctionsExist(funcExist);
    }, [smartObject]);
    const [txId, outNum] = rev.split(':');
    const loading = !smartObject;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full space-y-4", children: [_jsxs("header", { children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Smart object" }), _jsx("h1", { className: "mb-2 text-xl sm:text-2xl font-semibold dark:text-white", children: title || 'Object' }), _jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1", children: "Revision" }), _jsxs("div", { className: "flex flex-wrap items-center gap-1 font-mono text-xs sm:text-sm break-all", children: [_jsx(Link, { to: `/transactions/${txId}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline", children: txId }), _jsxs("span", { className: "text-gray-700 dark:text-gray-300", children: [":", outNum] }), _jsx(Copy, { text: `${txId}:${outNum}` })] }), smartObject?._satoshis != null ? (_jsxs("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: smartObject._satoshis.toString() }), ' ', "sats", Array.isArray(smartObject._owners) && smartObject._owners.length > 0 ? (_jsxs(_Fragment, { children: [' · ', _jsxs("span", { className: "font-mono text-xs", children: [String(smartObject._owners[0]).slice(0, 12), "\u2026"] })] })) : null] })) : null] })] }), loading ? (_jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-24 rounded-xl bg-gray-200 dark:bg-gray-700" }), _jsx("div", { className: "h-24 rounded-xl bg-gray-200 dark:bg-gray-700" })] })) : (_jsxs(_Fragment, { children: [_jsx(SmartObjectValues, { smartObject: smartObject }), _jsx(SmartObjectFunctions, { smartObject: smartObject, functionsExist: functionsExist, options: options, setFunctionResult: setFunctionResult, setShow: setShow, setModalTitle: setModalTitle }), _jsx(MetaData, { smartObject: smartObject, prev: prev, next: next })] }))] }), _jsx(Modal.Component, { title: modalTitle, content: FunctionResultModalContent, contentData: { functionResult }, id: modalId })] }));
}
export const SmartObject = {
    Component,
};
