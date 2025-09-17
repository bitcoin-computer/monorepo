import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { initFlowbite } from 'flowbite';
import { jsonMap, strip, toObject } from './common/utils';
import { useUtilsComponents } from './UtilsContext';
import { ComputerContext } from './ComputerContext';
function HomePageCard({ content }) {
    return (_jsx("div", { className: "block w-72 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700", children: _jsx("pre", { className: "font-normal overflow-auto text-gray-700 dark:text-gray-400 text-xs", children: content() }) }));
}
function ValueComponent({ rev, computer }) {
    const [value, setValue] = useState('loading...');
    const [errorMsg, setMsgError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetch = async () => {
            try {
                const synced = await computer.sync(rev);
                setValue(toObject(jsonMap(strip)(synced)));
            }
            catch (err) {
                if (err instanceof Error)
                    setMsgError(`Error: ${err.message}`);
            }
            setLoading(false);
        };
        fetch();
    }, [computer, rev]);
    const loadingContent = () => (_jsxs(_Fragment, { children: [_jsxs("svg", { "aria-hidden": "true", role: "status", className: "inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), _jsx("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "#1C64F2" })] }), _jsx("span", { className: "loading-smart-contract-span", children: "\u00A0Loading..." })] }));
    return loading ? (_jsx(HomePageCard, { content: loadingContent })) : (_jsx(HomePageCard, { content: () => errorMsg || value }));
}
function FromRevs({ revs, computer }) {
    return (_jsx("div", { className: "flex flex-wrap flex-col max-h-[75vh] gap-4 mb-4 mt-4", children: revs.map((rev) => (_jsx("div", { children: _jsx(Link, { to: `/objects/${rev}`, className: "block font-medium text-blue-600 dark:text-blue-500", children: _jsx(ValueComponent, { rev: rev, computer: computer }) }) }, rev))) }));
}
function Pagination({ isPrevAvailable, handlePrev, isNextAvailable, handleNext }) {
    return (_jsx("nav", { className: "flex items-center justify-between", "aria-label": "Table navigation", children: _jsxs("ul", { className: "inline-flex items-center -space-x-px", children: [_jsx("li", { children: _jsxs("button", { disabled: !isPrevAvailable, onClick: handlePrev, className: "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white", children: [_jsx("span", { className: "sr-only", children: "Previous" }), _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 1 1 5l4 4" }) })] }) }), _jsx("li", { children: _jsxs("button", { disabled: !isNextAvailable, onClick: handleNext, className: "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white", children: [_jsx("span", { className: "sr-only", children: "Next" }), _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 6 10", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 9 4-4-4-4" }) })] }) })] }) }));
}
export default function WithPagination(q) {
    const contractsPerPage = 12;
    const computer = useContext(ComputerContext);
    const { showLoader } = useUtilsComponents();
    const [pageNum, setPageNum] = useState(0);
    const [isNextAvailable, setIsNextAvailable] = useState(true);
    const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0);
    const [showNoAsset, setShowNoAsset] = useState(false);
    const [revs, setRevs] = useState([]);
    const location = useLocation();
    const params = Object.fromEntries(new URLSearchParams(location.search));
    useEffect(() => {
        initFlowbite();
    }, []);
    useEffect(() => {
        const fetch = async () => {
            showLoader(true);
            const query = { ...q, ...params };
            query.offset = contractsPerPage * pageNum;
            query.limit = contractsPerPage + 1;
            query.order = 'DESC';
            const result = await computer.query(query);
            setIsNextAvailable(result.length > contractsPerPage);
            setRevs(result.slice(0, contractsPerPage));
            if (pageNum === 0 && result?.length === 0)
                setShowNoAsset(true);
            showLoader(false);
        };
        fetch();
    }, [computer, pageNum]);
    const handleNext = async () => {
        setIsPrevAvailable(true);
        setPageNum(pageNum + 1);
    };
    const handlePrev = async () => {
        setIsNextAvailable(true);
        if (pageNum - 1 === 0)
            setIsPrevAvailable(false);
        setPageNum(pageNum - 1);
    };
    return (_jsxs("div", { className: "relative sm:rounded-lg pt-4 w-full", children: [_jsx(FromRevs, { revs: revs, computer: computer }), !(pageNum === 0 && revs && revs.length === 0) && (_jsx(Pagination, { revs: revs, isPrevAvailable: isPrevAvailable, handlePrev: handlePrev, isNextAvailable: isNextAvailable, handleNext: handleNext })), pageNum === 0 && revs && revs.length === 0 && showNoAsset && (_jsx("h1", { className: "w-full mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white text-center mx-auto", children: "No Assets" }))] }));
}
export const Gallery = {
    FromRevs,
    WithPagination,
};
