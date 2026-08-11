import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
function setDrawerOpen(el, open) {
    if (open) {
        el.classList.remove('translate-x-full');
        el.setAttribute('aria-hidden', 'false');
    }
    else {
        el.classList.add('translate-x-full');
        el.setAttribute('aria-hidden', 'true');
    }
    el.dispatchEvent(new CustomEvent('bc-drawer-change', { detail: { open }, bubbles: true }));
}
export function ShowDrawer({ text, id }) {
    const open = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const el = document.getElementById(id);
        if (el)
            setDrawerOpen(el, true);
    };
    return (_jsx("button", { type: "button", "data-drawer-target": id, "data-drawer-show": id, "data-drawer-placement": "right", "aria-controls": id, onClick: open, className: "bg-transparent border-0 p-0 m-0 font-inherit text-inherit cursor-pointer", children: text }));
}
export function DrawerComponent({ Content, id, }) {
    const [isOpen, setIsOpen] = useState(false);
    const drawerRef = useRef(null);
    const close = useCallback(() => {
        const el = drawerRef.current;
        if (el)
            setDrawerOpen(el, false);
    }, []);
    useEffect(() => {
        const drawerElement = drawerRef.current;
        if (!drawerElement)
            return undefined;
        const onChange = (event) => {
            const detail = event.detail;
            if (detail && typeof detail.open === 'boolean') {
                setIsOpen(detail.open);
                return;
            }
            setIsOpen(!drawerElement.classList.contains('translate-x-full'));
        };
        const onTransitionEnd = (event) => {
            if (event.propertyName === 'transform') {
                setIsOpen(!drawerElement.classList.contains('translate-x-full'));
            }
        };
        // Escape key closes
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && !drawerElement.classList.contains('translate-x-full')) {
                setDrawerOpen(drawerElement, false);
            }
        };
        drawerElement.addEventListener('bc-drawer-change', onChange);
        drawerElement.addEventListener('transitionend', onTransitionEnd);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            drawerElement.removeEventListener('bc-drawer-change', onChange);
            drawerElement.removeEventListener('transitionend', onTransitionEnd);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: `fixed inset-0 z-[45] bg-gray-900/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`, "aria-hidden": !isOpen, onClick: close }), _jsxs("div", { ref: drawerRef, id: id, className: "fixed top-0 right-0 z-50 h-screen p-4 overflow-y-auto transition-transform duration-300 translate-x-full bg-white w-80 max-w-[100vw] dark:bg-gray-800 shadow-xl", tabIndex: -1, "aria-labelledby": "drawer-right-label", "aria-hidden": "true", children: [_jsxs("button", { type: "button", "data-drawer-hide": id, "aria-controls": id, onClick: close, className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white", children: [_jsx("svg", { className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" }) }), _jsx("span", { className: "sr-only", children: "Close menu" })] }), Content({ isOpen })] })] }));
}
export const Drawer = {
    Component: DrawerComponent,
    ShowDrawer,
};
