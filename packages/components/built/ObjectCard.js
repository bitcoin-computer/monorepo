import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { bigIntToStr, jsonMap, strip, toObject } from './common/utils';
import { limitConcurrency } from './common/limitConcurrency';
function truncateMiddle(value, head = 6, tail = 4) {
    if (!value || value.length <= head + tail + 1)
        return value;
    return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
function truncateRev(rev) {
    const [txId, vout] = rev.split(':');
    if (!txId)
        return rev;
    return `${truncateMiddle(txId, 8, 6)}:${vout ?? '0'}`;
}
function truncateMod(mod) {
    if (!mod)
        return 'Unknown';
    return truncateRev(mod);
}
function SkeletonLines() {
    return (_jsxs("div", { className: "animate-pulse space-y-2 mt-3", "aria-hidden": "true", children: [_jsx("div", { className: "h-2.5 bg-gray-200 rounded dark:bg-gray-700 w-3/4" }), _jsx("div", { className: "h-2.5 bg-gray-200 rounded dark:bg-gray-700 w-full" }), _jsx("div", { className: "h-2.5 bg-gray-200 rounded dark:bg-gray-700 w-5/6" })] }));
}
function stateToPreview(synced) {
    try {
        return toObject(jsonMap(strip)(synced));
    }
    catch {
        return toObject(synced);
    }
}
export function ObjectCard({ record, computer, chain, progressiveSync = true, }) {
    const cardRef = useRef(null);
    const [inView, setInView] = useState(false);
    const [statePreview, setStatePreview] = useState(null);
    const [syncError, setSyncError] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const displayChain = chain || computer.getChain?.() || '';
    useEffect(() => {
        if (!progressiveSync)
            return undefined;
        const el = cardRef.current;
        if (!el)
            return undefined;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                setInView(true);
                observer.disconnect();
            }
        }, { rootMargin: '120px', threshold: 0.01 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [progressiveSync]);
    useEffect(() => {
        if (!progressiveSync || !inView)
            return undefined;
        if (statePreview !== null)
            return undefined;
        let cancelled = false;
        setSyncing(true);
        setSyncError(null);
        // Evaluation cache is Computer/Db-owned; we only rate-limit concurrent chain evals.
        limitConcurrency(() => computer.sync(record.rev))
            .then((synced) => {
            if (cancelled)
                return;
            setStatePreview(stateToPreview(synced));
        })
            .catch((err) => {
            if (cancelled)
                return;
            setSyncError(err instanceof Error ? err.message : 'Failed to load object state');
        })
            .finally(() => {
            if (!cancelled)
                setSyncing(false);
        });
        return () => {
            cancelled = true;
        };
    }, [progressiveSync, inView, record.rev, computer, statePreview]);
    const satoshis = typeof record.satoshis === 'bigint' ? record.satoshis : BigInt(record.satoshis ?? 0);
    return (_jsxs("div", { ref: cardRef, className: "block w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors text-left h-full", children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [_jsx("span", { className: "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-mono max-w-[60%] truncate", title: record.mod || 'No module', children: record.mod ? truncateMod(record.mod) : 'Object' }), record.blockHeight != null ? (_jsxs("span", { className: "text-xs text-green-700 dark:text-green-400 whitespace-nowrap", children: ["#", record.blockHeight] })) : (_jsx("span", { className: "text-xs text-amber-700 dark:text-amber-400 whitespace-nowrap", children: "Mempool" }))] }), _jsxs("div", { className: "mb-2", children: [_jsxs("p", { className: "text-lg font-semibold text-gray-900 dark:text-white tabular-nums", children: [bigIntToStr(satoshis), displayChain ? (_jsx("span", { className: "ml-1 text-sm font-medium text-gray-500 dark:text-gray-400", children: displayChain })) : null] }), _jsx("p", { className: "text-xs font-mono text-gray-500 dark:text-gray-400 break-all", title: record.rev, children: truncateRev(record.rev) })] }), record.address ? (_jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500", children: "Owner" }), _jsx("p", { className: "text-xs font-mono text-gray-700 dark:text-gray-300 truncate", title: record.address, children: truncateMiddle(record.address, 10, 8) })] })) : null, _jsxs("div", { className: "border-t border-gray-100 dark:border-gray-700 pt-2 mt-1 min-h-[4.5rem]", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500", children: "State" }), syncing && !statePreview ? _jsx(SkeletonLines, {}) : null, syncError && !statePreview ? (_jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-400 line-clamp-3", children: syncError })) : null, statePreview ? (_jsx("pre", { className: "mt-1 font-normal overflow-hidden text-gray-700 dark:text-gray-400 text-xs max-h-24 whitespace-pre-wrap break-words", children: statePreview.length > 280 ? `${statePreview.slice(0, 280)}…` : statePreview })) : null, !progressiveSync && !statePreview && !syncing ? (_jsx("p", { className: "mt-1 text-xs text-gray-400 dark:text-gray-500", children: "Metadata only" })) : null] })] }));
}
export function ObjectCardSkeleton() {
    return (_jsxs("div", { className: "block w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 animate-pulse", children: [_jsx("div", { className: "h-5 bg-gray-200 rounded dark:bg-gray-700 w-1/3 mb-3" }), _jsx("div", { className: "h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded dark:bg-gray-700 w-2/3 mb-4" }), _jsx("div", { className: "h-3 bg-gray-200 rounded dark:bg-gray-700 w-full mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded dark:bg-gray-700 w-5/6" })] }));
}
