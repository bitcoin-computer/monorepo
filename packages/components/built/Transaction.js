import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { Transaction as BCTransaction } from '@bitcoin-computer/lib';
import { Card } from './Card';
import { ComputerContext } from './ComputerContext';
import { HiOutlineRefresh } from 'react-icons/hi';
function ExpressionCard({ content, env }) {
    const entries = Object.entries(env);
    let formattedContent = content;
    entries.forEach((entry) => {
        const [name, rev] = entry;
        const regExp = new RegExp(`(${name})`, 'g');
        const replacer = (n, ind) => (_jsx(Link, { to: `/objects/${rev}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: n }, `${rev}|${ind}`));
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
            catch (err) {
                // console.error('Error fetching spends:', err)
                setSpends(undefined);
            }
            finally {
                setLoading(false);
            }
        };
        fetchSpends();
    }, [computer, utxo]);
    if (loading) {
        return _jsx(HiOutlineRefresh, { className: "animate-spin text-blue-600 dark:text-blue-500" });
    }
    if (!spends) {
        return _jsx("span", { children: "N/A" });
    }
    const [spTxid, spVout] = spends.split(':');
    const trimmed = spTxid ? `${spTxid.slice(0, 6)}...${spTxid.slice(-4)}:${spVout || ''}` : spends;
    return (_jsxs(Link, { to: `/objects/${spends}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", trimmed] }));
}
export const outputsComponent = ({ rpcTxnData, txn, }) => (_jsxs("div", { className: "relative overflow-x-auto", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Objects" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Number" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Value" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Type" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script PubKey" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Spent By" })] }) }), _jsx("tbody", { children: rpcTxnData?.vout?.map((output) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsxs(Link, { to: `/objects/${txn}:${output.n}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", output.n] }) }), _jsx("td", { className: "px-6 py-4", children: output.value }), _jsx("td", { className: "px-6 py-4", children: output.scriptPubKey.type }), _jsx("td", { className: "px-6 py-4 break-all", children: output.scriptPubKey.asm }), _jsx("td", { className: "px-6 py-4", children: txn ? _jsx(SpendsCell, { utxo: `${txn}:${output.n}` }) : _jsx("span", { children: "N/A" }) })] }, output.n))) })] })] }));
function InputRevCell({ utxo, checkForSpentInput }) {
    const computer = useContext(ComputerContext);
    const [spends, setSpends] = useState(null); // null: loading, undefined: not spent or no check, string: spent
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
        ? 'font-medium text-red-600 dark:text-red-500 hover:underline'
        : 'font-medium text-blue-600 dark:text-blue-500 hover:underline';
    let trimmed = '';
    let spendingTxId = '';
    if (isSpent) {
        const [txId, vIn] = spends.split(':');
        spendingTxId = txId;
        trimmed = `${txId.slice(0, 6)}...${txId.slice(-4)}:${vIn || ''}`;
    }
    return (_jsxs("div", { className: "relative group inline-block", children: [_jsx(Link, { to: `/objects/${utxo}`, className: linkClass, children: utxo }), isLoading && (_jsx(HiOutlineRefresh, { className: "inline ml-2 animate-spin text-blue-600 dark:text-blue-500" })), isSpent && (_jsxs("div", { className: "absolute left-1/2 z-10 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700 group-hover:opacity-100 bottom-full -translate-x-1/2 mb-3", children: ["this input have been spent in this transaction", ' ', _jsx(Link, { to: `/transactions/${spendingTxId}`, className: "font-medium text-blue-400 hover:underline", children: trimmed })] }))] }));
}
export const inputsComponent = ({ rpcTxnData, checkForSpentInput = false, }) => (_jsxs("div", { className: "relative overflow-x-auto sm:rounded-lg", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Inputs" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Input Rev" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script" })] }) }), _jsx("tbody", { children: rpcTxnData?.vin?.map((input, ind) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsx(InputRevCell, { utxo: `${input.txid}:${input.vout}`, checkForSpentInput: checkForSpentInput }) }), _jsx("td", { className: "px-6 py-4 break-all", children: input.scriptSig?.asm })] }, `${input.txid}|${ind}`))) })] })] }));
const envTable = (env) => (_jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 break-keep", children: "Output" })] }) }), _jsx("tbody", { children: Object.entries(env).map(([name, output]) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: name }), _jsx("td", { className: "px-6 py-4", children: _jsx(Link, { to: `/objects/${output}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: output }) })] }, output))) })] }));
export const transitionComponent = ({ transition }) => (_jsxs("div", { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Expression" }), _jsx(ExpressionCard, { content: transition.exp, env: transition.env }), _jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Environment" }), envTable(transition.env), transition.mod && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Module Specifier" }), _jsx(Card, { content: transition.mod })] }))] }));
export function TransactionComponent() {
    const location = useLocation();
    const params = useParams();
    const computer = useContext(ComputerContext);
    const [txn, setTxn] = useState(params.txn);
    const [txnData, setTxnData] = useState(null);
    const [rpcTxnData, setRPCTxnData] = useState(null);
    const [transition, setTransition] = useState(null);
    useEffect(() => {
        const fetch = async () => {
            setTxn(params.txn);
            const [hex] = await computer.db.wallet.restClient.getRawTxs([params.txn]);
            const tx = BCTransaction.fromHex(hex);
            setTxnData(tx);
            const { result } = await computer.rpcCall('getrawtransaction', `${params.txn} 2`);
            setRPCTxnData(result);
        };
        fetch();
    }, [computer, txn, location, params.txn]);
    useEffect(() => {
        const fetch = async () => {
            try {
                if (txnData)
                    setTransition(await computer.decode(txnData));
            }
            catch (err) {
                if (err instanceof Error) {
                    setTransition('');
                }
            }
        };
        fetch();
    }, [computer, txnData, txn]);
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "pt-8", children: [_jsx("h1", { className: "mb-2 text-5xl font-extrabold dark:text-white", children: "Transaction" }), _jsx("p", { className: "mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400", children: txn }), transition && transitionComponent({ transition }), rpcTxnData?.vin && inputsComponent({ rpcTxnData, checkForSpentInput: false }), rpcTxnData?.vout && outputsComponent({ rpcTxnData, txn })] }) }));
}
export const Transaction = { Component: TransactionComponent };
