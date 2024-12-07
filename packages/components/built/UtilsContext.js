import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { SnackBar } from "./SnackBar";
import { Loader } from "./Loader";
var utilsContext = createContext(undefined);
export var useUtilsComponents = function () {
    var context = useContext(utilsContext);
    if (!context) {
        throw new Error("useUtilsComponents must be used within a UtilsProvider");
    }
    return context;
};
export var UtilsProvider = function (_a) {
    var children = _a.children;
    var _b = useState(null), snackBar = _b[0], setSnackBar = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var showSnackBar = function (message, success) {
        setSnackBar({ message: message, success: success });
    };
    var showLoader = function (show) {
        setIsLoading(show);
    };
    var hideSnackBar = function () {
        setSnackBar(null);
    };
    return (_jsxs(utilsContext.Provider, { value: { showSnackBar: showSnackBar, hideSnackBar: hideSnackBar, showLoader: showLoader }, children: [children, snackBar && (_jsx(SnackBar, { message: snackBar.message, success: snackBar.success, hideSnackBar: hideSnackBar })), isLoading && _jsx(Loader, {})] }));
};
export var UtilsContext = {
    UtilsProvider: UtilsProvider,
    useUtilsComponents: useUtilsComponents
};
