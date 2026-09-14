import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { protoConstructorName, refineObjectClassName } from './common/className';
import { isDecryptionFailure } from './common/transition';
import { limitConcurrency } from './common/limitConcurrency';
import { ObjectStateTable } from './ObjectStateTable';
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
export function ObjectCard({ record, computer, progressiveSync = true }) {
    const cardRef = useRef(null);
    const [inView, setInView] = useState(false);
    const [syncedObject, setSyncedObject] = useState(null);
    const [encrypted, setEncrypted] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [objectClass, setObjectClass] = useState(undefined);
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
        if (syncedObject !== null)
            return undefined;
        let cancelled = false;
        setSyncing(true);
        setEncrypted(false);
        limitConcurrency(() => computer.sync(record.rev))
            .then((synced) => {
            if (cancelled)
                return;
            setSyncedObject(synced);
        })
            .catch((err) => {
            if (cancelled)
                return;
            // Keep the card; never show a red error on the gallery.
            if (isDecryptionFailure(err))
                setEncrypted(true);
        })
            .finally(() => {
            if (!cancelled)
                setSyncing(false);
        });
        return () => {
            cancelled = true;
        };
    }, [progressiveSync, inView, record.rev, computer, syncedObject]);
    useEffect(() => {
        if (syncedObject == null) {
            setObjectClass(undefined);
            return undefined;
        }
        const immediate = protoConstructorName(syncedObject);
        setObjectClass(immediate);
        let cancelled = false;
        void refineObjectClassName(computer, syncedObject, record.mod).then((refined) => {
            if (!cancelled && refined)
                setObjectClass(refined);
        });
        return () => {
            cancelled = true;
        };
    }, [computer, syncedObject, record.mod]);
    const title = objectClass || 'Object';
    const showTitleSkeleton = syncing && syncedObject === null && !encrypted && !objectClass;
    return (_jsxs("div", { ref: cardRef, className: "block w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-600 transition-colors text-left h-full", children: [_jsxs("div", { className: "flex items-center justify-between gap-2 mb-1", children: [_jsxs("div", { className: "flex items-center gap-1.5 min-w-0 flex-1", children: [showTitleSkeleton ? (_jsx("span", { className: "inline-block h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0", "aria-hidden": "true" })) : (_jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-white truncate min-w-0", title: title, children: title })), record.mod ? (_jsx("span", { className: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-mono truncate max-w-[40%] shrink", title: record.mod, children: truncateRev(record.mod) })) : null, encrypted ? (_jsx("span", { className: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 shrink-0", children: "Encrypted/private" })) : null] }), record.blockHeight != null ? (_jsxs("span", { className: "text-[11px] text-green-700 dark:text-green-400 tabular-nums shrink-0", children: ["#", record.blockHeight] })) : (_jsx("span", { className: "text-[11px] text-amber-700 dark:text-amber-400 shrink-0", children: "Mempool" }))] }), _jsx("p", { className: "text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate", title: record.rev, children: truncateRev(record.rev) }), (syncing || syncedObject !== null || encrypted) && (_jsxs("div", { className: "border-t border-gray-100 dark:border-gray-700 pt-1.5 mt-1.5", children: [syncing && syncedObject === null && !encrypted ? (_jsxs("div", { className: "animate-pulse space-y-1", "aria-hidden": "true", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded dark:bg-gray-700 w-full" }), _jsx("div", { className: "h-8 bg-gray-200 rounded dark:bg-gray-700 w-5/6" }), _jsx("div", { className: "h-8 bg-gray-200 rounded dark:bg-gray-700 w-2/3" })] })) : null, encrypted && syncedObject === null ? (_jsx("p", { className: "text-[11px] text-gray-500 dark:text-gray-400", children: "Encrypted/private" })) : null, syncedObject !== null ? _jsx(ObjectStateTable, { smartObject: syncedObject }) : null] }))] }));
}
export function ObjectCardSkeleton() {
    return (_jsxs("div", { className: "block w-full p-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 animate-pulse", children: [_jsxs("div", { className: "flex items-center justify-between gap-2 mb-1.5", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3" }), _jsx("div", { className: "h-3 bg-gray-200 rounded dark:bg-gray-700 w-10" })] }), _jsx("div", { className: "h-3 bg-gray-200 rounded dark:bg-gray-700 w-2/3 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded dark:bg-gray-700 w-full" })] }));
}
