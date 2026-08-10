import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { initFlowbite } from 'flowbite';
import { ComputerContext } from './ComputerContext';
import { ObjectCard, ObjectCardSkeleton } from './ObjectCard';
const DOCS_URL = 'https://docs.bitcoincomputer.io/';
/** Normalize URL search params into a getOUTXOs-compatible query. */
export function queryFromSearchParams(search) {
    const raw = Object.fromEntries(new URLSearchParams(search));
    const out = {};
    // public-key was used historically; API expects publicKey
    const publicKey = raw.publicKey || raw['public-key'];
    if (publicKey)
        out.publicKey = publicKey.trim();
    if (raw.mod)
        out.mod = raw.mod.trim();
    if (raw.address)
        out.address = raw.address.trim();
    if (raw.order === 'ASC' || raw.order === 'DESC')
        out.order = raw.order;
    if (raw.isObject === 'true' || raw.isObject === '1')
        out.isObject = true;
    if (raw.isObject === 'false' || raw.isObject === '0')
        out.isObject = false;
    return out;
}
function FromRecords({ records, computer, }) {
    const chain = computer.getChain();
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mt-4 w-full", children: records.map((record) => (_jsx("div", { children: _jsx(Link, { to: `/objects/${record.rev}`, className: "block font-medium text-blue-600 dark:text-blue-500 h-full", children: _jsx(ObjectCard, { record: record, computer: computer, chain: chain }) }) }, record.rev))) }));
}
function Pagination({ isPrevAvailable, handlePrev, isNextAvailable, handleNext }) {
    return (_jsx("nav", { className: "flex items-center justify-between", "aria-label": "Table navigation", children: _jsxs("ul", { className: "inline-flex items-center -space-x-px", children: [_jsx("li", { children: _jsxs("button", { type: "button", disabled: !isPrevAvailable, onClick: handlePrev, className: "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white", children: [_jsx("span", { className: "sr-only", children: "Previous" }), _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 1 1 5l4 4" }) })] }) }), _jsx("li", { children: _jsxs("button", { type: "button", disabled: !isNextAvailable, onClick: handleNext, className: "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white", children: [_jsx("span", { className: "sr-only", children: "Next" }), _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 9 4-4-4-4" }) })] }) })] }) }));
}
function EmptyObjectsState() {
    return (_jsxs("div", { className: "w-full py-12 px-4 text-center", children: [_jsx("h1", { className: "mb-3 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white", children: "No smart objects yet" }), _jsxs("p", { className: "mb-6 max-w-xl mx-auto text-base text-gray-600 dark:text-gray-400", children: ["On Bitcoin Computer, a ", _jsx("strong", { className: "font-semibold text-gray-800 dark:text-gray-200", children: "smart object" }), ' ', "is on-chain application state you can own, update, and call methods on \u2014 not just a bare UTXO. Create one in the Playground, or learn how objects work in the docs."] }), _jsxs("div", { className: "flex flex-wrap items-center justify-center gap-3", children: [_jsx(Link, { to: "/playground", className: "inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800", children: "Open Playground" }), _jsx("a", { href: DOCS_URL, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700", children: "Read the docs" })] })] }));
}
function GallerySkeletons({ count = 6 }) {
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mt-4 w-full", children: Array.from({ length: count }, (_, i) => (_jsx(ObjectCardSkeleton, {}, i))) }));
}
export function GalleryWithPagination(q = {}) {
    const contractsPerPage = 12;
    const computer = useContext(ComputerContext);
    const [pageNum, setPageNum] = useState(0);
    const [isNextAvailable, setIsNextAvailable] = useState(true);
    const [isPrevAvailable, setIsPrevAvailable] = useState(false);
    const [showNoAsset, setShowNoAsset] = useState(false);
    const [records, setRecords] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);
    const location = useLocation();
    useEffect(() => {
        initFlowbite();
    }, []);
    // Reset to first page when filters change
    useEffect(() => {
        setPageNum(0);
        setIsPrevAvailable(false);
    }, [location.search]);
    useEffect(() => {
        let cancelled = false;
        const fetchPage = async () => {
            setListLoading(true);
            setListError(null);
            setShowNoAsset(false);
            try {
                const fromUrl = queryFromSearchParams(location.search);
                const isObject = fromUrl.isObject !== undefined ? Boolean(fromUrl.isObject) : (q.isObject ?? true);
                const order = fromUrl.order || q.order || 'DESC';
                const publicKey = fromUrl.publicKey || q.publicKey;
                const mod = fromUrl.mod || q.mod;
                const address = fromUrl.address || q.address;
                const result = await computer.getOUTXOs({
                    verbosity: 1,
                    isObject,
                    offset: contractsPerPage * pageNum,
                    limit: contractsPerPage + 1,
                    order,
                    ...(publicKey ? { publicKey } : {}),
                    ...(mod ? { mod } : {}),
                    ...(address ? { address } : {}),
                });
                if (cancelled)
                    return;
                setIsNextAvailable(result.length > contractsPerPage);
                setIsPrevAvailable(pageNum > 0);
                setRecords(result.slice(0, contractsPerPage));
                if (pageNum === 0 && result.length === 0)
                    setShowNoAsset(true);
            }
            catch (err) {
                if (cancelled)
                    return;
                console.error('Error fetching objects', err);
                setListError(err instanceof Error ? err.message : 'Error fetching objects');
                setRecords([]);
                setIsNextAvailable(false);
                if (pageNum === 0)
                    setShowNoAsset(true);
            }
            finally {
                if (!cancelled)
                    setListLoading(false);
            }
        };
        fetchPage();
        return () => {
            cancelled = true;
        };
        // q identity is not stable across parent re-renders
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [computer, pageNum, location.search, q.mod, q.publicKey, q.address, q.order, q.isObject]);
    const handleNext = () => {
        setPageNum((n) => n + 1);
    };
    const handlePrev = () => {
        setPageNum((n) => Math.max(0, n - 1));
    };
    return (_jsxs("div", { className: "relative sm:rounded-lg pt-4 w-full", children: [listLoading && records.length === 0 ? _jsx(GallerySkeletons, {}) : null, listError && !listLoading ? (_jsx("div", { className: "py-8 text-center", children: _jsx("p", { className: "text-red-600 dark:text-red-400 mb-2", children: listError }) })) : null, !listLoading && showNoAsset ? _jsx(EmptyObjectsState, {}) : null, records.length > 0 ? _jsx(FromRecords, { records: records, computer: computer }) : null, !(pageNum === 0 && records.length === 0) && !listLoading ? (_jsx(Pagination, { isPrevAvailable: isPrevAvailable, handlePrev: handlePrev, isNextAvailable: isNextAvailable, handleNext: handleNext })) : null] }));
}
/** @deprecated Prefer metadata-first Gallery.WithPagination; kept for apps that pass raw revs. */
function FromRevs({ revs, computer }) {
    const [records, setRecords] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                if (revs.length === 0) {
                    setRecords([]);
                    return;
                }
                // Fetch metadata for known revs when possible
                const results = await Promise.all(revs.map(async (rev) => {
                    try {
                        const rows = await computer.getOUTXOs({
                            rev,
                            verbosity: 1,
                        });
                        if (rows[0])
                            return rows[0];
                    }
                    catch {
                        // fall through
                    }
                    return {
                        rev,
                        address: '',
                        satoshis: 0n,
                        asm: '',
                    };
                }));
                if (!cancelled)
                    setRecords(results);
            }
            catch {
                if (!cancelled) {
                    setRecords(revs.map((rev) => ({
                        rev,
                        address: '',
                        satoshis: 0n,
                        asm: '',
                    })));
                }
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [revs, computer]);
    if (!records) {
        return _jsx(GallerySkeletons, { count: Math.min(revs.length || 3, 6) });
    }
    return _jsx(FromRecords, { records: records, computer: computer });
}
export const Gallery = {
    FromRevs,
    WithPagination: GalleryWithPagination,
};
