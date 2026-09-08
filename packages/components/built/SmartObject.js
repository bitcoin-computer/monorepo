import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { HiOutlineClipboard, HiCheck } from 'react-icons/hi';
import { isDecryptionFailure } from './common/transition';
import { capitalizeFirstLetter, isValidRevString, toObject } from './common/utils';
import { methodNamesFrom, SmartObjectFunctions } from './SmartObjectFunctions';
import { ComputerContext } from './ComputerContext';
import { InlineAlert } from './InlineAlert';
const keywords = ['_id', '_rev', '_owners', '_root', '_satoshis'];
/** Safety cap when walking first → next → … for the timeline */
const MAX_TIMELINE_REVS = 100;
export const getFnParamNames = (fn) => {
    const match = fn.toString().match(/\(.*?\)/);
    return match ? match[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',') : [];
};
function truncateRev(rev, head = 8, tail = 6) {
    if (!rev)
        return '';
    const [txId, vout] = rev.split(':');
    if (!txId || txId.length <= head + tail)
        return rev;
    return `${txId.slice(0, head)}…${txId.slice(-tail)}:${vout ?? '0'}`;
}
function Copy({ text }) {
    const [copied, setCopied] = useState(false);
    if (!text)
        return null;
    return (_jsx("button", { type: "button", onClick: () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }, className: "inline-flex items-center cursor-pointer pl-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white focus:outline-none shrink-0", "aria-label": "Copy", children: copied ? _jsx(HiCheck, { className: "w-4 h-4 text-green-500" }) : _jsx(HiOutlineClipboard, { className: "w-4 h-4" }) }));
}
/** Compact type badge for state values */
function TypeBadge({ type }) {
    return (_jsx("span", { className: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", children: type }));
}
function formatStatePreview(value) {
    if (value === null) {
        return { type: 'null', preview: _jsx("span", { className: "text-gray-400 italic", children: "null" }), full: 'null' };
    }
    if (value === undefined) {
        return {
            type: 'undefined',
            preview: _jsx("span", { className: "text-gray-400 italic", children: "undefined" }),
            full: 'undefined',
        };
    }
    if (typeof value === 'boolean') {
        return {
            type: 'boolean',
            preview: (_jsx("span", { className: value ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300', children: String(value) })),
            full: String(value),
        };
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
        return {
            type: typeof value,
            preview: (_jsx("span", { className: "tabular-nums font-medium text-gray-900 dark:text-white", children: value.toString() })),
            full: value.toString(),
        };
    }
    if (typeof value === 'string') {
        if (isValidRevString(value)) {
            return {
                type: 'rev',
                preview: (_jsx(Link, { to: `/objects/${value}`, className: "font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all", children: truncateRev(value) })),
                full: value,
            };
        }
        const short = value.length > 80 ? `${value.slice(0, 80)}…` : value;
        return {
            type: 'string',
            preview: (_jsx("span", { className: "text-gray-900 dark:text-gray-100 break-words", children: value === '' ? _jsx("span", { className: "text-gray-400 italic", children: "empty" }) : short })),
            full: value,
        };
    }
    if (Array.isArray(value)) {
        const full = toObject(value);
        return {
            type: `array[${value.length}]`,
            preview: (_jsxs("span", { className: "text-gray-600 dark:text-gray-300 text-xs", children: [value.length, " item", value.length === 1 ? '' : 's'] })),
            full,
        };
    }
    if (typeof value === 'object') {
        const full = toObject(value);
        const keys = Object.keys(value);
        return {
            type: 'object',
            preview: (_jsxs("span", { className: "text-gray-600 dark:text-gray-300 text-xs", children: [keys.length, " key", keys.length === 1 ? '' : 's', keys.length > 0 ? `: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '…' : ''}` : ''] })),
            full,
        };
    }
    const full = String(value);
    return {
        type: typeof value,
        preview: _jsx("span", { className: "break-all", children: full }),
        full,
    };
}
function StateValueRow({ name, value }) {
    const [expanded, setExpanded] = useState(false);
    const { type, preview, full } = formatStatePreview(value);
    const isComplex = (typeof value === 'object' && value !== null) ||
        (typeof value === 'string' && value.length > 80);
    const showExpand = isComplex || full.length > 80;
    // Link revs inside expanded JSON
    const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g;
    const expandedContent = typeof value === 'string' && !isComplex
        ? full
        : reactStringReplace(full, isRev, (match, i) => (_jsx(Link, { to: `/objects/${match}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline", children: match }, i)));
    return (_jsxs("div", { className: "border-b border-gray-100 dark:border-gray-800 last:border-0", children: [_jsxs("div", { className: "px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 min-h-0", children: [_jsxs("div", { className: "shrink-0 flex items-center gap-1.5 w-[7.5rem] sm:w-36", children: [_jsx("span", { className: "text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap truncate", children: capitalizeFirstLetter(name) }), _jsx("code", { className: "text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap hidden sm:inline", children: name })] }), _jsx(TypeBadge, { type: type }), _jsx("div", { className: "min-w-0 flex-1 text-xs text-gray-700 dark:text-gray-300 truncate", children: preview }), _jsxs("div", { className: "flex items-center gap-0.5 shrink-0", children: [full && full !== 'null' && full !== 'undefined' ? _jsx(Copy, { text: full }) : null, showExpand ? (_jsx("button", { type: "button", onClick: () => setExpanded((v) => !v), className: "text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline px-1", children: expanded ? 'Hide' : 'More' })) : null] })] }), expanded ? (_jsx("pre", { className: "mx-3 sm:mx-4 mb-2 max-h-40 overflow-auto rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 p-2 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed", children: expandedContent })) : null] }));
}
const SmartObjectValues = ({ smartObject }) => {
    if (!smartObject)
        return null;
    const entries = Object.entries(smartObject).filter(([k]) => !keywords.includes(k));
    if (entries.length === 0) {
        return (_jsx("p", { className: "px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400", children: "No public properties on this object." }));
    }
    return (_jsx("div", { children: entries.map(([key, value]) => (_jsx(StateValueRow, { name: key, value: value }, key))) }));
};
/**
 * Single history section at top: nav controls + vertical timeline (revs linked by a line).
 */
function RevisionHistory({ prev, next, first, latest, current, chain, loading, ancestorTxIds, }) {
    const isLatest = latest ? latest === current : !next;
    const isFirst = first ? first === current : !prev;
    const currentIndex = useMemo(() => chain.findIndex((r) => r === current), [chain, current]);
    const btnBase = 'inline-flex items-center justify-center gap-1.5 px-3 h-9 text-sm font-medium rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800';
    const btnActive = 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border-blue-600';
    const btnIdle = 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700';
    const btnDisabled = 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700';
    return (_jsxs("section", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden", "aria-label": "Revision history", children: [_jsxs("div", { className: "px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white", children: "Revision history" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: !loading && chain.length > 0
                                    ? `${chain.length} revision${chain.length === 1 ? '' : 's'}${currentIndex >= 0 ? ` · viewing #${currentIndex + 1}` : ''}`
                                    : 'Navigate between object revisions' })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-1.5 text-xs", children: [isFirst ? (_jsx("span", { className: "inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200", children: "First" })) : null, isLatest ? (_jsx("span", { className: "inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", children: "Latest" })) : (_jsx("span", { className: "inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", children: "Historical" }))] })] }), _jsxs("div", { className: "px-4 py-3 space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [first && first !== current ? (_jsx(Link, { to: `/objects/${first}`, className: `${btnBase} ${btnIdle}`, title: first, children: "First" })) : (_jsx("span", { className: `${btnBase} ${btnDisabled}`, children: "First" })), prev ? (_jsxs(Link, { to: `/objects/${prev}`, className: `${btnBase} ${btnActive}`, title: prev, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": true, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Previous"] })) : (_jsxs("span", { className: `${btnBase} ${btnDisabled}`, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": true, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Previous"] })), next ? (_jsxs(Link, { to: `/objects/${next}`, className: `${btnBase} ${btnActive}`, title: next, children: ["Next", _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": true, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })) : (_jsxs("span", { className: `${btnBase} ${btnDisabled}`, children: ["Next", _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": true, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })), latest && latest !== current ? (_jsx(Link, { to: `/objects/${latest}`, className: `${btnBase} ${btnIdle}`, title: latest, children: "Latest" })) : (_jsx("span", { className: `${btnBase} ${btnDisabled}`, children: "Latest" }))] }), loading ? (_jsxs("div", { className: "animate-pulse space-y-2 ms-2", children: [_jsx("div", { className: "h-14 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" }), _jsx("div", { className: "h-14 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6" }), _jsx("div", { className: "h-14 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/6" })] })) : chain.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No revision history available." })) : (_jsx("ol", { className: "relative border-s border-gray-200 dark:border-gray-700 ms-2", children: chain.map((r, i) => {
                            const isCurrent = r === current;
                            const isChainFirst = i === 0;
                            const isChainLast = i === chain.length - 1;
                            return (_jsxs("li", { className: "ms-4 pb-4 last:pb-0", children: [_jsx("span", { className: `absolute flex items-center justify-center w-3 h-3 rounded-full -start-1.5 mt-1.5 ring-2 ring-white dark:ring-gray-900 ${isCurrent
                                            ? 'bg-blue-600'
                                            : isChainLast
                                                ? 'bg-green-500'
                                                : 'bg-gray-300 dark:bg-gray-600'}` }), _jsxs("div", { className: `rounded-lg border px-3 py-2 ${isCurrent
                                            ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40'
                                            : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50'}`, children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-0.5", children: [_jsxs("span", { className: "text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400", children: ["#", i + 1] }), isChainFirst ? (_jsx("span", { className: "text-[10px] rounded px-1.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200", children: "first" })) : null, isChainLast ? (_jsx("span", { className: "text-[10px] rounded px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", children: "latest" })) : null, isCurrent ? (_jsx("span", { className: "text-[10px] rounded px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200", children: "viewing" })) : null] }), isCurrent ? (_jsx("p", { className: "font-mono text-xs text-gray-900 dark:text-white break-all", children: r })) : (_jsx(Link, { to: `/objects/${r}`, className: "font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all", children: r })), _jsx("div", { className: "mt-1", children: _jsx(Link, { to: `/transactions/${r.split(':')[0]}`, className: "text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400", children: "View transaction \u2192" }) })] })] }, r));
                        }) })), (prev || next) && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800", children: [prev ? (_jsxs("p", { className: "truncate", title: prev, children: [_jsx("span", { className: "text-gray-400 dark:text-gray-500 font-sans", children: "prev " }), _jsx(Link, { to: `/objects/${prev}`, className: "text-blue-600 dark:text-blue-400 hover:underline", children: truncateRev(prev) })] })) : (_jsx("p", { className: "text-gray-400 font-sans", children: "No previous revision" })), next ? (_jsxs("p", { className: "truncate sm:text-right", title: next, children: [_jsx("span", { className: "text-gray-400 dark:text-gray-500 font-sans", children: "next " }), _jsx(Link, { to: `/objects/${next}`, className: "text-blue-600 dark:text-blue-400 hover:underline", children: truncateRev(next) })] })) : (_jsx("p", { className: "text-gray-400 sm:text-right font-sans", children: "No next revision" }))] })), ancestorTxIds.length > 0 ? (_jsxs("details", { className: "text-sm", children: [_jsxs("summary", { className: "cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200", children: ["Ancestor transactions (", ancestorTxIds.length, ")"] }), _jsx("ul", { className: "mt-2 space-y-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-2", children: ancestorTxIds.map((txId) => (_jsx("li", { children: _jsx(Link, { to: `/transactions/${txId}`, className: "font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all", children: txId }) }, txId))) })] })) : null] })] }));
}
function MetaDataPanel({ smartObject }) {
    if (!smartObject)
        return null;
    const rows = [
        {
            label: 'Identity',
            short: '_id',
            value: smartObject._id ? (_jsx(Link, { to: `/objects/${smartObject._id}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline break-all font-mono text-xs", children: smartObject._id })) : ('—'),
            copy: smartObject._id,
        },
        {
            label: 'Revision',
            short: '_rev',
            value: smartObject._rev ? (_jsx(Link, { to: `/objects/${smartObject._rev}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline break-all font-mono text-xs", children: smartObject._rev })) : ('—'),
            copy: smartObject._rev,
        },
        {
            label: 'Root',
            short: '_root',
            value: smartObject._root ? (_jsx(Link, { to: `/objects/${smartObject._root}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline break-all font-mono text-xs", children: smartObject._root })) : ('—'),
            copy: smartObject._root,
        },
        {
            label: 'Owners',
            short: '_owners',
            value: (_jsx("span", { className: "font-mono text-xs text-gray-900 dark:text-white break-all", children: Array.isArray(smartObject._owners)
                    ? smartObject._owners.join(', ')
                    : String(smartObject._owners ?? '—') })),
            copy: JSON.stringify(smartObject._owners ?? null),
        },
        {
            label: 'Amount',
            short: '_satoshis',
            value: (_jsxs("span", { className: "font-medium text-gray-900 dark:text-white tabular-nums text-sm", children: [smartObject._satoshis?.toString?.() ?? String(smartObject._satoshis ?? '—'), _jsx("span", { className: "ml-1 text-xs font-normal text-gray-500 dark:text-gray-400", children: "sats" })] })),
            copy: String(smartObject._satoshis ?? ''),
        },
    ];
    return (_jsxs("section", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden", "aria-label": "Metadata", children: [_jsxs("div", { className: "px-4 py-2.5 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white", children: "Metadata" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: "On-chain identity fields for this smart object" })] }), _jsx("dl", { className: "divide-y divide-gray-100 dark:divide-gray-800", children: rows.map((row) => (_jsxs("div", { className: "px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 min-h-0", children: [_jsxs("dt", { className: "shrink-0 flex items-center gap-1.5 w-[9.5rem] sm:w-40", children: [_jsx("span", { className: "text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap", children: row.label }), _jsx("code", { className: "text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap", children: row.short })] }), _jsxs("dd", { className: "min-w-0 flex-1 flex items-center gap-0.5 text-xs text-gray-700 dark:text-gray-300", children: [_jsx("span", { className: "min-w-0 flex-1 truncate sm:whitespace-normal sm:break-all", children: row.value }), row.copy ? _jsx(Copy, { text: row.copy }) : null] })] }, row.short))) })] }));
}
/**
 * Build chronological object revs: first → next → … → latest (capped).
 */
async function buildRevisionChain(computer, rev) {
    const [firstRev, latestRev] = await Promise.all([computer.first(rev), computer.latest(rev)]);
    const chain = [firstRev];
    let cursor = firstRev;
    const seen = new Set([firstRev]);
    while (chain.length < MAX_TIMELINE_REVS) {
        if (cursor === latestRev)
            break;
        const n = await computer.next(cursor);
        if (!n || seen.has(n))
            break;
        seen.add(n);
        chain.push(n);
        cursor = n;
    }
    if (!seen.has(rev))
        chain.push(rev);
    if (!seen.has(latestRev) && latestRev !== rev)
        chain.push(latestRev);
    return chain;
}
function Component({ title }) {
    const location = useLocation();
    const params = useParams();
    const rev = params.rev || '';
    const computer = useContext(ComputerContext);
    const [smartObject, setSmartObject] = useState(null);
    const [next, setNext] = useState(undefined);
    const [prev, setPrev] = useState(undefined);
    const [first, setFirst] = useState(undefined);
    const [latest, setLatest] = useState(undefined);
    const [timeline, setTimeline] = useState([]);
    const [ancestorTxIds, setAncestorTxIds] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(true);
    const [functionsExist, setFunctionsExist] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const options = ['object', 'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol'];
    useEffect(() => {
        if (!rev)
            return;
        let cancelled = false;
        setSmartObject(null);
        setPrev(undefined);
        setNext(undefined);
        setFirst(undefined);
        setLatest(undefined);
        setTimeline([]);
        setAncestorTxIds([]);
        setTimelineLoading(true);
        setLoadError(null);
        const fetchCore = async () => {
            try {
                const o = await computer.sync(rev);
                if (cancelled)
                    return;
                setSmartObject(o);
                setLoadError(null);
            }
            catch (err) {
                if (cancelled)
                    return;
                const message = err instanceof Error ? err.message : 'Could not load this smart object revision';
                console.log('Error syncing to object:', message);
                setLoadError(message);
                setSmartObject(null);
            }
            try {
                const [p, n, f, l] = await Promise.all([
                    computer.prev(rev),
                    computer.next(rev),
                    computer.first(rev).catch(() => rev),
                    computer.latest(rev).catch(() => rev),
                ]);
                if (cancelled)
                    return;
                setPrev(p);
                setNext(n);
                setFirst(f);
                setLatest(l);
            }
            catch (err) {
                console.warn('Error loading revision links', err);
            }
        };
        const fetchTimeline = async () => {
            try {
                const [chain, ancestors] = await Promise.all([
                    buildRevisionChain(computer, rev),
                    computer.getAncestors(rev).catch(() => []),
                ]);
                if (cancelled)
                    return;
                setTimeline(chain);
                setAncestorTxIds(Array.isArray(ancestors) ? ancestors : []);
            }
            catch (err) {
                if (!cancelled) {
                    console.warn('Error building revision timeline', err);
                    setTimeline([rev]);
                }
            }
            finally {
                if (!cancelled)
                    setTimelineLoading(false);
            }
        };
        fetchCore();
        fetchTimeline();
        return () => {
            cancelled = true;
        };
    }, [computer, rev, location]);
    useEffect(() => {
        if (!smartObject) {
            setFunctionsExist(false);
            return;
        }
        setFunctionsExist(methodNamesFrom(smartObject).length > 0);
    }, [smartObject]);
    const [txId, outNum] = rev.split(':');
    const loading = !smartObject && !loadError;
    const decryptDenied = isDecryptionFailure(loadError);
    return (_jsxs("div", { className: "w-full space-y-5", children: [_jsxs("header", { children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Smart object" }), _jsx("h1", { className: "mb-2 text-xl sm:text-2xl font-semibold dark:text-white", children: title || 'Object' }), _jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1", children: "Revision" }), _jsxs("div", { className: "flex flex-wrap items-center gap-1 font-mono text-xs sm:text-sm break-all", children: [_jsx(Link, { to: `/transactions/${txId}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline", children: txId }), _jsxs("span", { className: "text-gray-700 dark:text-gray-300", children: [":", outNum] }), _jsx(Copy, { text: `${txId}:${outNum}` })] }), smartObject?._satoshis != null ? (_jsxs("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: smartObject._satoshis.toString() }), ' ', "sats", Array.isArray(smartObject._owners) && smartObject._owners.length > 0 ? (_jsxs(_Fragment, { children: [' · ', _jsxs("span", { className: "font-mono text-xs", children: [String(smartObject._owners[0]).slice(0, 12), "\u2026"] })] })) : null] })) : null] })] }), loadError && decryptDenied ? (_jsxs(InlineAlert, { variant: "info", title: "You cannot decrypt this object", children: [_jsx("p", { className: "mb-2", children: "Only wallets whose public key is listed in this object's _readers can read its state." }), _jsx("p", { className: "text-xs opacity-90", children: _jsx(Link, { to: `/transactions/${txId}`, className: "font-medium underline underline-offset-2 hover:opacity-100", children: "View transaction" }) })] })) : null, loadError && !decryptDenied ? (_jsxs(InlineAlert, { variant: "error", title: "Could not load object", onDismiss: () => setLoadError(null), children: [_jsx("p", { className: "mb-2", children: loadError }), _jsxs("p", { className: "text-xs opacity-90", children: ["This revision may not be a smart object, or the node failed to evaluate it.", ' ', _jsx(Link, { to: `/transactions/${txId}`, className: "font-medium underline underline-offset-2 hover:opacity-100", children: "View transaction" })] })] })) : null, loading ? (_jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-36 rounded-xl bg-gray-200 dark:bg-gray-700" }), _jsx("div", { className: "h-48 rounded-xl bg-gray-200 dark:bg-gray-700" }), _jsx("div", { className: "h-40 rounded-xl bg-gray-200 dark:bg-gray-700" }), _jsx("div", { className: "h-28 rounded-xl bg-gray-200 dark:bg-gray-700" })] })) : null, smartObject ? (_jsxs(_Fragment, { children: [_jsxs("section", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden", "aria-label": "State", children: [_jsxs("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white", children: "State" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: "Public properties of this smart object at the current revision \u2014 the data stored on chain after evaluation (not including system fields like _id or _owners)." })] }), _jsx(SmartObjectValues, { smartObject: smartObject })] }), _jsx(SmartObjectFunctions, { smartObject: smartObject, functionsExist: functionsExist, options: options, latestRev: latest })] })) : null, _jsx(RevisionHistory, { prev: prev, next: next, first: first, latest: latest, current: rev, chain: timeline, loading: timelineLoading, ancestorTxIds: ancestorTxIds }), smartObject ? _jsx(MetaDataPanel, { smartObject: smartObject }) : null] }));
}
export const SmartObject = {
    Component,
};
