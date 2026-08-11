import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { Transaction as BCTransaction } from '@bitcoin-computer/lib';
import { Card } from './Card';
import { ComputerContext } from './ComputerContext';
import { HiOutlineRefresh, HiOutlineClipboard, HiCheck } from 'react-icons/hi';
function CopyIconButton({ text }) {
    const [copied, setCopied] = useState(false);
    return (_jsx("button", { type: "button", onClick: () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }, className: "inline-flex p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700", "aria-label": "Copy", children: copied ? (_jsx(HiCheck, { className: "w-4 h-4 text-green-500" })) : (_jsx(HiOutlineClipboard, { className: "w-4 h-4" })) }));
}
function truncateMiddle(value, head = 8, tail = 6) {
    if (!value || value.length <= head + tail + 1)
        return value;
    return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
function formatRpcValue(value) {
    if (typeof value === 'number')
        return value.toFixed(8).replace(/\.?0+$/, '') || '0';
    if (typeof value === 'string')
        return value;
    return String(value ?? '—');
}
function ExpressionCard({ content, env }) {
    const entries = Object.entries(env);
    let formattedContent = content;
    entries.forEach((entry) => {
        const [name, rev] = entry;
        const regExp = new RegExp(`(${name})`, 'g');
        const replacer = (n, ind) => (_jsx(Link, { to: `/objects/${rev}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline", children: n }, `${rev}|${ind}`));
        formattedContent = reactStringReplace(formattedContent, regExp, replacer);
    });
    return _jsx(Card, { content: formattedContent });
}
function SpendsCell({ utxo }) {
    const computer = useContext(ComputerContext);
    const [spends, setSpends] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchSpends = async () => {
            try {
                const res = await computer.spendingInput(utxo);
                setSpends(res);
            }
            catch {
                setSpends(undefined);
            }
            finally {
                setLoading(false);
            }
        };
        fetchSpends();
    }, [computer, utxo]);
    if (loading) {
        return _jsx(HiOutlineRefresh, { className: "animate-spin text-blue-600 dark:text-blue-400 w-4 h-4" });
    }
    if (!spends) {
        return (_jsx("span", { className: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", children: "Unspent" }));
    }
    const [spTxid, spVout] = spends.split(':');
    const trimmed = spTxid ? `${truncateMiddle(spTxid, 6, 4)}:${spVout || ''}` : spends;
    return (_jsx(Link, { to: `/objects/${spends}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs", title: spends, children: trimmed }));
}
export const outputsComponent = ({ rpcTxnData, txn, }) => (_jsxs("section", { className: "w-full", children: [_jsx("h2", { className: "mb-2 text-base sm:text-lg font-semibold dark:text-white", children: "Outputs" }), _jsx("div", { className: "relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm", children: _jsxs("table", { className: "w-full text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/80 dark:text-gray-300", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-4 py-3", children: "#" }), _jsx("th", { scope: "col", className: "px-4 py-3", children: "Value" }), _jsx("th", { scope: "col", className: "px-4 py-3", children: "Type" }), _jsx("th", { scope: "col", className: "px-4 py-3 hidden md:table-cell", children: "Script" }), _jsx("th", { scope: "col", className: "px-4 py-3", children: "Spent by" })] }) }), _jsx("tbody", { children: rpcTxnData?.vout?.map((output) => (_jsxs("tr", { className: "bg-white border-b last:border-0 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40", children: [_jsx("td", { className: "px-4 py-3", children: _jsx(Link, { to: `/objects/${txn}:${output.n}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline tabular-nums", children: output.n }) }), _jsx("td", { className: "px-4 py-3 tabular-nums font-medium text-gray-900 dark:text-white", children: formatRpcValue(output.value) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "inline-flex rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200", children: output.scriptPubKey?.type || '—' }) }), _jsx("td", { className: "px-4 py-3 break-all font-mono text-xs max-w-xs truncate hidden md:table-cell", title: output.scriptPubKey?.asm, children: output.scriptPubKey?.asm || '—' }), _jsx("td", { className: "px-4 py-3", children: txn ? _jsx(SpendsCell, { utxo: `${txn}:${output.n}` }) : _jsx("span", { children: "\u2014" }) })] }, output.n))) })] }) })] }));
function InputRevCell({ utxo, checkForSpentInput }) {
    const computer = useContext(ComputerContext);
    const [spends, setSpends] = useState(null);
    useEffect(() => {
        if (checkForSpentInput) {
            setSpends(null);
            const fetch = async () => {
                try {
                    const res = await computer.spendingInput(utxo);
                    setSpends(res || undefined);
                }
                catch (err) {
                    console.error('Error fetching spending input:', err);
                    setSpends(undefined);
                }
            };
            fetch();
        }
        else {
            setSpends(undefined);
        }
    }, [checkForSpentInput, utxo, computer]);
    const isLoading = spends === null;
    const isSpent = typeof spends === 'string';
    const linkClass = isSpent
        ? 'font-medium text-red-600 dark:text-red-400 hover:underline font-mono text-xs break-all'
        : 'font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs break-all';
    let trimmed = '';
    let spendingTxId = '';
    if (isSpent) {
        const [txId, vIn] = spends.split(':');
        spendingTxId = txId;
        trimmed = `${truncateMiddle(txId, 6, 4)}:${vIn || ''}`;
    }
    return (_jsxs("div", { className: "relative group inline-block max-w-full", children: [_jsx(Link, { to: `/objects/${utxo}`, className: linkClass, title: utxo, children: truncateMiddle(utxo, 12, 10) }), isLoading && (_jsx(HiOutlineRefresh, { className: "inline ml-2 animate-spin text-blue-600 dark:text-blue-400 w-4 h-4" })), isSpent && (_jsxs("div", { className: "absolute left-1/2 z-10 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 group-hover:opacity-100 bottom-full -translate-x-1/2 mb-3 whitespace-nowrap", children: ["Already spent in", ' ', _jsx(Link, { to: `/transactions/${spendingTxId}`, className: "font-medium text-blue-300 hover:underline", children: trimmed })] }))] }));
}
export const inputsComponent = ({ rpcTxnData, checkForSpentInput = false, }) => (_jsxs("section", { className: "w-full", children: [_jsx("h2", { className: "mb-2 text-base sm:text-lg font-semibold dark:text-white", children: "Inputs" }), _jsx("div", { className: "relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm", children: _jsxs("table", { className: "w-full text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/80 dark:text-gray-300", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-4 py-3", children: "Outpoint" }), _jsx("th", { scope: "col", className: "px-4 py-3 hidden sm:table-cell", children: "Script sig" })] }) }), _jsx("tbody", { children: rpcTxnData?.vin?.map((input, ind) => (_jsxs("tr", { className: "bg-white border-b last:border-0 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40", children: [_jsx("td", { className: "px-4 py-3", children: input.coinbase ? (_jsx("span", { className: "inline-flex rounded px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", children: "Coinbase" })) : (_jsx(InputRevCell, { utxo: `${input.txid}:${input.vout}`, checkForSpentInput: checkForSpentInput })) }), _jsx("td", { className: "px-4 py-3 break-all font-mono text-xs hidden sm:table-cell max-w-md truncate", title: input.scriptSig?.asm || input.coinbase, children: input.coinbase
                                        ? truncateMiddle(String(input.coinbase), 16, 8)
                                        : input.scriptSig?.asm || '—' })] }, `${input.txid}|${ind}`))) })] }) })] }));
const envTable = (env) => (_jsx("div", { className: "relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8", children: _jsxs("table", { className: "w-full text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/80 dark:text-gray-300", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-4 py-3", children: "Name" }), _jsx("th", { scope: "col", className: "px-4 py-3", children: "Revision" })] }) }), _jsx("tbody", { children: Object.entries(env).map(([name, output]) => (_jsxs("tr", { className: "bg-white border-b last:border-0 dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-4 py-3 font-medium text-gray-900 dark:text-white", children: name }), _jsx("td", { className: "px-4 py-3", children: _jsx(Link, { to: `/objects/${output}`, className: "font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs break-all", children: output }) })] }, output))) })] }) }));
export const transitionComponent = ({ transition }) => (_jsxs("section", { className: "w-full space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "mb-2 text-base sm:text-lg font-semibold dark:text-white", children: "Expression" }), _jsx(ExpressionCard, { content: transition.exp, env: transition.env })] }), _jsxs("div", { children: [_jsx("h2", { className: "mb-2 text-base sm:text-lg font-semibold dark:text-white", children: "Environment" }), Object.keys(transition.env || {}).length > 0 ? (envTable(transition.env)) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: "No environment bindings." }))] }), transition.mod && (_jsxs("div", { children: [_jsx("h2", { className: "mb-2 text-base sm:text-lg font-semibold dark:text-white", children: "Module" }), _jsx("div", { className: "mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3", children: _jsx(Link, { to: `/modules/${transition.mod}`, className: "font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline break-all", children: transition.mod }) })] }))] }));
function TxSummary({ rpcTxnData, txn }) {
    const confirmations = rpcTxnData?.confirmations;
    const blockHeight = rpcTxnData?.blockheight;
    const blockHash = rpcTxnData?.blockhash;
    const time = rpcTxnData?.time || rpcTxnData?.blocktime;
    const vinCount = rpcTxnData?.vin?.length ?? 0;
    const voutCount = rpcTxnData?.vout?.length ?? 0;
    const confirmed = typeof confirmations === 'number' && confirmations > 0;
    return (_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4", children: [_jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Status" }), confirmed ? (_jsxs("span", { className: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", children: ["Confirmed", typeof confirmations === 'number' ? ` · ${confirmations}` : ''] })) : (_jsx("span", { className: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", children: "Mempool" }))] }), _jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Block" }), blockHash ? (_jsx(Link, { to: `/block/${blockHash}`, className: "text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline", children: blockHeight != null ? `#${blockHeight}` : truncateMiddle(blockHash, 8, 6) })) : (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "\u2014" }))] }), _jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Time" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: time ? new Date(time * 1000).toLocaleString() : '—' })] }), _jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "I/O" }), _jsxs("p", { className: "text-sm font-medium text-gray-900 dark:text-white tabular-nums", children: [vinCount, " in \u00B7 ", voutCount, " out"] })] }), _jsxs("div", { className: "col-span-2 sm:col-span-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 shadow-sm", children: [_jsx("p", { className: "text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Transaction ID" }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("p", { className: "font-mono text-xs sm:text-sm text-gray-900 dark:text-white break-all flex-1", children: txn }), _jsx(CopyIconButton, { text: txn })] })] })] }));
}
export function TransactionComponent() {
    const location = useLocation();
    const params = useParams();
    const computer = useContext(ComputerContext);
    const [txn, setTxn] = useState(params.txn);
    const [txnData, setTxnData] = useState(null);
    const [rpcTxnData, setRPCTxnData] = useState(null);
    const [transition, setTransition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transitionError, setTransitionError] = useState(false);
    useEffect(() => {
        const fetch = async () => {
            if (!params.txn)
                return;
            setTxn(params.txn);
            setLoading(true);
            setError(null);
            setTxnData(null);
            setRPCTxnData(null);
            setTransition(null);
            setTransitionError(false);
            try {
                const [hex] = await computer.db.wallet.restClient.getRawTxs([params.txn]);
                const tx = BCTransaction.fromHex(hex);
                setTxnData(tx);
                try {
                    const { result } = await computer.rpc('getrawtransaction', `${params.txn} 2`);
                    setRPCTxnData(result);
                }
                catch (rpcErr) {
                    console.warn('RPC getrawtransaction failed:', rpcErr);
                }
            }
            catch (err) {
                console.error('Failed to fetch transaction:', err);
                setError(err instanceof Error ? err.message : 'Failed to load transaction');
            }
            finally {
                setLoading(false);
            }
        };
        fetch();
    }, [computer, params.txn, location]);
    useEffect(() => {
        const fetch = async () => {
            try {
                if (txnData) {
                    const decoded = await computer.decode(txnData);
                    setTransition(decoded);
                    setTransitionError(false);
                }
            }
            catch {
                setTransition(null);
                setTransitionError(true);
            }
        };
        fetch();
    }, [computer, txnData]);
    if (!txn) {
        return (_jsx("div", { className: "w-full py-8 text-center", children: _jsx("p", { className: "text-red-600 dark:text-red-400", children: "Transaction ID not found in URL" }) }));
    }
    return (_jsxs("div", { className: "w-full space-y-4", children: [_jsxs("header", { children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5", children: "Transaction" }), _jsx("h1", { className: "text-xl sm:text-2xl font-semibold dark:text-white", children: "Details" })] }), loading ? (_jsxs("div", { className: "space-y-4 animate-pulse", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [1, 2, 3, 4].map((i) => (_jsx("div", { className: "h-20 rounded-xl bg-gray-200 dark:bg-gray-700" }, i))) }), _jsx("div", { className: "h-40 rounded-xl bg-gray-200 dark:bg-gray-700" })] })) : null, error && !loading ? (_jsxs("div", { className: "rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-5", children: [_jsx("p", { className: "font-semibold text-red-800 dark:text-red-300 mb-1", children: "Transaction not found" }), _jsx("p", { className: "text-sm text-red-700 dark:text-red-400 mb-3", children: error }), _jsx("p", { className: "text-xs font-mono break-all text-red-600/80 dark:text-red-400/80", children: txn }), _jsxs("p", { className: "mt-3 text-sm text-gray-600 dark:text-gray-400", children: ["Tip: 64-character hex values are treated as transaction ids. To filter objects by owner public key, use a compressed key (66 hex, starting with 02/03) or open", ' ', _jsx("code", { className: "text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded", children: "/?publicKey=\u2026" }), "."] })] })) : null, !loading && !error && rpcTxnData ? _jsx(TxSummary, { rpcTxnData: rpcTxnData, txn: txn }) : null, !loading && !error && !rpcTxnData && txnData ? (_jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4 shadow-sm", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("p", { className: "font-mono text-xs sm:text-sm break-all flex-1 dark:text-white", children: txn }), _jsx(CopyIconButton, { text: txn })] }), _jsx("p", { className: "mt-2 text-sm text-amber-700 dark:text-amber-400", children: "Loaded raw transaction; RPC details unavailable." })] })) : null, !loading && !error && transition ? transitionComponent({ transition }) : null, !loading && !error && transitionError ? (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No Bitcoin Computer expression on this transaction (plain payment or non-BC payload)." })) : null, !loading && !error && rpcTxnData?.vin
                ? inputsComponent({ rpcTxnData, checkForSpentInput: false })
                : null, !loading && !error && rpcTxnData?.vout
                ? outputsComponent({ rpcTxnData, txn })
                : null] }));
}
export const Transaction = { Component: TransactionComponent };
