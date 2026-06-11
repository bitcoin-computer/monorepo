import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Dropdown, initFlowbite, } from 'flowbite';
export const TypeSelectionDropdown = ({ id, onSelectMethod, dropdownList, selectedType }) => {
    const [dropDown, setDropdown] = useState();
    const [type, setType] = useState(selectedType || 'Type');
    const [dropdownSelectionList] = useState(dropdownList);
    useEffect(() => {
        initFlowbite();
        const $targetEl = document.getElementById(`dropdownMenu${id}`);
        const $triggerEl = document.getElementById(`dropdownButton${id}`);
        const options = {
            placement: 'bottom',
            triggerType: 'click',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
        };
        const instanceOptions = {
            id: `dropdownMenu${id}`,
            override: true,
        };
        setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions));
    }, [id]);
    const handleClick = (clickType) => {
        setType(clickType);
        onSelectMethod(clickType);
        if (dropDown)
            dropDown.hide();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", { id: `dropdownButton${id}`, "data-dropdown-toggle": `dropdownMenu${id}`, className: "flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", type: "button", children: [type, _jsx("svg", { className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 10 6", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 4 4 4-4" }) })] }), _jsx("div", { id: `dropdownMenu${id}`, className: "z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700", children: _jsx("ul", { className: "py-2 text-sm text-gray-700 dark:text-gray-200", "aria-labelledby": `dropdownButton${id}`, children: dropdownSelectionList.map((option, index) => (_jsx("li", { children: _jsx("span", { onClick: () => {
                                handleClick(option);
                            }, className: "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white", children: option }) }, index))) }) })] }));
};
