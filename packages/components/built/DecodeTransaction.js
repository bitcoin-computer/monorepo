import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Transaction as BCTransaction } from '@bitcoin-computer/lib';
import { ComputerContext } from './ComputerContext';
import { inputsComponent, outputsComponent, transitionComponent } from './Transaction';
export function DecodedransactionComponent() {
    const location = useLocation();
    const params = useParams();
    const computer = useContext(ComputerContext);
    const [txnData, setTxnData] = useState(null);
    const [rpcTxnData, setRPCTxnData] = useState(null);
    const [transition, setTransition] = useState(null);
    useEffect(() => {
        const fetch = async () => {
            const txnDeserialized = BCTransaction.deserialize(params.txn);
            setTxnData(txnDeserialized);
            const { result } = await computer.rpcCall('decoderawtransaction', `${txnDeserialized.toHex()} false`);
            setRPCTxnData(result);
        };
        fetch();
    }, [computer, location, params.txn]);
    useEffect(() => {
        const fetch = async () => {
            try {
                if (txnData) {
                    setTransition(await computer.decode(txnData));
                }
            }
            catch (err) {
                if (err instanceof Error) {
                    setTransition('');
                }
            }
        };
        fetch();
    }, [computer, txnData]);
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "pt-8", children: [_jsx("h1", { className: "mb-2 text-5xl font-extrabold dark:text-white", children: "Decoded Transaction" }), transition && transitionComponent({ transition }), rpcTxnData?.vin && inputsComponent({ rpcTxnData, checkForSpentInput: true }), rpcTxnData?.vout && outputsComponent({ rpcTxnData, txn: undefined })] }) }));
}
export const Decodedransaction = { Component: DecodedransactionComponent };
