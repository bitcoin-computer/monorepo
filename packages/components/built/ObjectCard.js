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
        return 'Object';
    return truncateRev(mod);
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
    return (_jsxs("div", { ref: cardRef, className: "block w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-600 transition-colors text-left h-full", children: [_jsxs("div", { className: "flex items-center justify-between gap-2 mb-1.5", children: [_jsx("span", { className: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-mono max-w-[65%] truncate", title: record.mod || 'No module', children: record.mod ? truncateMod(record.mod) : 'Object' }), record.blockHeight != null ? (_jsxs("span", { className: "text-[11px] text-green-700 dark:text-green-400 tabular-nums", children: ["#", record.blockHeight] })) : (_jsx("span", { className: "text-[11px] text-amber-700 dark:text-amber-400", children: "Mempool" }))] }), _jsxs("p", { className: "text-sm font-semibold text-gray-900 dark:text-white tabular-nums leading-tight", children: [bigIntToStr(satoshis), displayChain ? (_jsx("span", { className: "ml-1 text-xs font-medium text-gray-500 dark:text-gray-400", children: displayChain })) : null] }), _jsx("p", { className: "text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate mt-0.5", title: record.rev, children: truncateRev(record.rev) }), record.address ? (_jsxs("p", { className: "mt-1.5 text-[11px] font-mono text-gray-600 dark:text-gray-300 truncate", title: record.address, children: [_jsx("span", { className: "text-gray-400 dark:text-gray-500", children: "owner " }), truncateMiddle(record.address, 8, 6)] })) : null, (syncing || statePreview || syncError) && (_jsxs("div", { className: "border-t border-gray-100 dark:border-gray-700 pt-1.5 mt-1.5", children: [syncing && !statePreview ? (_jsxs("div", { className: "animate-pulse space-y-1", "aria-hidden": "true", children: [_jsx("div", { className: "h-2 bg-gray-200 rounded dark:bg-gray-700 w-3/4" }), _jsx("div", { className: "h-2 bg-gray-200 rounded dark:bg-gray-700 w-1/2" })] })) : null, syncError && !statePreview ? (_jsx("p", { className: "text-[11px] text-red-600 dark:text-red-400 line-clamp-2", children: syncError })) : null, statePreview ? (_jsx("pre", { className: "font-normal overflow-hidden text-gray-600 dark:text-gray-400 text-[11px] max-h-14 whitespace-pre-wrap break-words leading-snug", children: statePreview.length > 160 ? `${statePreview.slice(0, 160)}…` : statePreview })) : null] }))] }));
}
export function ObjectCardSkeleton() {
    return (_jsxs("div", { className: "block w-full p-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3 mb-2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mb-1" }), _jsx("div", { className: "h-3 bg-gray-200 rounded dark:bg-gray-700 w-2/3" })] }));
}
