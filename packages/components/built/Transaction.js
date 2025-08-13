import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';
import { Transaction as BCTransaction } from '@bitcoin-computer/lib';
import { Card } from './Card';
import { ComputerContext } from './ComputerContext';
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
function Component() {
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
                    console.log('Error parsing transaction', err.message);
                }
            }
        };
        fetch();
    }, [computer, txnData, txn]);
    const envTable = (env) => (_jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 break-keep", children: "Output" })] }) }), _jsx("tbody", { children: Object.entries(env).map(([name, output]) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: name }), _jsx("td", { className: "px-6 py-4", children: _jsx(Link, { to: `/objects/${output}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: output }) })] }, output))) })] }));
    const transitionComponent = () => (_jsxs("div", { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Expression" }), _jsx(ExpressionCard, { content: transition.exp, env: transition.env }), _jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Environment" }), envTable(transition.env), transition.mod && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Module Specifier" }), _jsx(Card, { content: transition.mod })] }))] }));
    const inputsComponent = () => (_jsxs("div", { className: "relative overflow-x-auto sm:rounded-lg", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Inputs" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Transaction Id" }), _jsx("th", { scope: "col", className: "px-6 py-3 break-keep", children: "Output Number" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script" })] }) }), _jsx("tbody", { children: rpcTxnData?.vin?.map((input, ind) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsx(Link, { to: `/transactions/${input.txid}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: input.txid }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs(Link, { to: `/objects/${input.txid}:${input.vout}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", input.vout] }) }), _jsx("td", { className: "px-6 py-4 break-all", children: input.scriptSig?.asm })] }, `${input.txid}|${ind}`))) })] })] }));
    const outputsComponent = () => (_jsxs("div", { className: "relative overflow-x-auto", children: [_jsx("h2", { className: "mb-2 text-4xl font-bold dark:text-white", children: "Objects" }), _jsxs("table", { className: "w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400", children: [_jsx("thead", { className: "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3", children: "Number" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Value" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Type" }), _jsx("th", { scope: "col", className: "px-6 py-3", children: "Script PubKey" })] }) }), _jsx("tbody", { children: rpcTxnData?.vout?.map((output) => (_jsxs("tr", { className: "bg-white border-b dark:bg-gray-800 dark:border-gray-700", children: [_jsx("td", { className: "px-6 py-4 break-all", children: _jsxs(Link, { to: `/objects/${txn}:${output.n}`, className: "font-medium text-blue-600 dark:text-blue-500 hover:underline", children: ["#", output.n] }) }), _jsx("td", { className: "px-6 py-4", children: output.value }), _jsx("td", { className: "px-6 py-4", children: output.scriptPubKey.type }), _jsx("td", { className: "px-6 py-4 break-all", children: output.scriptPubKey.asm })] }, output.n))) })] })] }));
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "pt-8", children: [_jsx("h1", { className: "mb-2 text-5xl font-extrabold dark:text-white", children: "Transaction" }), _jsx("p", { className: "mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400", children: txn }), transition && transitionComponent(), rpcTxnData?.vin && inputsComponent(), rpcTxnData?.vout && outputsComponent()] }) }));
}
export const Transaction = { Component };
