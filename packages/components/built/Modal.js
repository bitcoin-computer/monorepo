import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal as ModalClass } from 'flowbite';
var get = function (id) {
    var $modalElement = document.querySelector("#".concat(id));
    var modalOptions = {};
    var instanceOptions = { id: id, override: true };
    return new ModalClass($modalElement, modalOptions, instanceOptions);
};
var showModal = function (id) {
    get(id).show();
};
var hideModal = function (id, onClickClose) {
    get(id).hide();
    if (onClickClose) {
        onClickClose();
    }
};
var toggleModal = function (id) {
    get(id).toggle();
};
var ShowButton = function (_a) {
    var id = _a.id, text = _a.text;
    return (_jsx("button", { "data-modal-target": id, "data-modal-show": id, "data-modal-hide": id, type: "button", children: text }));
};
var HideButton = function (_a) {
    var id = _a.id, text = _a.text;
    return (_jsx("button", { "data-modal-target": id, "data-modal-hide": id, type: "button", children: text }));
};
var ToggleButton = function (_a) {
    var id = _a.id, text = _a.text;
    return (_jsx("button", { "data-modal-target": id, "data-modal-toggle": id, type: "button", children: text }));
};
var Component = function (_a) {
    var title = _a.title, content = _a.content, contentData = _a.contentData, id = _a.id, onClickClose = _a.onClickClose;
    return (_jsx("div", { id: id, tabIndex: -1, "aria-hidden": "true", style: { zIndex: 45 }, className: "hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full", children: _jsx("div", { className: "relative p-4 w-full max-w-sm max-h-full", children: _jsxs("div", { className: "relative bg-white rounded-lg shadow dark:bg-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: title }), _jsxs("button", { type: "button", className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white", "data-modal-hide": id, "data-modal-target": id, onClick: function () { return hideModal(id, onClickClose); }, children: [_jsx("svg", { className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" }) }), _jsx("span", { className: "sr-only", children: "Close modal" })] })] }), content(contentData)] }) }) }));
};
export var Modal = {
    get: get,
    showModal: showModal,
    hideModal: hideModal,
    toggleModal: toggleModal,
    ShowButton: ShowButton,
    HideButton: HideButton,
    ToggleButton: ToggleButton,
    Component: Component,
};
