var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Dropdown, initFlowbite, } from 'flowbite';
export var TypeSelectionDropdown = function (_a) {
    var id = _a.id, onSelectMethod = _a.onSelectMethod, dropdownList = _a.dropdownList, selectedType = _a.selectedType;
    var _b = useState(), dropDown = _b[0], setDropdown = _b[1];
    var _c = useState(selectedType || 'Type'), type = _c[0], setType = _c[1];
    var dropdownSelectionList = useState(dropdownList)[0];
    useEffect(function () {
        initFlowbite();
        var $targetEl = document.getElementById("dropdownMenu".concat(id));
        var $triggerEl = document.getElementById("dropdownButton".concat(id));
        var options = {
            placement: 'bottom',
            triggerType: 'click',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
        };
        var instanceOptions = {
            id: "dropdownMenu".concat(id),
            override: true,
        };
        setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions));
    }, [id]);
    var handleClick = function (clickType) {
        setType(clickType);
        onSelectMethod(clickType);
        if (dropDown)
            dropDown.hide();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", __assign({ id: "dropdownButton".concat(id), "data-dropdown-toggle": "dropdownMenu".concat(id), className: "flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700", type: "button" }, { children: [type, _jsx("svg", __assign({ className: "w-2.5 h-2.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 10 6" }, { children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 4 4 4-4" }) }))] })), _jsx("div", __assign({ id: "dropdownMenu".concat(id), className: "z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700" }, { children: _jsx("ul", __assign({ className: "py-2 text-sm text-gray-700 dark:text-gray-200", "aria-labelledby": "dropdownButton".concat(id) }, { children: dropdownSelectionList.map(function (option, index) { return (_jsx("li", { children: _jsx("span", __assign({ onClick: function () {
                                handleClick(option);
                            }, className: "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" }, { children: option })) }, index)); }) })) }))] }));
};
