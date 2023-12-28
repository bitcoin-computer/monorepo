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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal as ModalClass } from 'flowbite';
export var getModal = function (id) {
    var $modalElement = document.querySelector("#".concat(id));
    var modalOptions = {};
    var instanceOptions = { id: id, override: true };
    return new ModalClass($modalElement, modalOptions, instanceOptions);
};
export var ShowModalButton = function (_a) {
    var id = _a.id, text = _a.text;
    return (_jsx("button", __assign({ "data-modal-target": id, "data-modal-show": id, type: "button" }, { children: text })));
};
export var HideModalButton = function (_a) {
    var id = _a.id, text = _a.text;
    return (_jsx("button", __assign({ "data-modal-target": id, "data-modal-hide": id, type: "button" }, { children: text })));
};
export var ToggleModalButton = function (_a) {
    var id = _a.id, text = _a.text;
    return (_jsx("button", __assign({ "data-modal-target": id, "data-modal-toggle": id, type: "button" }, { children: text })));
};
export var Modal = function (_a) {
    var title = _a.title, content = _a.content, id = _a.id;
    return (_jsx("div", __assign({ id: id, tabIndex: -1, "aria-hidden": "true", className: "hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full" }, { children: _jsx("div", __assign({ className: "relative p-4 w-full max-w-2xl max-h-full" }, { children: _jsxs("div", __assign({ className: "relative bg-white rounded-lg shadow dark:bg-gray-700" }, { children: [_jsxs("div", __assign({ className: "flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600" }, { children: [_jsx("h3", __assign({ className: "text-xl font-semibold text-gray-900 dark:text-white" }, { children: title })), _jsxs("button", __assign({ type: "button", className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white", "data-modal-hide": id }, { children: [_jsx("svg", __assign({ className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14" }, { children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" }) })), _jsx("span", __assign({ className: "sr-only" }, { children: "Close modal" }))] }))] })), content()] })) })) })));
};
