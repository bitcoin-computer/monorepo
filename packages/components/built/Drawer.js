import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback, useId } from 'react';
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
const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
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
export function DrawerComponent({ Content, id, title = 'Drawer', }) {
    const [isOpen, setIsOpen] = useState(false);
    const drawerRef = useRef(null);
    const closeBtnRef = useRef(null);
    const previouslyFocused = useRef(null);
    const titleId = useId();
    const close = useCallback(() => {
        const el = drawerRef.current;
        if (el)
            setDrawerOpen(el, false);
    }, []);
    // Body scroll lock while open
    useEffect(() => {
        if (!isOpen)
            return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);
    // Focus management: store trigger, focus close button, restore on close
    useEffect(() => {
        if (isOpen) {
            previouslyFocused.current = document.activeElement;
            // Defer so panel is visible
            requestAnimationFrame(() => {
                closeBtnRef.current?.focus();
            });
        }
        else if (previouslyFocused.current) {
            previouslyFocused.current.focus?.();
            previouslyFocused.current = null;
        }
    }, [isOpen]);
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
        const onKeyDown = (event) => {
            if (drawerElement.classList.contains('translate-x-full'))
                return;
            if (event.key === 'Escape') {
                setDrawerOpen(drawerElement, false);
                return;
            }
            // Focus trap
            if (event.key !== 'Tab')
                return;
            const focusables = Array.from(drawerElement.querySelectorAll(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
            if (focusables.length === 0)
                return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            if (event.shiftKey) {
                if (active === first || !drawerElement.contains(active)) {
                    event.preventDefault();
                    last.focus();
                }
            }
            else if (active === last || !drawerElement.contains(active)) {
                event.preventDefault();
                first.focus();
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
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: `fixed inset-0 z-[45] bg-gray-900/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`, "aria-hidden": !isOpen, onClick: close }), _jsxs("div", { ref: drawerRef, id: id, role: "dialog", "aria-modal": "true", className: "fixed top-0 right-0 z-50 h-[100dvh] max-h-[100dvh] w-full sm:w-96 max-w-[100vw] flex flex-col overflow-hidden transition-transform duration-300 translate-x-full bg-white dark:bg-gray-800 shadow-xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]", tabIndex: -1, "aria-labelledby": titleId, "aria-hidden": "true", children: [_jsxs("div", { className: "sticky top-0 z-10 flex items-center justify-between gap-2 shrink-0 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur", children: [_jsx("h2", { id: titleId, className: "text-lg font-bold text-gray-900 dark:text-white truncate pr-2", children: title }), _jsxs("button", { ref: closeBtnRef, type: "button", "data-drawer-hide": id, "aria-controls": id, onClick: close, className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-9 h-9 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white shrink-0", children: [_jsx("svg", { className: "w-3.5 h-3.5", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14", children: _jsx("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" }) }), _jsx("span", { className: "sr-only", children: "Close" })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto overscroll-contain px-4 py-3", children: Content({ isOpen }) })] })] }));
}
export const Drawer = {
    Component: DrawerComponent,
    ShowDrawer,
};
