import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export var Error404 = function (_a) {
    var m = _a.message;
    var Missing = function () { return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600", children: "404" }), _jsx("p", { className: "mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white", children: "Something's missing." }), _jsxs("p", { className: "mb-4 text-lg font-light text-gray-500 dark:text-gray-400", children: ["Sorry, we can't find that page. You'll find lots to explore on the home page.", " "] }), _jsx("a", { href: "/", className: "inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4", children: "Back to Homepage" })] })); };
    var Err = function (_a) {
        var message = _a.message;
        return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600", children: "400" }), _jsx("p", { className: "mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white", children: "Something went wrong." }), _jsx("p", { className: "mb-4 text-lg font-light text-gray-500 dark:text-gray-400", children: message })] }));
    };
    return (_jsx("section", { className: "w-full bg-white dark:bg-gray-900", children: _jsx("div", { className: "py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6", children: _jsx("div", { className: "mx-auto max-w-screen-sm text-center", children: m ? _jsx(Err, { message: m }) : _jsx(Missing, {}) }) }) }));
};
