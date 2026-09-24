import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const variantClasses = {
    error: 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
    warning: 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
    info: 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300',
    success: 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300',
};
export function InlineAlert({ variant = 'error', title, children, className = '', onDismiss, }) {
    const isAssertive = variant === 'error';
    return (_jsx("div", { className: `rounded-lg border p-3 text-sm ${variantClasses[variant]} ${className}`, role: isAssertive ? 'alert' : 'status', "aria-live": isAssertive ? 'assertive' : 'polite', children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [title ? _jsx("p", { className: "font-semibold mb-0.5", children: title }) : null, _jsx("div", { children: children })] }), onDismiss ? (_jsx("button", { type: "button", onClick: onDismiss, className: "shrink-0 text-current opacity-70 hover:opacity-100 p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-current/30", "aria-label": "Dismiss", children: _jsx("svg", { className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": true, children: _jsx("path", { d: "M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" }) }) })) : null] }) }));
}
export function FieldError({ children, id }) {
    if (!children)
        return null;
    return (_jsx("p", { id: id, className: "mt-1 text-xs text-red-600 dark:text-red-400", role: "alert", children: children }));
}
